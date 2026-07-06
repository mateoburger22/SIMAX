'use server';

/* ========================================================================
   app/checkout/actions.js
   Server Action que CONFIRMA la compra. Crítica: nunca confiamos en
   precios ni cantidades que viajan en el form (los podría tocar el
   usuario en el cliente). Re-leemos cart_items + productos en el server
   y calculamos el total acá.

   Pasos:
     1. Validar sesión (RLS ya lo hace, pero queremos un error claro).
     2. Validar los datos de envío (presencia + formato, server-side).
     3. Leer cart_items joineando productos. Si vacío → error.
     4. Crear la fila en `orders` (o REUSAR la 'pendiente' del usuario,
        para que reintentar el checkout no duplique órdenes).
     5. Insertar las filas en `order_items` (snapshot histórico).
     6. Crear la PREFERENCIA en Mercado Pago (Checkout Pro).
     7. Redirigir al usuario a la pasarela de MP (init_point).

   OJO: el carrito NO se vacía acá. Se vacía recién cuando el pago queda
   'approved' (lo hace el webhook /api/mp/webhook, o el respaldo de la página
   de confirmación). Así, si el usuario cancela el pago, no pierde el carrito.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mpClient } from '@/lib/mercadopago';
import { isValidEmail, isValidPostalCode, isValidPhone } from '@/lib/validators';

export async function placeOrderAction(_prevState, formData) {
    // 0) Config: sin una URL pública válida, MP no puede armar los back_urls
    //    ni el webhook. Mejor fallar temprano y con log claro que con el
    //    error genérico de MP.
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (!site || !site.startsWith('http')) {
        console.error(
            '[checkout] NEXT_PUBLIC_SITE_URL falta o no es una URL:',
            site
        );
        return { error: 'El checkout no está configurado. Avisanos por contacto.' };
    }

    const supabase = await createClient();

    // 1) Sesión
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Tu sesión expiró. Iniciá sesión de nuevo.' };
    }

    // 2) Datos de envío del form: presencia + formato (el server re-valida
    //    siempre; lo que valida el navegador se puede saltear con F12).
    const shipping = {
        shipping_full_name: String(formData.get('nombre') ?? '').trim(),
        shipping_email: String(formData.get('email') ?? '').trim(),
        shipping_phone: String(formData.get('telefono') ?? '').trim(),
        shipping_address: String(formData.get('direccion') ?? '').trim(),
        shipping_city: String(formData.get('ciudad') ?? '').trim(),
        shipping_postal_code: String(formData.get('cp') ?? '').trim(),
    };
    if (Object.values(shipping).some((v) => !v)) {
        return { error: 'Completá todos los datos de envío.' };
    }
    if (!isValidEmail(shipping.shipping_email)) {
        return { error: 'El email no tiene un formato válido.' };
    }
    if (!isValidPhone(shipping.shipping_phone)) {
        return { error: 'El teléfono no tiene un formato válido.' };
    }
    if (!isValidPostalCode(shipping.shipping_postal_code)) {
        return { error: 'El código postal debe ser tipo 1425 o C1425DKE.' };
    }

    // 3) Carrito real (server-side, ignoramos el cliente)
    const { data: cart, error: cartError } = await supabase
        .from('cart_items')
        .select('quantity, productos (id, sku, name, price)')
        .order('id', { ascending: true });

    if (cartError) {
        return { error: 'No pudimos leer tu carrito. Probá de nuevo.' };
    }
    const validCart = (cart ?? []).filter((row) => row.productos);
    if (validCart.length === 0) {
        return { error: 'Tu carrito está vacío.' };
    }

    // 4) Total calculado con los precios CANÓNICOS de la DB
    const total = validCart.reduce(
        (acc, row) => acc + row.productos.price * row.quantity,
        0
    );

    // 5) Crear la orden... o REUSAR la 'pendiente' que ya tenga el usuario.
    //    Como el carrito no se vacía hasta que el pago se aprueba, reintentar
    //    el checkout (doble click, dos pestañas, volver de MP sin pagar)
    //    crearía órdenes duplicadas. Reusando la pendiente, cada usuario
    //    tiene a lo sumo UNA orden esperando pago.
    const admin = createAdminClient();
    const { data: pendings } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pendiente')
        .order('id', { ascending: false })
        .limit(1);

    let orderId;
    if (pendings && pendings.length > 0) {
        // Reuso: piso datos de envío y total, y regenero los items abajo.
        // Va por admin porque el usuario no tiene política de UPDATE/DELETE
        // sobre orders/order_items (a propósito: solo el server decide esto).
        orderId = pendings[0].id;
        const { error: updateError } = await admin
            .from('orders')
            .update({ total, ...shipping })
            .eq('id', orderId)
            .eq('status', 'pendiente');
        if (updateError) {
            return { error: 'No pudimos crear el pedido. Probá de nuevo.' };
        }
        const { error: wipeError } = await admin
            .from('order_items')
            .delete()
            .eq('order_id', orderId);
        if (wipeError) {
            return { error: 'No pudimos crear el pedido. Probá de nuevo.' };
        }
    } else {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pendiente',
                total,
                ...shipping,
            })
            .select('id')
            .single();

        if (orderError || !order) {
            return { error: 'No pudimos crear el pedido. Probá de nuevo.' };
        }
        orderId = order.id;
    }

    // 6) Insertar los items (copia histórica de sku/name/price)
    const itemsToInsert = validCart.map((row) => ({
        order_id: orderId,
        producto_id: row.productos.id,
        sku: row.productos.sku,
        name: row.productos.name,
        price: row.productos.price,
        quantity: row.quantity,
    }));
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        // La orden ya existe pero sin items: borramos para que no quede huérfana.
        await admin.from('orders').delete().eq('id', orderId);
        return { error: 'No pudimos guardar los productos del pedido.' };
    }

    // 7) Crear la preferencia de pago en Mercado Pago (Checkout Pro).
    //    external_reference = id de nuestra orden: es el hilo que nos permite,
    //    cuando MP nos avise del pago, saber A QUÉ orden corresponde.
    let initPoint;
    try {
        const preference = await new Preference(mpClient()).create({
            body: {
                items: validCart.map((row) => ({
                    id: String(row.productos.id),
                    title: row.productos.name,
                    quantity: row.quantity,
                    unit_price: row.productos.price,
                    currency_id: 'ARS',
                })),
                external_reference: String(orderId),
                // A dónde vuelve el usuario según el resultado del pago. Siempre
                // a la confirmación: ahí mostramos el estado y verificamos.
                back_urls: {
                    success: `${site}/confirmacion/${orderId}`,
                    pending: `${site}/confirmacion/${orderId}`,
                    failure: `${site}/confirmacion/${orderId}`,
                },
                // MP redirige solo al aprobarse (sin que el usuario toque "volver").
                auto_return: 'approved',
                // URL server-a-servidor donde MP nos notifica el pago.
                notification_url: `${site}/api/mp/webhook`,
                // No mandamos `payer`: dejamos que MP tome al pagador de la
                // sesión (comprador de prueba o invitado). Fijar payer.email acá
                // choca con el comprador logueado y puede DESHABILITAR el botón
                // de pagar en el sandbox.
            },
        });

        // Siempre usamos init_point (www.mercadopago.com.ar). En el modelo
        // actual de MP se testea acá mismo, logueado con usuarios de PRUEBA;
        // el viejo sandbox_init_point (sandbox.mercadopago.com.ar) está
        // deprecado y entra en loop de redirecciones (ERR_TOO_MANY_REDIRECTS).
        // Dejamos un escape a sandbox_init_point solo si alguien fuerza
        // MP_USE_SANDBOX=true, pero por defecto NO se usa.
        const useSandbox = process.env.MP_USE_SANDBOX === 'true';
        initPoint =
            useSandbox && preference.sandbox_init_point
                ? preference.sandbox_init_point
                : preference.init_point;

        // Guardamos el id de preferencia para trazabilidad. Va por el cliente
        // admin porque `orders` no tiene política de UPDATE para el usuario.
        await admin
            .from('orders')
            .update({ mp_preference_id: preference.id })
            .eq('id', orderId);
    } catch (mpError) {
        // Logueamos el error REAL (se ve en Vercel) para no depurar a ciegas;
        // al usuario le mostramos un mensaje simple.
        console.error('[checkout] error creando la preferencia de MP:', mpError);
        // Si MP falla, la orden 'pendiente' quedaría huérfana: la borramos
        // (order_items cae por ON DELETE CASCADE). Admin porque el usuario no
        // tiene política de DELETE sobre orders.
        await admin.from('orders').delete().eq('id', orderId);
        return {
            error: 'No pudimos iniciar el pago con Mercado Pago. Probá de nuevo.',
        };
    }

    // 8) Mandar al usuario a pagar. redirect() lanza, así que va FUERA del try.
    redirect(initPoint);
}

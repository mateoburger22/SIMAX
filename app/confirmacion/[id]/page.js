/* ========================================================================
   app/confirmacion/[id]/page.js
   Página de confirmación dinámica. La ruta es /confirmacion/123 donde 123
   es el id de la orden recién creada.

   Es Server Component asíncrono: lee `orders` + `order_items` desde
   Supabase. RLS asegura que solo el dueño puede leer su orden — si otro
   usuario escribe un id ajeno en la URL, la query devuelve null y
   mostramos 404.
   ======================================================================== */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Payment } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mpClient } from '@/lib/mercadopago';
import { formatPrice } from '@/data/productos';
import styles from './page.module.css';

// Título neutro: esta página también se muestra cuando el pago sigue
// pendiente, así que no puede afirmar "confirmado" (el h1 sí es dinámico).
export const metadata = {
    title: 'Tu pedido — Polytape',
};

export default async function Confirmacion({ params, searchParams }) {
    const { id } = await params;
    const sp = await searchParams;
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) notFound();

    const supabase = await createClient();

    // Sin sesión no podemos validar que el pedido sea suyo → /login.
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: order } = await supabase
        .from('orders')
        .select(
            'id, status, total, created_at, shipping_full_name, shipping_address, shipping_city, shipping_postal_code'
        )
        .eq('id', orderId)
        .maybeSingle();

    // Si la orden no existe o no es del usuario actual (RLS la oculta),
    // mostramos 404 para no filtrar la existencia de ids ajenos.
    if (!order) notFound();

    // Respaldo por redirect: si la orden sigue 'pendiente' y MP nos devolvió
    // con datos del pago en la URL (auto_return agrega payment_id/collection_id),
    // verificamos el pago contra la API de MP y actualizamos. Esto cubre el caso
    // de que el webhook tarde o no llegue. Igual que en el webhook, la fuente de
    // verdad es la consulta a MP, no los query params (que podrían falsearse).
    if (order.status === 'pendiente') {
        const paymentId = sp?.payment_id ?? sp?.collection_id;
        if (paymentId) {
            try {
                const payment = await new Payment(mpClient()).get({
                    id: paymentId,
                });
                if (
                    payment.status === 'approved' &&
                    String(payment.external_reference) === String(order.id)
                ) {
                    const admin = createAdminClient();
                    const { data: updated } = await admin
                        .from('orders')
                        .update({
                            status: 'pagada',
                            mp_payment_id: String(payment.id),
                        })
                        .eq('id', order.id)
                        .eq('status', 'pendiente') // idempotente vs. el webhook
                        .select('user_id')
                        .maybeSingle();
                    if (updated) {
                        await admin
                            .from('cart_items')
                            .delete()
                            .eq('user_id', updated.user_id);
                        order.status = 'pagada'; // reflejarlo en esta misma página
                    }
                }
            } catch {
                // Si la verificación falla, dejamos la orden como está: el
                // webhook la actualizará. No rompemos la página de confirmación.
            }
        }
    }

    const { data: items } = await supabase
        .from('order_items')
        .select('sku, name, price, quantity')
        .eq('order_id', orderId)
        .order('id', { ascending: true });

    const fecha = new Date(order.created_at).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    // El encabezado depende del estado REAL del pago. Una orden 'pendiente'
    // todavía no se pagó (el usuario canceló, volvió sin pagar, o el pago no se
    // acreditó aún), así que no la anunciamos como compra confirmada.
    const pagada = order.status === 'pagada';
    const heading = pagada ? '¡Gracias por tu compra!' : 'Tu pago está pendiente';
    const intro = pagada
        ? `Tu pedido #${order.id} quedó confirmado el ${fecha}. ¡Gracias!`
        : `Registramos tu pedido #${order.id} el ${fecha}, pero todavía no recibimos la confirmación del pago. Si ya pagaste, puede tardar unos minutos en acreditarse.`;

    return (
        <section className={styles.confirmation}>
            <div className={styles.inner}>
                <p className="eyebrow">CIMAT</p>
                <h1>{heading}</h1>
                <p className={styles.intro}>{intro}</p>

                <div className={styles.card}>
                    <h2>Resumen del pedido</h2>
                    <ul className={styles.items}>
                        {(items ?? []).map((item) => (
                            <li key={item.sku} className={styles.item}>
                                <div>
                                    <p className={styles.itemName}>{item.name}</p>
                                    <p className={styles.itemMeta}>
                                        {item.sku} · ×{item.quantity}
                                    </p>
                                </div>
                                <p className={styles.itemPrice}>
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.total}>
                        <span>Total</span>
                        <strong>{formatPrice(order.total)}</strong>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2>Envío</h2>
                    <p>{order.shipping_full_name}</p>
                    <p>
                        {order.shipping_address} — {order.shipping_city} (CP{' '}
                        {order.shipping_postal_code})
                    </p>
                </div>

                <div className={styles.actions}>
                    <Link href="/cuenta/pedidos" className="btn btn-primary">
                        Ver mis pedidos
                    </Link>
                    <Link href="/catalogo" className="btn btn-outline">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </section>
    );
}

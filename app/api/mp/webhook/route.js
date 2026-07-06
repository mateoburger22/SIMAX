/* ========================================================================
   app/api/mp/webhook/route.js
   Webhook de Mercado Pago (POST). MP nos llama servidor-a-servidor cada vez
   que cambia el estado de un pago. NO llega ninguna sesión de usuario, por eso
   trabajamos con el cliente admin (service role) que saltea RLS.

   SEGURIDAD (dos capas):
     a) Firma: si MP_WEBHOOK_SECRET está configurado, verificamos el HMAC
        del header x-signature (lib/mpSignature.js). Una notificación sin
        firma válida se rechaza con 401 antes de tocar nada.
     b) Fuente de verdad: aún con firma válida, nunca confiamos en lo que
        trae la notificación. El body solo dice "mirá el pago X"; nosotros
        consultamos ESE pago directo a la API de MP con nuestro Access Token.

   Flujo:
     1. Sacar el id del pago (viene en el body y/o en el query, según el evento).
     2. Verificar la firma de MP.
     3. Consultar el pago real en MP y mapear su estado a la orden:
          approved            → 'pagada' (verificando además que el MONTO
                                pagado coincida con el total de la orden)
                                + vaciar el carrito del comprador.
          cancelled           → 'cancelada'.
          rejected / pending  → la orden sigue 'pendiente': en Checkout Pro
                                el usuario puede reintentar con otra tarjeta
                                sobre la misma preferencia, así que un rechazo
                                no es definitivo.
        El filtro .eq('status','pendiente') hace la operación IDEMPOTENTE:
        aunque MP reintente la notificación, solo actúa la primera vez.

   Errores de DB: si falla el update crítico devolvemos 500 A PROPÓSITO,
   porque MP reintenta la notificación ante un 500 — así un fallo transitorio
   de la base no deja un pago aprobado sin registrar.
   ======================================================================== */

import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMpSignature } from '@/lib/mpSignature';

export async function POST(request) {
    try {
        const url = new URL(request.url);
        const body = await request.json().catch(() => ({}));

        // El evento puede venir como { type, data: { id } } (body) o como
        // ?type=payment&data.id=... / ?topic=payment&id=... (query).
        const type =
            body?.type ??
            url.searchParams.get('type') ??
            url.searchParams.get('topic');
        const paymentId =
            body?.data?.id ??
            url.searchParams.get('data.id') ??
            url.searchParams.get('id');

        // Solo nos interesan eventos de pago con un id concreto.
        if (type !== 'payment' || !paymentId) {
            return new Response('ignored', { status: 200 });
        }

        // Verificación de firma (capa a).
        const secret = process.env.MP_WEBHOOK_SECRET;
        if (secret) {
            const valid = verifyMpSignature({
                xSignature: request.headers.get('x-signature'),
                xRequestId: request.headers.get('x-request-id'),
                dataId: paymentId,
                secret,
            });
            if (!valid) {
                console.warn(
                    `[mp webhook] firma inválida para pago ${paymentId}: rechazado`
                );
                return new Response('invalid signature', { status: 401 });
            }
        } else {
            console.warn(
                '[mp webhook] MP_WEBHOOK_SECRET no configurado: se acepta la notificación sin verificar firma'
            );
        }

        // Fuente de verdad: el pago según MP (capa b).
        const payment = await new Payment(mpClient()).get({ id: paymentId });
        const orderId = Number(payment.external_reference);
        if (!Number.isInteger(orderId)) {
            console.warn(
                `[mp webhook] pago ${paymentId} sin external_reference numérico: ignorado`
            );
            return new Response('ok', { status: 200 });
        }

        const admin = createAdminClient();

        if (payment.status === 'approved') {
            // Leemos la orden para verificar estado y monto ANTES de aprobar.
            const { data: order, error: readError } = await admin
                .from('orders')
                .select('id, user_id, status, total')
                .eq('id', orderId)
                .maybeSingle();

            if (readError) {
                console.error('[mp webhook] error leyendo la orden:', readError);
                return new Response('db error', { status: 500 }); // MP reintenta
            }
            if (!order) {
                console.warn(`[mp webhook] orden ${orderId} no existe: ignorado`);
                return new Response('ok', { status: 200 });
            }
            if (order.status !== 'pendiente') {
                // Idempotencia: notificación repetida u orden ya resuelta.
                console.log(
                    `[mp webhook] orden ${orderId} ya está '${order.status}': nada que hacer`
                );
                return new Response('ok', { status: 200 });
            }
            // Defensa extra: el monto acreditado debe ser el total de la orden.
            if (Number(payment.transaction_amount) !== Number(order.total)) {
                console.error(
                    `[mp webhook] MONTO NO COINCIDE en orden ${orderId}: ` +
                        `pagado ${payment.transaction_amount}, esperado ${order.total}. ` +
                        `La orden queda 'pendiente' para revisión manual.`
                );
                // 200: reintentar no lo va a arreglar; ya quedó logueado.
                return new Response('amount mismatch', { status: 200 });
            }

            const { data: updated, error: updateError } = await admin
                .from('orders')
                .update({ status: 'pagada', mp_payment_id: String(payment.id) })
                .eq('id', orderId)
                .eq('status', 'pendiente') // idempotencia: solo la 1ra vez
                .select('user_id')
                .maybeSingle();

            if (updateError) {
                console.error(
                    `[mp webhook] error marcando pagada la orden ${orderId}:`,
                    updateError
                );
                return new Response('db error', { status: 500 }); // MP reintenta
            }

            // Recién con el pago aprobado vaciamos el carrito del comprador.
            if (updated) {
                const { error: clearError } = await admin
                    .from('cart_items')
                    .delete()
                    .eq('user_id', updated.user_id);
                if (clearError) {
                    // No crítico (la orden ya quedó pagada): solo lo dejamos logueado.
                    console.error(
                        `[mp webhook] la orden ${orderId} quedó pagada pero no se pudo vaciar el carrito:`,
                        clearError
                    );
                }
                console.log(
                    `[mp webhook] orden ${orderId} → pagada (pago ${payment.id})`
                );
            }
        } else if (payment.status === 'cancelled') {
            // El pago expiró o fue cancelado: la orden pendiente se cancela.
            const { error: updateError } = await admin
                .from('orders')
                .update({ status: 'cancelada', mp_payment_id: String(payment.id) })
                .eq('id', orderId)
                .eq('status', 'pendiente');

            if (updateError) {
                console.error(
                    `[mp webhook] error cancelando la orden ${orderId}:`,
                    updateError
                );
                return new Response('db error', { status: 500 }); // MP reintenta
            }
            console.log(
                `[mp webhook] orden ${orderId} → cancelada (pago ${payment.id} cancelled)`
            );
        } else {
            // rejected / pending / in_process / etc.: la orden sigue pendiente.
            console.log(
                `[mp webhook] pago ${payment.id} en estado '${payment.status}': la orden ${orderId} sigue pendiente`
            );
        }

        return new Response('ok', { status: 200 });
    } catch (error) {
        // Devolvemos 500 para que MP reintente ante fallos transitorios
        // (ej. no pudimos consultar el pago). Logueamos para depurar en Vercel.
        console.error('[mp webhook] error:', error);
        return new Response('error', { status: 500 });
    }
}

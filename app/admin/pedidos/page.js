/* ========================================================================
   app/admin/pedidos/page.js — Todos los pedidos (admin)
   Server Component. La MISMA query que /cuenta/pedidos, pero acá devuelve
   los pedidos de TODOS los usuarios: la sesión es de un admin y la política
   "Órdenes: admin ve todas" abre el select completo. Buen ejemplo de RLS:
   el código no cambia, cambia lo que la base deja ver según quién pregunta.

   Cada fila tiene un mini-form para cambiar el estado (select + Actualizar).
   Sin JS de cliente: es un <form> con Server Action, el POST re-renderiza.
   ======================================================================== */

import { getAdminContext } from '@/lib/adminAuth';
import { formatPrice } from '@/data/productos';
import { updateOrderStatusAction } from './actions';
import { ORDER_STATUSES } from './statuses';
import styles from './page.module.css';

export const metadata = {
    title: 'Pedidos — Panel de Polytape',
};

export default async function AdminPedidos({ searchParams }) {
    const { supabase } = await getAdminContext();

    const sp = await searchParams;
    const errorMessage =
        sp?.error === 'estado'
            ? 'No se pudo actualizar el estado del pedido. Probá de nuevo.'
            : null;

    const { data: orders } = await supabase
        .from('orders')
        .select(
            'id, status, total, created_at, shipping_full_name, shipping_email, shipping_city, mp_payment_id, order_items (sku, name, quantity)'
        )
        .order('created_at', { ascending: false });

    return (
        <div className={styles.wrap}>
            <h2>Pedidos ({(orders ?? []).length})</h2>

            {errorMessage && (
                <p className={styles.errorBanner} role="alert">
                    {errorMessage}
                </p>
            )}

            {(orders ?? []).length === 0 ? (
                <p className={styles.empty}>Todavía no hay pedidos.</p>
            ) : (
                <ul className={styles.list}>
                    {orders.map((o) => {
                        const fecha = new Date(o.created_at).toLocaleDateString(
                            'es-AR',
                            {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }
                        );
                        return (
                            <li key={o.id} className={styles.row}>
                                <div className={styles.rowMain}>
                                    <div>
                                        <p className={styles.rowId}>Pedido #{o.id}</p>
                                        <p className={styles.rowMeta}>{fecha}</p>
                                    </div>
                                    <div className={styles.buyer}>
                                        <p className={styles.buyerName}>
                                            {o.shipping_full_name ?? '—'}
                                        </p>
                                        <p className={styles.rowMeta}>
                                            {o.shipping_email}
                                            {o.shipping_city ? ` · ${o.shipping_city}` : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={styles.status}
                                        data-status={o.status}
                                    >
                                        {o.status}
                                    </span>
                                    <p className={styles.total}>{formatPrice(o.total)}</p>
                                </div>

                                <ul className={styles.rowItems}>
                                    {(o.order_items ?? []).map((item) => (
                                        <li key={item.sku}>
                                            {item.quantity}× {item.name}
                                        </li>
                                    ))}
                                    {o.mp_payment_id && (
                                        <li className={styles.mpRef}>
                                            Pago MP: {o.mp_payment_id}
                                        </li>
                                    )}
                                </ul>

                                <form
                                    action={updateOrderStatusAction.bind(null, o.id)}
                                    className={styles.statusForm}
                                >
                                    <label>
                                        <span className={styles.statusLabel}>
                                            Cambiar estado
                                        </span>
                                        <select name="status" defaultValue={o.status}>
                                            {ORDER_STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <button type="submit" className={styles.statusBtn}>
                                        Actualizar
                                    </button>
                                </form>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

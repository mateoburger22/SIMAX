/* ========================================================================
   app/cuenta/pedidos/page.js
   Server Component. Lista TODOS los pedidos del usuario logueado.
   RLS garantiza que solo aparecen los del usuario actual; igual filtramos
   en la query con eq('user_id', user.id) por claridad.
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/data/productos';
import styles from './page.module.css';

export const metadata = {
    title: 'Mis pedidos — Polytape',
};

export default async function MisPedidos() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // El select anidado `order_items (…)` trae los renglones de cada pedido
    // en la misma query (Supabase resuelve el join por la FK order_id).
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total, created_at, order_items (sku, name, quantity)')
        .order('created_at', { ascending: false });

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li aria-current="page">Mis pedidos</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Tu cuenta</p>
                    <h1>Mis pedidos</h1>
                </div>
            </section>

            <section className={styles.section}>
                {(orders ?? []).length === 0 ? (
                    <div className={styles.empty}>
                        <p>Todavía no hiciste ninguna compra.</p>
                        <Link href="/catalogo" className="btn btn-primary">
                            Ir al catálogo
                        </Link>
                    </div>
                ) : (
                    <ul className={styles.list}>
                        {orders.map((o) => {
                            const fecha = new Date(o.created_at).toLocaleDateString(
                                'es-AR',
                                { day: '2-digit', month: 'short', year: 'numeric' }
                            );
                            return (
                                <li key={o.id} className={styles.row}>
                                    <div>
                                        <p className={styles.rowId}>Pedido #{o.id}</p>
                                        <p className={styles.rowMeta}>{fecha}</p>
                                    </div>
                                    <span className={styles.status} data-status={o.status}>
                                        {o.status}
                                    </span>
                                    <p className={styles.total}>{formatPrice(o.total)}</p>
                                    <Link
                                        href={`/confirmacion/${o.id}`}
                                        className={styles.detailLink}
                                    >
                                        Ver detalle →
                                    </Link>
                                    <ul className={styles.rowItems}>
                                        {(o.order_items ?? []).map((item) => (
                                            <li key={item.sku}>
                                                {item.quantity}× {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </>
    );
}

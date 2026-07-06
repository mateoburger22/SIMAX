/* ========================================================================
   app/admin/page.js — Resumen del panel
   Server Component. Números generales del negocio: cuántos productos hay
   y cómo vienen los pedidos. Las queries corren con la SESIÓN del admin:
   las políticas "admin ve todas" de RLS son las que le abren la puerta
   (un usuario común, con estas mismas queries, vería solo lo suyo).
   ======================================================================== */

import Link from 'next/link';
import { getAdminContext } from '@/lib/adminAuth';
import { formatPrice } from '@/data/productos';
import styles from './page.module.css';

export default async function AdminResumen() {
    const { supabase } = await getAdminContext();

    // count exact + head:true → trae SOLO el número, sin filas.
    const [{ count: productosCount }, { data: orders }] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('status, total'),
    ]);

    const all = orders ?? [];
    const pagadas = all.filter((o) => o.status !== 'pendiente' && o.status !== 'cancelada');
    const pendientes = all.filter((o) => o.status === 'pendiente');
    // Ingresos: solo pedidos con pago acreditado (pagada/enviada/entregada).
    const ingresos = pagadas.reduce((acc, o) => acc + o.total, 0);

    const stats = [
        { label: 'Productos en catálogo', value: productosCount ?? 0 },
        { label: 'Pedidos totales', value: all.length },
        { label: 'Pedidos pendientes', value: pendientes.length },
        { label: 'Ingresos (pagados)', value: formatPrice(ingresos) },
    ];

    return (
        <div className={styles.resumen}>
            <ul className={styles.statGrid}>
                {stats.map((s) => (
                    <li key={s.label} className={styles.statCard}>
                        <p className={styles.statValue}>{s.value}</p>
                        <p className={styles.statLabel}>{s.label}</p>
                    </li>
                ))}
            </ul>

            <div className={styles.quickActions}>
                <Link href="/admin/productos/nuevo" className="btn btn-primary">
                    + Nuevo producto
                </Link>
                <Link href="/admin/pedidos" className="btn btn-outline">
                    Ver pedidos
                </Link>
            </div>
        </div>
    );
}

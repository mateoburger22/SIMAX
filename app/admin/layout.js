/* ========================================================================
   app/admin/layout.js
   Layout de TODO /admin/*. Server Component: valida la sesión y el rol
   ANTES de renderizar cualquier página hija.
     · Sin sesión      → /login
     · Sesión sin rol  → / (no le mostramos ni que el panel existe)

   Esto es la capa de UX. La capa de SEGURIDAD real es RLS (ver
   docs/supabase/06-admin-role.sql): aunque alguien llegara a ejecutar una
   action del panel, la base rechaza la escritura si no es admin.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { getAdminContext } from '@/lib/adminAuth';
import AdminNav from './AdminNav';
import styles from './layout.module.css';

export const metadata = {
    title: 'Panel de administración — Polytape',
};

export default async function AdminLayout({ children }) {
    const { user, isAdmin } = await getAdminContext();
    if (!user) redirect('/login');
    if (!isAdmin) redirect('/');

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <p className="eyebrow">Administración</p>
                    <h1>Panel de Polytape</h1>
                    <AdminNav />
                </div>
            </section>

            <section className={styles.content}>{children}</section>
        </>
    );
}

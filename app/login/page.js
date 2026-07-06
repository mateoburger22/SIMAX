/* ========================================================================
   app/login/page.js
   Server Component: arma el shell de la página y delega el form a LoginForm.
   Si ya hay sesión, redirige a /catalogo. Si el login falló, lee ?error=...
   de la URL y le pasa el mensaje al form.
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './page.module.css';

export const metadata = {
    title: 'Iniciar sesión — Polytape',
};

const MENSAJES_ERROR = {
    credenciales: 'Credenciales inválidas.',
    campos: 'Completá email y contraseña.',
    email: 'El email no tiene un formato válido.',
};

export default async function LoginPage({ searchParams }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/catalogo');

    const sp = await searchParams;
    const errorMessage = MENSAJES_ERROR[sp?.error] ?? null;

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li aria-current="page">Iniciar sesión</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Acceso de clientes</p>
                    <h1>Iniciar sesión</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.formWrap}>
                    <LoginForm errorMessage={errorMessage} />
                </div>
            </section>
        </>
    );
}

/* ========================================================================
   app/registro/page.js
   Server Component. Si ya hay sesión, manda al catálogo. Si el alta falló,
   lee ?error=... de la URL y le pasa el mensaje al form.
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RegistroForm from './RegistroForm';
import styles from './page.module.css';

export const metadata = {
    title: 'Crear cuenta — Polytape',
};

const MENSAJES_ERROR = {
    campos: 'Completá todos los campos.',
    email: 'El email no tiene un formato válido.',
    corta: 'La contraseña debe tener al menos 6 caracteres.',
    nocoincide: 'Las contraseñas no coinciden.',
    signup: 'No se pudo crear la cuenta. Puede que el email ya esté registrado.',
};

export default async function RegistroPage({ searchParams }) {
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
                            <li aria-current="page">Crear cuenta</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Acceso de clientes</p>
                    <h1>Crear cuenta</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.formWrap}>
                    <RegistroForm errorMessage={errorMessage} />
                </div>
            </section>
        </>
    );
}

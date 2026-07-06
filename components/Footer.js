/* ========================================================================
   Footer.js
   Server Component — solo renderiza HTML estático con links. No usa estado,
   ni eventos, ni APIs del browser, así que no necesita 'use client'.
   Esto reduce el tamaño del bundle JavaScript que se manda al cliente.
   ======================================================================== */

import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.siteFooter}>
            <div className={styles.footerInner}>
                <div className={styles.brand}>
                    <Image
                        src="/logo/cimat-logo.png"
                        alt="CIMAT"
                        width={240}
                        height={59}
                    />
                    <p>
                        Cintas adhesivas industriales para reparación, aislación,
                        sellado y alta temperatura.
                    </p>
                </div>

                <nav aria-label="Navegación del pie de página">
                    <h2>Sitio</h2>
                    <ul>
                        <li><Link href="/">Inicio</Link></li>
                        <li><Link href="/catalogo">Catálogo</Link></li>
                        <li><Link href="/contacto">Contacto</Link></li>
                        <li><Link href="/carrito">Carrito</Link></li>
                    </ul>
                </nav>

                {/* <address> es el elemento semántico para datos de contacto
                    de la organización (su hermano de links ya es <nav>). */}
                <address>
                    <h2>Contacto</h2>
                    <ul>
                        <li>
                            <a href="mailto:contacto@cimat.com">contacto@cimat.com</a>
                        </li>
                    </ul>
                </address>
            </div>

            <p className={styles.copy}>
                © 2026 CIMAT. Todos los derechos reservados.
            </p>
        </footer>
    );
}

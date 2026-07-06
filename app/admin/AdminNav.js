'use client';

/* ========================================================================
   app/admin/AdminNav.js
   Tabs de navegación del panel. Client Component solo por usePathname()
   (para marcar la solapa activa) — misma técnica que el Header.
   ======================================================================== */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const tabs = [
    { href: '/admin', label: 'Resumen', exact: true },
    { href: '/admin/productos', label: 'Productos' },
    { href: '/admin/pedidos', label: 'Pedidos' },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.tabs} aria-label="Secciones del panel">
            <ul>
                {tabs.map((t) => {
                    const active = t.exact
                        ? pathname === t.href
                        : pathname.startsWith(t.href);
                    return (
                        <li key={t.href}>
                            <Link
                                href={t.href}
                                className={active ? styles.tabActive : styles.tab}
                                aria-current={active ? 'page' : undefined}
                            >
                                {t.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

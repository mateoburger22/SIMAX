'use client';

/* ========================================================================
   CartWidget.js
   Botón "Carrito" con dropdown que muestra el resumen. Cliente porque:
   - Lee el carrito (useCart) → context.
   - Maneja open/close (useState).
   - Detecta cambios de ruta (usePathname) para auto-cerrar al navegar.
   - Escucha clicks fuera y tecla Escape (document.addEventListener).
   ======================================================================== */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/productos';
import styles from './CartWidget.module.css';

export default function CartWidget() {
    const { items, count, subtotal } = useCart();
    const [open, setOpen] = useState(false);
    const widgetRef = useRef(null);
    const pathname = usePathname();

    // Cerrar al navegar a otra página. Se ajusta DURANTE el render
    // comparando con la ruta anterior (patrón recomendado por React) en
    // vez de en un useEffect, que provocaría un render extra.
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setOpen(false);
    }

    // Cerrar al click afuera o tecla Escape
    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (widgetRef.current && !widgetRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    return (
        <div className={styles.cartWidget} ref={widgetRef}>
            <button
                type="button"
                className={styles.cartLink}
                aria-expanded={open}
                aria-controls="cart-dropdown"
                aria-label={`Ver carrito de compras, ${
                    count > 0
                        ? count + (count === 1 ? ' artículo' : ' artículos')
                        : 'vacío'
                }`}
                onClick={() => setOpen((o) => !o)}
            >
                Carrito
                {count > 0 && (
                    <span className={styles.cartBadge} aria-hidden="true">
                        {count}
                    </span>
                )}
            </button>

            {/* Región viva SIEMPRE presente (aria-live no anuncia elementos
                que recién aparecen): el lector de pantalla escucha "N
                artículos" cada vez que cambia el carrito. */}
            <span className="visually-hidden" aria-live="polite">
                {count} {count === 1 ? 'artículo' : 'artículos'} en el carrito
            </span>

            {open && (
                <div className={styles.cartDropdown} id="cart-dropdown">
                    <p className={styles.heading}>Tu carrito</p>

                    {items.length === 0 ? (
                        <>
                            <p className={styles.empty}>Tu carrito está vacío.</p>
                            <Link
                                href="/catalogo"
                                className={`btn btn-primary ${styles.cta}`}
                            >
                                Ir al catálogo
                            </Link>
                        </>
                    ) : (
                        <>
                            <ul className={styles.items}>
                                {items.map((item) => (
                                    <li key={item.sku} className={styles.item}>
                                        <div
                                            className={styles.visual}
                                            aria-hidden="true"
                                        >
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt=""
                                                    width={48}
                                                    height={48}
                                                />
                                            ) : (
                                                <span>CIMAT</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={styles.itemName}>
                                                {item.name}
                                            </p>
                                            <p className={styles.itemMeta}>
                                                ×{item.qty} ·{' '}
                                                {formatPrice(item.price * item.qty)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.total}>
                                <span>Total</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>
                            <Link
                                href="/carrito"
                                className={`btn btn-primary ${styles.cta}`}
                            >
                                Ver carrito completo
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

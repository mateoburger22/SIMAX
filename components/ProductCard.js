'use client';

/* ========================================================================
   ProductCard.js
   Card de producto con contador y "Agregar". Cliente porque maneja estado
   local (qty, added) y dispatcha al carrito.

   Ver detalle ahora apunta a /productos/[slug] donde slug = sku.toLowerCase().
   La ficha individual la armamos en el Bloque 5.
   ======================================================================== */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/productos';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);          // contador local de cuántos agregar
    const [added, setAdded] = useState(false);  // feedback visual del botón

    function handleAdd() {
        addItem(product, qty);   // suma `qty` unidades al carrito
        setAdded(true);
        setQty(1);               // reset al default
        setTimeout(() => setAdded(false), 900);
    }

    function dec() {
        setQty((q) => Math.max(1, q - 1));   // mínimo 1
    }
    function inc() {
        setQty((q) => q + 1);
    }

    // Slug = sku lowercase. Lo usamos en la ruta dinámica /productos/[id].
    const slug = product.sku.toLowerCase();

    return (
        <article className={styles.card}>
            {/* La foto también es un link a la ficha: en ecommerce el usuario
                espera poder clickear la imagen para verla en grande. */}
            <Link
                href={`/productos/${slug}`}
                className={styles.visual}
                aria-label={`Ver ${product.name} en detalle`}
            >
                {product.image && (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'contain', padding: 'var(--space-xs)' }}
                    />
                )}
            </Link>

            <div className={styles.body}>
                <p className={styles.sku}>{product.sku}</p>
                <h3 className={styles.title}>{product.name}</h3>

                {/* dangerouslySetInnerHTML porque las descripciones tienen <strong>.
                    Es seguro porque los datos vienen de productos.js (lo escribimos nosotros),
                    no de input del usuario. */}
                <p
                    className={styles.desc}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />

                <p className={styles.price}>{formatPrice(product.price)}</p>

                {/* Bloque de acciones: Ver detalle arriba, Agregar + contador abajo */}
                <div className={styles.actions}>
                    <Link
                        href={`/productos/${slug}`}
                        className={`btn btn-primary ${styles.detail}`}
                    >
                        Ver detalle
                    </Link>

                    <div className={styles.addRow}>
                        <button
                            type="button"
                            className={styles.addBtn}
                            onClick={handleAdd}
                            disabled={added}
                        >
                            {added ? 'Agregado ✓' : 'Agregar'}
                        </button>

                        {/* role="group": sin rol, el aria-label de un div no
                            se anuncia en los lectores de pantalla. */}
                        <div
                            className={styles.qty}
                            role="group"
                            aria-label="Cantidad a agregar"
                        >
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                onClick={dec}
                                aria-label="Reducir cantidad"
                            >
                                −
                            </button>
                            <span className={styles.qtyValue} aria-live="polite">
                                {qty}
                            </span>
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                onClick={inc}
                                aria-label="Aumentar cantidad"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

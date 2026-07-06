'use client';

/* ========================================================================
   AddToCartBlock.js
   Bloque interactivo (contador + botón Agregar al carrito) para la ficha
   individual del producto. Cliente porque maneja estado local y dispatcha
   al carrito.

   Nota arquitectónica: separar este bloque del resto de la ficha permite
   que app/productos/[id]/page.js sea Server Component → SEO + prerenderizado
   estático en build-time. Solo este pedacito se hidrata en el cliente.
   ======================================================================== */

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './AddToCartBlock.module.css';

export default function AddToCartBlock({ product }) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    function handleAdd() {
        addItem(product, qty);
        setAdded(true);
        setQty(1);
        setTimeout(() => setAdded(false), 1200);
    }

    return (
        <div className={styles.block}>
            {/* role="group": sin rol, el aria-label de un div no se anuncia
                en los lectores de pantalla. */}
            <div
                className={styles.qty}
                role="group"
                aria-label="Cantidad a agregar"
            >
                <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
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
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Aumentar cantidad"
                >
                    +
                </button>
            </div>

            <button
                type="button"
                className={`btn btn-primary ${styles.addBtn}`}
                onClick={handleAdd}
                disabled={added}
            >
                {added ? 'Agregado al carrito ✓' : 'Agregar al carrito'}
            </button>
        </div>
    );
}

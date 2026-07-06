'use client';

/* ========================================================================
   app/admin/productos/ProductForm.js
   Formulario ÚNICO para crear y editar productos. La página server que lo
   renderiza decide qué Server Action le pasa por prop:
     · /admin/productos/nuevo → createProductoAction
     · /admin/productos/[id]  → updateProductoAction.bind(null, id)
   Client Component por useActionState (estado pending + errores de la
   action). Mismo patrón que CheckoutForm.
   ======================================================================== */

import { useActionState } from 'react';
import Link from 'next/link';
import { lineas } from '@/data/productos';
import styles from './form.module.css';

export default function ProductForm({ action, producto = null, submitLabel }) {
    const [state, formAction, isPending] = useActionState(action, null);

    return (
        <form action={formAction} className={styles.form}>
            <div className={styles.rowTwo}>
                <label className={styles.field}>
                    <span className={styles.label}>Nombre</span>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={producto?.name ?? ''}
                        placeholder="Cinta de reparación ARMORTAPE 50mm"
                    />
                </label>
                <label className={styles.field}>
                    <span className={styles.label}>SKU (único)</span>
                    <input
                        type="text"
                        name="sku"
                        required
                        defaultValue={producto?.sku ?? ''}
                        placeholder="CIMAT-RW-050"
                    />
                </label>
            </div>

            <div className={styles.rowTwo}>
                <label className={styles.field}>
                    <span className={styles.label}>Línea</span>
                    <select
                        name="linea"
                        required
                        defaultValue={producto?.linea ?? lineas[0].id}
                    >
                        {lineas.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.nombre}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={styles.field}>
                    <span className={styles.label}>Precio (pesos, sin decimales)</span>
                    <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="1"
                        inputMode="numeric"
                        defaultValue={producto?.price ?? ''}
                    />
                </label>
            </div>

            <label className={styles.field}>
                <span className={styles.label}>Imagen (ruta en public/, opcional)</span>
                <input
                    type="text"
                    name="image"
                    defaultValue={producto?.image ?? ''}
                    placeholder="/img/productos/armortape.png"
                />
            </label>

            <label className={styles.field}>
                <span className={styles.label}>Descripción (opcional, admite &lt;strong&gt;)</span>
                <textarea
                    name="description"
                    rows={5}
                    defaultValue={producto?.description ?? ''}
                    placeholder="Cinta de fibra de vidrio activada con agua…"
                />
            </label>

            {state?.error && (
                <p className={styles.error} role="alert">
                    {state.error}
                </p>
            )}

            <div className={styles.formActions}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                >
                    {isPending ? 'Guardando…' : submitLabel}
                </button>
                <Link href="/admin/productos" className="btn btn-outline">
                    Cancelar
                </Link>
            </div>
        </form>
    );
}

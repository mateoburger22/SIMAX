'use client';

/* ========================================================================
   app/admin/productos/DeleteProductButton.js
   Botón "Eliminar" con confirmación. Client Component SOLO por el
   confirm() del navegador — la eliminación en sí la hace la Server Action
   (deleteProductoAction), que viaja en el action del <form>.

   `.bind(null, id)` "precarga" el id del producto en la action: el form no
   necesita un input hidden y el id no se puede editar desde el DOM.
   ======================================================================== */

import { deleteProductoAction } from './actions';
import styles from './page.module.css';

export default function DeleteProductButton({ id, name }) {
    return (
        <form
            action={deleteProductoAction.bind(null, id)}
            onSubmit={(e) => {
                if (!confirm(`¿Eliminar "${name}" del catálogo?`)) {
                    e.preventDefault();
                }
            }}
        >
            <button type="submit" className={styles.deleteBtn}>
                Eliminar
            </button>
        </form>
    );
}

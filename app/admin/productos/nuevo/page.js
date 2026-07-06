/* ========================================================================
   app/admin/productos/nuevo/page.js — Alta de producto
   Server Component mínimo: título + ProductForm con la action de crear.
   (El acceso ya lo validó app/admin/layout.js.)
   ======================================================================== */

import ProductForm from '../ProductForm';
import { createProductoAction } from '../actions';
import styles from '../page.module.css';

export const metadata = {
    title: 'Nuevo producto — Panel de Polytape',
};

export default function NuevoProducto() {
    return (
        <div className={styles.wrap}>
            <h2>Nuevo producto</h2>
            <ProductForm
                action={createProductoAction}
                submitLabel="Crear producto"
            />
        </div>
    );
}

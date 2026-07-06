/* ========================================================================
   app/admin/productos/page.js — Listado del catálogo (admin)
   Server Component. Tabla con todos los productos y las acciones del CRUD:
   crear (link a /nuevo), editar (link a /[id]) y eliminar (form + action).
   ======================================================================== */

import Link from 'next/link';
import Image from 'next/image';
import { getAdminContext } from '@/lib/adminAuth';
import { formatPrice, lineas } from '@/data/productos';
import DeleteProductButton from './DeleteProductButton';
import styles from './page.module.css';

export default async function AdminProductos({ searchParams }) {
    const { supabase } = await getAdminContext();

    const sp = await searchParams;
    const errorMessage =
        sp?.error === 'delete'
            ? 'No se pudo eliminar el producto. Probá de nuevo.'
            : null;

    const { data: productos } = await supabase
        .from('productos')
        .select('id, sku, name, price, linea, image')
        .order('id', { ascending: true });

    const nombreLinea = (id) => lineas.find((l) => l.id === id)?.nombre ?? id;

    return (
        <div className={styles.wrap}>
            <div className={styles.toolbar}>
                <h2>Productos ({(productos ?? []).length})</h2>
                <Link href="/admin/productos/nuevo" className="btn btn-primary">
                    + Nuevo producto
                </Link>
            </div>

            {errorMessage && (
                <p className={styles.errorBanner} role="alert">
                    {errorMessage}
                </p>
            )}

            {/* La tabla scrollea horizontal en mobile en vez de romper el layout */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>SKU</th>
                            <th>Línea</th>
                            <th className={styles.right}>Precio</th>
                            <th className={styles.right}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(productos ?? []).map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div className={styles.productCell}>
                                        {p.image && (
                                            <Image
                                                src={p.image}
                                                alt=""
                                                width={44}
                                                height={44}
                                                className={styles.thumb}
                                            />
                                        )}
                                        <span className={styles.productName}>{p.name}</span>
                                    </div>
                                </td>
                                <td className={styles.sku}>{p.sku}</td>
                                <td>{nombreLinea(p.linea)}</td>
                                <td className={`${styles.right} ${styles.price}`}>
                                    {formatPrice(p.price)}
                                </td>
                                <td className={styles.right}>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/admin/productos/${p.id}`}
                                            className={styles.editLink}
                                        >
                                            Editar
                                        </Link>
                                        <DeleteProductButton id={p.id} name={p.name} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ========================================================================
   app/catalogo/page.js — Catálogo (Server Component)
   Server Component asíncrono: en el render lee la tabla `productos` desde
   Supabase. Las cards (<ProductCard>) son Client Components — Next se
   ocupa de la frontera entre server y cliente.
   ======================================================================== */

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { lineas } from '@/data/productos';
import { getAllProductos } from '@/lib/productos';
import styles from './page.module.css';

export const metadata = {
    title: 'Catálogo — Polytape',
    description:
        'Catálogo de cintas industriales: reparación con fibra de vidrio, aislación eléctrica y sellado de tuberías.',
};

export default async function Catalogo() {
    const productos = await getAllProductos();

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li><Link href="/">Inicio</Link></li>
                            <li aria-current="page">Catálogo</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Cintas adhesivas industriales</p>
                    <h1>Catálogo de productos</h1>
                    <p className={styles.pageLead}>
                        Cuatro líneas técnicas. Filtrá por línea o recorré el
                        catálogo completo.
                    </p>
                </div>
            </section>

            <nav className={styles.categoryFilter} aria-label="Filtrar por línea de producto">
                <ul>
                    {lineas.map((l) => (
                        <li key={l.id}>
                            <a href={`#${l.id}`}>{l.nombre}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Una sección por línea: filtramos los productos según linea.id */}
            {lineas.map((linea, idx) => {
                const productosLinea = productos.filter((p) => p.linea === linea.id);
                const sectionClass = `${styles.productSection} ${
                    idx % 2 === 1 ? styles.productSectionAlt : ''
                }`;

                return (
                    <section
                        key={linea.id}
                        id={linea.id}
                        className={sectionClass}
                        aria-labelledby={`${linea.id}-title`}
                    >
                        <div className={styles.productSectionHeader}>
                            <p className="eyebrow">Línea {linea.numero}</p>
                            <h2 id={`${linea.id}-title`}>{linea.nombre}</h2>
                            <p>{linea.descripcion}</p>
                        </div>

                        <ul className={styles.productGrid}>
                            {productosLinea.map((p) => (
                                <li key={p.sku}>
                                    <ProductCard product={p} />
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}

            <section className={styles.cta} aria-labelledby="cta-title">
                <div className={styles.ctaInner}>
                    <h2 id="cta-title">¿No estás seguro de qué cinta usar?</h2>
                    <p>
                        Contanos tu aplicación y te recomendamos el producto correcto.
                        Cotizaciones por volumen sin compromiso.
                    </p>
                    <Link href="/contacto" className="btn btn-dark">
                        Pedir asesoramiento
                    </Link>
                </div>
            </section>
        </>
    );
}

/* ========================================================================
   app/page.js — Home (Server Component)
   Sin 'use client': es 100% HTML estático con datos hardcoded. Next genera
   el HTML en build-time y al cliente le manda 0 bytes de JS para esta página.
   ======================================================================== */

import Link from 'next/link';
import styles from './page.module.css';

const categorias = [
    {
        num: '01',
        titulo: 'Reparación con fibra de vidrio',
        descripcion:
            'Cintas activadas con agua que endurecen en minutos. Refuerzo estructural permanente para tuberías, mangueras y piezas dañadas.',
    },
    {
        num: '02',
        titulo: 'Aislación eléctrica',
        descripcion:
            'Cintas dieléctricas certificadas para conexiones de baja, media y alta tensión en entornos industriales y obras eléctricas.',
    },
    {
        num: '03',
        titulo: 'Sellado de tuberías',
        descripcion:
            'Cintas selladoras para juntas, roscas y reparaciones en sistemas de gas, agua y aire comprimido.',
    },
    {
        num: '04',
        titulo: 'Alta temperatura',
        descripcion:
            'Cintas resistentes al calor para aplicaciones industriales sostenidas por encima de los 200 °C.',
    },
];

const features = [
    {
        titulo: 'Productos certificados',
        descripcion: 'Cada línea cumple con normas internacionales aplicables a su uso técnico.',
    },
    {
        titulo: 'Industria y particulares',
        descripcion: 'Cotizaciones por volumen para empresas y compra individual desde la web.',
    },
    {
        titulo: 'Soporte real',
        descripcion: 'Te ayudamos a identificar la cinta correcta para tu aplicación específica.',
    },
];

export default function Home() {
    return (
        <>
            <section className={styles.hero} aria-labelledby="hero-title">
                <div className={styles.heroInner}>
                    <p className="eyebrow">Cintas adhesivas industriales</p>
                    <h1 id="hero-title">
                        Soluciones técnicas{' '}
                        <span>para la industria que no se detiene.</span>
                    </h1>
                    <p className={styles.heroLead}>
                        Reparación con fibra de vidrio, aislación eléctrica, sellado de tuberías y
                        aplicaciones de alta temperatura. Calidad certificada para empresas,
                        ferreterías y profesionales.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/catalogo" className="btn btn-primary">
                            Ver catálogo
                        </Link>
                        <Link href="/contacto" className="btn btn-outline-light">
                            Solicitar cotización
                        </Link>
                    </div>
                </div>
                <div className={styles.heroStripe} aria-hidden="true" />
            </section>

            <section className={styles.categories} aria-labelledby="categorias-title">
                <div className={styles.sectionHeader}>
                    <p className="eyebrow">Líneas de productos</p>
                    <h2 id="categorias-title">Cuatro familias técnicas</h2>
                    <p className={styles.sectionLead}>
                        Cada línea responde a un problema industrial específico, con productos
                        seleccionados por su comportamiento mecánico, térmico o eléctrico.
                    </p>
                </div>

                <ul className={styles.categoryGrid}>
                    {categorias.map((cat) => (
                        <li key={cat.num}>
                            <article className={styles.categoryCard}>
                                <span className={styles.categoryNum} aria-hidden="true">
                                    {cat.num}
                                </span>
                                <h3>{cat.titulo}</h3>
                                <p>{cat.descripcion}</p>
                            </article>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={styles.whyCimat} aria-labelledby="why-title">
                <div className={styles.whyInner}>
                    <div className={styles.whyIntro}>
                        <p className="eyebrow">Por qué CIMAT</p>
                        <h2 id="why-title">
                            Calidad técnica, stock permanente, atención profesional.
                        </h2>
                    </div>

                    <ul className={styles.featuresList}>
                        {features.map((f) => (
                            <li key={f.titulo}>
                                <h3>{f.titulo}</h3>
                                <p>{f.descripcion}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className={styles.cta} aria-labelledby="cta-title">
                <div className={styles.ctaInner}>
                    <h2 id="cta-title">¿Necesitás una solución para tu obra o industria?</h2>
                    <p>Contactanos y te asesoramos según tu necesidad técnica.</p>
                    <Link href="/contacto" className="btn btn-dark">
                        Hablemos
                    </Link>
                </div>
            </section>
        </>
    );
}

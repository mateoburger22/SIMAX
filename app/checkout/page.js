/* ========================================================================
   app/checkout/page.js — Checkout (Server Component)
   Asíncrono. En el render:
     · Valida sesión → si no hay, manda a /login.
     · Lee el carrito desde Supabase (NO desde el cliente).
     · Si está vacío, manda al catálogo.
     · Renderiza el form (Client) y el resumen (Server) en paralelo.
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/data/productos';
import CheckoutForm from './CheckoutForm';
import styles from './page.module.css';

export const metadata = {
    title: 'Checkout — Polytape',
};

export default async function Checkout() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: cart } = await supabase
        .from('cart_items')
        .select('quantity, productos (id, sku, name, price)')
        .order('id', { ascending: true });

    const items = (cart ?? [])
        .filter((row) => row.productos)
        .map((row) => ({
            sku: row.productos.sku,
            name: row.productos.name,
            price: row.productos.price,
            qty: row.quantity,
        }));

    if (items.length === 0) redirect('/catalogo');

    const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const count = items.reduce((acc, i) => acc + i.qty, 0);

    return (
        <>
            <section className={styles.pageHeader} aria-labelledby="checkout-title">
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/carrito">Carrito</Link>
                            </li>
                            <li aria-current="page">Checkout</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Finalizar compra</p>
                    <h1 id="checkout-title">Tus datos de envío</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.layout}>
                    <CheckoutForm />

                    <aside className={styles.summary} aria-label="Resumen del pedido">
                        <h2>Tu pedido</h2>
                        <ul className={styles.summaryItems}>
                            {items.map((i) => (
                                <li key={i.sku} className={styles.summaryItem}>
                                    <span>
                                        {i.name} <em>×{i.qty}</em>
                                    </span>
                                    <span>{formatPrice(i.price * i.qty)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.summaryTotal}>
                            <span>
                                Total ({count} {count === 1 ? 'artículo' : 'artículos'})
                            </span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}

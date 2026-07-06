import { Inter, Barlow_Condensed } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

// next/font descarga las fonts en build-time y las sirve self-hosted.
// Cada font genera una CSS variable que aplicamos al <html> y leemos
// desde globals.css.
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const barlow = Barlow_Condensed({
    subsets: ['latin'],
    weight: ['600', '700'],
    variable: '--font-barlow',
    display: 'swap',
});

export const metadata = {
    title: 'Polytape — Cintas técnicas industriales',
    description:
        'Cintas industriales para reparación con fibra de vidrio, aislación eléctrica y sellado de tuberías. CIMAT.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
            <body>
                <a href="#main" className="skip-link">
                    Saltar al contenido
                </a>
                <CartProvider>
                    <Header />
                    <main id="main">{children}</main>
                    <Footer />
                </CartProvider>
            </body>
        </html>
    );
}

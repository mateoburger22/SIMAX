'use client';

/* ========================================================================
   ProductImageLightbox.js
   Foto de la ficha de producto que se amplía a pantalla completa al
   clickearla. Cliente porque maneja estado (abierto/cerrado) y eventos
   de teclado. La página padre (Server) solo le pasa src y alt.

   Accesibilidad: el disparador es un <button> (no un div con onClick),
   el overlay es role="dialog" y se cierra con Escape, con el botón ✕
   o clickeando el fondo. Manejo de foco de un diálogo modal:
     · al abrir, el foco se mueve al botón cerrar (si no, queda "atrás"
       del overlay y un usuario de teclado no sabe dónde está);
     · Tab queda ATRAPADO dentro del diálogo (único focusable: ✕);
     · al cerrar, el foco vuelve al botón que lo abrió.
   ======================================================================== */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './ProductImageLightbox.module.css';

export default function ProductImageLightbox({ src, alt }) {
    const [open, setOpen] = useState(false);
    const closeButtonRef = useRef(null);
    const triggerRef = useRef(null);

    // Mientras está abierto: Escape cierra, Tab no escapa del diálogo,
    // el fondo no scrollea y el foco arranca en el botón cerrar.
    useEffect(() => {
        if (!open) return;

        // Copia local: el valor del ref podría cambiar antes del cleanup.
        const triggerEl = triggerRef.current;
        closeButtonRef.current?.focus();

        function onKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
            // Trampa de foco: el único elemento focusable del diálogo es ✕,
            // así que Tab (y Shift+Tab) se quedan ahí.
            if (e.key === 'Tab') {
                e.preventDefault();
                closeButtonRef.current?.focus();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
            // Devolver el foco al disparador al cerrar.
            triggerEl?.focus();
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                ref={triggerRef}
                className={styles.trigger}
                onClick={() => setOpen(true)}
                aria-label={`Ampliar imagen de ${alt}`}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className={styles.thumb}
                    priority
                />
                <span className={styles.hint} aria-hidden="true">
                    Ampliar +
                </span>
            </button>

            {open && (
                <div
                    className={styles.overlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Imagen ampliada de ${alt}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={styles.frame}>
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            sizes="100vw"
                            className={styles.full}
                        />
                    </div>
                    <button
                        type="button"
                        ref={closeButtonRef}
                        className={styles.close}
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar imagen ampliada"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}

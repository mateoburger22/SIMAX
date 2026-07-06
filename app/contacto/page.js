'use client';

/* ========================================================================
   app/contacto/page.js — Contacto (Client Component)
   Form con validación JS por campo + fetch real a /api/contacto.

   Flujo del submit:
     1. Validar en el cliente (feedback inmediato, sin round-trip). Cada
        campo con error se marca con aria-invalid y un mensaje asociado
        vía aria-describedby (accesible para lectores de pantalla).
     2. fetch POST a /api/contacto (que RE-valida server-side y guarda
        en Supabase). Mientras viaja, el botón queda deshabilitado para
        evitar doble envío.
     3. res.ok → pantalla de éxito. Error del server o de red → mensaje
        en un role="alert" sin perder lo que el usuario escribió.
   ======================================================================== */

import { useState } from 'react';
import Link from 'next/link';
import { isValidEmail, isValidPhone } from '@/lib/validators';
import styles from './page.module.css';

// Devuelve un objeto { campo: mensaje } solo con los campos inválidos.
function validate(values) {
    const errors = {};
    if (values.nombre.trim().length < 2) {
        errors.nombre = 'Ingresá tu nombre completo.';
    }
    if (!isValidEmail(values.email)) {
        errors.email = 'Ingresá un email válido, por ejemplo nombre@empresa.com.';
    }
    if (values.telefono.trim() && !isValidPhone(values.telefono)) {
        errors.telefono = 'El teléfono solo admite números, espacios, paréntesis, + y -.';
    }
    if (values.asunto.trim().length < 3) {
        errors.asunto = 'Contanos brevemente el asunto.';
    }
    if (values.mensaje.trim().length < 10) {
        errors.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    }
    return errors;
}

// Definido FUERA del componente de página: si se declarara adentro, React
// crearía un "componente nuevo" en cada render (error de lint y de perf).
function FieldError({ errors, name }) {
    if (!errors[name]) return null;
    return (
        <p className={styles.fieldError} id={`error-${name}`}>
            {errors[name]}
        </p>
    );
}

export default function Contacto() {
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);

    // Al tipear en un campo con error, lo limpiamos: el mensaje viejo ya
    // no describe lo que hay en el input.
    function clearError(e) {
        const name = e.target.name;
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setServerError(null);

        const formData = new FormData(e.currentTarget);
        const values = {
            nombre: String(formData.get('nombre') ?? ''),
            email: String(formData.get('email') ?? ''),
            telefono: String(formData.get('telefono') ?? ''),
            asunto: String(formData.get('asunto') ?? ''),
            mensaje: String(formData.get('mensaje') ?? ''),
        };

        // 1) Validación client-side
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        // 2) Fetch al endpoint (que re-valida y persiste)
        setSending(true);
        try {
            const res = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setServerError(
                    data.error ?? 'No pudimos enviar tu mensaje. Probá de nuevo.'
                );
                return;
            }
            setSubmitted(true);
        } catch {
            setServerError(
                'No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.'
            );
        } finally {
            setSending(false);
        }
    }

    // Props ARIA repetidas en cada campo: si el campo tiene error, se marca
    // inválido y se lo vincula con el <p> que explica el problema.
    function ariaProps(name) {
        return errors[name]
            ? { 'aria-invalid': true, 'aria-describedby': `error-${name}` }
            : {};
    }

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li aria-current="page">Contacto</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Estamos para ayudarte</p>
                    <h1>Contacto</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.layout}>
                    {submitted ? (
                        <div className={styles.success}>
                            <p className="eyebrow">Listo</p>
                            <h2>Mensaje enviado</h2>
                            <p>
                                Recibimos tu consulta y te respondemos dentro de las próximas
                                24 horas hábiles.
                            </p>
                            <Link href="/" className="btn btn-primary">
                                Volver al inicio
                            </Link>
                        </div>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit} noValidate>
                            <fieldset className={styles.fieldset} disabled={sending}>
                                <legend>Tus datos</legend>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Nombre completo</span>
                                        <input
                                            type="text"
                                            name="nombre"
                                            required
                                            autoComplete="name"
                                            onChange={clearError}
                                            {...ariaProps('nombre')}
                                        />
                                        <FieldError errors={errors} name="nombre" />
                                    </label>
                                </div>

                                <div className={`${styles.row} ${styles.rowTwo}`}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            onChange={clearError}
                                            {...ariaProps('email')}
                                        />
                                        <FieldError errors={errors} name="email" />
                                    </label>
                                    <label className={styles.field}>
                                        <span className={styles.label}>
                                            Teléfono (opcional)
                                        </span>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            autoComplete="tel"
                                            onChange={clearError}
                                            {...ariaProps('telefono')}
                                        />
                                        <FieldError errors={errors} name="telefono" />
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset className={styles.fieldset} disabled={sending}>
                                <legend>Tu consulta</legend>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Asunto</span>
                                        <input
                                            type="text"
                                            name="asunto"
                                            required
                                            placeholder="Ej: Consulta por cinta de fibra de vidrio"
                                            onChange={clearError}
                                            {...ariaProps('asunto')}
                                        />
                                        <FieldError errors={errors} name="asunto" />
                                    </label>
                                </div>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Mensaje</span>
                                        <textarea
                                            name="mensaje"
                                            rows={6}
                                            required
                                            placeholder="Contanos qué necesitás. Si es para una aplicación específica, dejanos detalles técnicos."
                                            onChange={clearError}
                                            {...ariaProps('mensaje')}
                                        />
                                        <FieldError errors={errors} name="mensaje" />
                                    </label>
                                </div>
                            </fieldset>

                            {serverError && (
                                <p className={styles.formError} role="alert">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submit}`}
                                disabled={sending}
                            >
                                {sending ? 'Enviando…' : 'Enviar mensaje'}
                            </button>
                        </form>
                    )}

                    <aside
                        className={styles.sidebar}
                        aria-label="Otras formas de contacto"
                    >
                        <h2>Otras vías</h2>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Email</p>
                            <a href="mailto:contacto@cimat.com">contacto@cimat.com</a>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Teléfono</p>
                            <a href="tel:+541140000000">+54 11 4000-0000</a>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Horario</p>
                            <p className={styles.contactValue}>Lun a Vie · 9 a 18 hs</p>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Dirección</p>
                            <p className={styles.contactValue}>
                                Av. Industrial 1234,
                                <br />
                                CABA, Argentina
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}

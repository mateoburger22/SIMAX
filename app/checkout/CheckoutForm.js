'use client';

/* ========================================================================
   app/checkout/CheckoutForm.js
   Solo el formulario (Client) para poder usar `useActionState`. La página
   padre (Server) ya validó sesión y carrito; este componente se ocupa de
   los inputs y de mostrar el error que devuelva la action.
   ======================================================================== */

import { useActionState } from 'react';
import { placeOrderAction } from './actions';
import styles from './page.module.css';

export default function CheckoutForm() {
    const [state, formAction, isPending] = useActionState(
        placeOrderAction,
        null
    );

    return (
        <form action={formAction} className={styles.form} noValidate>
            <fieldset className={styles.fieldset}>
                <legend>Datos personales</legend>

                <div className={styles.row}>
                    <label className={styles.field}>
                        <span className={styles.label}>Nombre completo</span>
                        <input type="text" name="nombre" required autoComplete="name" />
                    </label>
                </div>

                <div className={`${styles.row} ${styles.rowTwo}`}>
                    <label className={styles.field}>
                        <span className={styles.label}>Email</span>
                        <input type="email" name="email" required autoComplete="email" />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.label}>Teléfono</span>
                        <input type="tel" name="telefono" required autoComplete="tel" />
                    </label>
                </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
                <legend>Dirección de envío</legend>

                <div className={styles.row}>
                    <label className={styles.field}>
                        <span className={styles.label}>Dirección</span>
                        <input
                            type="text"
                            name="direccion"
                            required
                            autoComplete="street-address"
                            placeholder="Calle y número"
                        />
                    </label>
                </div>

                <div className={`${styles.row} ${styles.rowTwo}`}>
                    <label className={styles.field}>
                        <span className={styles.label}>Ciudad</span>
                        <input
                            type="text"
                            name="ciudad"
                            required
                            autoComplete="address-level2"
                        />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.label}>Código postal</span>
                        <input
                            type="text"
                            name="cp"
                            required
                            autoComplete="postal-code"
                            inputMode="numeric"
                        />
                    </label>
                </div>
            </fieldset>

            {state?.error && (
                <p className={styles.error} role="alert">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                className={`btn btn-primary ${styles.submit}`}
                disabled={isPending}
            >
                {isPending ? 'Confirmando…' : 'Confirmar pedido'}
            </button>
        </form>
    );
}

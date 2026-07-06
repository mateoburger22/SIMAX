/* ========================================================================
   lib/mercadopago.js
   Configuración del SDK oficial de Mercado Pago (paquete "mercadopago").

   `MercadoPagoConfig` guarda el Access Token con el que autenticamos TODAS
   las llamadas a la API de MP (crear preferencias, consultar pagos). El token
   es SECRETO y vive solo en el server (env var MP_ACCESS_TOKEN, sin
   NEXT_PUBLIC_). Con credenciales de PRUEBA el token empieza con "TEST-".

   Exponemos una función que devuelve un cliente nuevo por llamada, en vez de
   un singleton, para no arrastrar estado entre requests en el server.
   ======================================================================== */

import { MercadoPagoConfig } from 'mercadopago';

export function mpClient() {
    return new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN,
    });
}

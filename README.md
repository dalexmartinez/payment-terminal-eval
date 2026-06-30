# SafePay — Terminal de Pagos por Roles

Prueba técnica Frontend 2026. Terminal de pagos simulado con autenticación basada en JWT, vistas diferenciadas por rol, cifrado AES de datos sensibles, y backend simulado con Vercel Serverless Functions.

**Demo en producción:** https://payment-terminal-eval.vercel.app

## Stack técnico

- **Frontend:** Vue 3 (Composition API + `<script setup>`), TypeScript, Vite
- **Estado global:** Pinia (`auth`, `ventas`)
- **Ruteo:** Vue Router con guards por rol
- **UI:** PrimeVue (preset Aura) + sistema de diseño custom (tema oscuro tipo terminal POS)
- **HTTP:** Axios, con interceptores para notificaciones automáticas por status code
- **Autenticación:** JWT (decodificado con `jwt-decode`, no se valida firma — ver sección de decisiones)
- **Cifrado:** AES (`crypto-js`) para datos de tarjeta en el flujo de Venta
- **Backend simulado:** Vercel Serverless Functions (carpeta `api/`), TypeScript, sin base de datos

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Vite por sí solo no sirve las funciones de `api/`. Para probar el flujo completo (login, venta, consultas, cancelaciones) con el backend simulado corriendo localmente:

```bash
npx vercel dev
```

## Estructura del proyecto

```
src/
├── views/              LoginView, OperadorView, SupervisorView
├── components/          TerminalHeader (sesión activa + logout)
├── stores/               auth.ts (token/role), ventas.ts (ventas de la sesión)
├── services/             api.ts (axios + interceptores), crypto.ts (AES)
├── composables/          useInactivityLogout.ts (expiración de sesión)
└── router/               guards por rol

api/
├── login.ts              POST — regresa JWT según usuario
├── venta.ts               POST — solo rol Operador
├── consultas.ts            GET — solo rol Operador
├── cancelaciones.ts         PATCH — solo rol Supervisor
├── _utils/                   cors.ts, crypto.ts, auth.ts (validación de rol)
└── _data/tokens.ts            JWT pre-generados (jwtbuilder.jamiekurtz.com)
```

## Usuarios de prueba

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| `supervisor1` | cualquiera | Supervisor | Cancelaciones y Devoluciones |
| `operador1` | cualquiera | Operador | Ventas y Consultas |

La contraseña no se valida realmente en esta simulación; el backend decide el rol únicamente con base en el usuario.

## Decisiones de diseño

**Autorización por rol en el backend, no solo en el frontend.** Cada endpoint (`venta`, `consultas`, `cancelaciones`) valida el `role` del JWT antes de procesar la petición (`api/_utils/auth.ts`), independientemente de que el frontend ya restrinja qué vistas puede navegar cada rol. Sin esto, cualquiera con un token válido de cualquier rol podría llamar a cualquier endpoint directamente (ej. con `curl`), sin pasar por la interfaz.

**Supervisor usa formularios de input directo, no un listado para seleccionar.** El documento de la prueba especifica explícitamente "Input para las transacciones, Cancelaciones y Devoluciones, número de referencia financiera, número de tarjeta" para el rol Supervisor, y asigna "Consultas" exclusivamente al rol Operador. Por eso el Supervisor no tiene un listado de transacciones para elegir — se mantiene fiel a la separación de permisos que define el documento, en vez de exponerle datos de Ventas a un rol que no los tiene asignados.

**Las ventas nuevas se reflejan en Consultas dentro de la misma sesión, vía Pinia.** El backend simulado no tiene base de datos: cada llamada a `/api/consultas` genera datos aleatorios nuevos, sin relación con las ventas reales hechas previamente. Para que la experiencia sea coherente dentro de una sesión de uso, las ventas procesadas se guardan en un store de Pinia (`stores/ventas.ts`) y se anteponen al mock del backend al cargar Consultas. Esto vive solo en memoria del navegador — no persiste si recargas la página o cierras sesión.

**Cifrado AES de datos de tarjeta, con sus límites reconocidos.** El número de tarjeta, fecha de expiración y CVV se cifran en el cliente antes de salir hacia el backend (`services/crypto.ts`), cumpliendo el requisito del documento. La clave de cifrado vive de forma estática y compartida entre frontend y backend — una limitación real, no una implementación productiva: en un escenario real, el cifrado de datos de tarjeta debería resolverse con TLS + tokenización del lado de un procesador de pagos, donde el dato sensible nunca toca el servidor propio en texto plano.

**Formato del número de referencia financiera no documentado en el brief.** El documento original especifica el formato de la aprobación ("6 dígitos") y de la referencia que genera el backend ("8 dígitos"), pero nunca especifica qué formato debe validar el frontend al capturar una referencia para Cancelación/Devolución. Se asumió un mínimo de 8 dígitos por consistencia con el formato que el propio backend genera, y el mensaje de error refleja explícitamente cuando la longitud es insuficiente.

**Expiración de sesión por inactividad.** Después de 5 minutos sin interacción (mouse, teclado, scroll, touch), la sesión se cierra automáticamente y se redirige al login con un aviso de "Sesión expirada".

**Seguridad: CORS, CSP y límites de input.** Se restringió CORS de `*` a una lista de orígenes permitidos (dominio de producción + previews de Vercel del proyecto), se agregaron headers de seguridad estándar (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`), y se validan límites de longitud en los campos de texto libre del backend. Protección contra XSS ya estaba cubierta por defecto: Vue escapa automáticamente cualquier dato dinámico en el template, y no se usa `v-html` ni `innerHTML` en ningún componente. Rate limiting quedó documentado como limitación conocida, no implementado (requiere infraestructura adicional fuera del alcance de esta prueba).

**Tabla de Consultas con vista alterna para mobile.** Además del scroll horizontal, se agregó una vista de tarjetas apiladas para pantallas angostas (menores a 640px), donde cada transacción se muestra como una tarjeta con los datos organizados verticalmente en vez de columnas.

## Limitaciones conocidas (fuera de alcance de esta prueba)

- No hay base de datos real; los datos de Consultas y los comprobantes son simulados
- No se valida la firma del JWT (solo se decodifica el payload) — aceptable para esta simulación, pero insuficiente en un backend productivo real
- No hay rate limiting en los endpoints (documentado conscientemente, requiere infraestructura adicional)

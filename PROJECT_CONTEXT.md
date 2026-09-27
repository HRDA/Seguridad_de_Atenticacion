# PROJECT CONTEXT

## Project Overview
Aplicación académica de autenticación segura en la raíz del workspace.

## Objective
Registro, acceso, cierre, recuperación de contraseña y dashboard protegido con Supabase Auth SSR.

## Tech Stack
Next.js 16.3.6, React 19, TypeScript estricto, `@supabase/ssr` 0.10.0, `@supabase/supabase-js` 2.100.1.

## Requirements
Node 20.19+ recomendado por tooling; SDK Supabase seleccionado compatible con Node 20. Supabase externo requerido para operaciones reales.

## Current Status
Implementación local validada y Auth API conectado. El usuario confirmó que registro, confirmación de correo y recuperación funcionaron; hay videos de evidencia en la raíz. Login/logout autenticado y cookies no se verificaron independientemente en esta sesión.

## Architecture
Server Components verifican identidad; formularios Client Components invocan Server Actions; cliente Supabase de servidor separado del cliente browser; `src/proxy.ts` refresca sesión y protege navegación en Next 16. Layout raíz fuerza render por request para evitar estado de auth prerenderizado.

## Important Files
- `src/app/actions/auth.ts`: sign up/in/out, recuperación y actualización de contraseña.
- `src/lib/supabase/{client,server,proxy}.ts`: clientes SSR por contexto.
- `src/proxy.ts`: matcher y delegación al actualizador de sesión.
- `src/app/auth/callback/route.ts`: intercambio de código y redirect relativo.
- `README.md`: configuración local, Supabase, seguridad y deployment.
- `prueba.mp4`, `recuperar_contrasena.mp4`: evidencia de registro/confirmación y recuperación reportada por el usuario.

## Supabase Configuration
`.env.local` existe, URL y clave publishable están configuradas y el archivo está ignorado por Git. Auth settings: signup habilitado, proveedor Email activo y confirmación requerida (`mailer_autoconfirm=false`). No copiar valores del archivo a documentación ni usar service role.

## Authentication Flow
Email/password via Server Actions. Confirmación de email cuando Supabase la requiera. Recuperación usa `resetPasswordForEmail`, callback con intercambio de código y `updateUser` tras verificar usuario.

## Security Decisions
Validación de servidor; `getClaims()` en proxy, `getUser()` al leer cuenta; mensajes de login/reset no enumeran usuarios; destino callback solo relativo; no `localStorage` de aplicación, no logging de secretos, React escaping, headers básicos, Origin check de Server Actions + SameSite=Lax. `@supabase/ssr` requiere cookie accesible por el browser client y no se marca HttpOnly; Secure se habilita en producción. El cliente browser se provee pero los formularios actuales usan Server Actions.

## Technical Decisions
Next 16 llama Proxy a Middleware y usa `src/proxy.ts`. `dynamic = "force-dynamic"` en root layout evita que navegación/sesión queden estáticas; comprobado en output de build. URLs de callback usan `NEXT_PUBLIC_SITE_URL` o localhost de desarrollo, no el header `Origin`. No se añadió CSP para no bloquear scripts de streaming sin nonce. Dependencias Supabase fijadas por compatibilidad con Node 20 del workspace.

## Problems and Solutions
- SDK Supabase más reciente requería Node 22 y SSR peer más reciente. Se seleccionó SSR 0.10.0 + JS 2.100.1, compatibles con Node >=20.
- `eslint-visitor-keys` advierte que Node 20.15 es inferior a 20.19; lint/build pasan en este entorno, pero actualizar Node a 20.19+ recomendado.
- Workspace no incluía proyecto ni credenciales; Next se inicializó directamente en la raíz abierta.
- Build inicialmente marcaba dashboard y otras páginas como estáticas porque el helper de usuario capturaba la falta de cookies en prerender. `force-dynamic` en el layout resuelve el problema; todas las rutas aparecen ahora como dinámicas en el build.
- Proxy anticipaba el redirect de `/reset-password` y ocultaba el aviso de enlace inválido; esa ruta ahora deja que la página compruebe el usuario con `getUser()` y muestre el mensaje.

## Validation
- `npm run type-check`: PASS tras último ajuste de callback/logout.
- `npm run lint`: PASS tras último ajuste de callback/logout.
- `npm run build`: PASS; todas las rutas de sesión están dinámicas y Proxy está generado.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- Supabase Auth settings: PASS (API responde, signup habilitado, proveedor Email activo, confirmación requerida).
- Token endpoint con correo aleatorio inexistente: HTTP 400 `invalid_credentials`; sin cuenta creada. Server Action muestra mensaje genérico y permanece en login.
- Navegador local: PASS para login y recuperación visibles; dashboard anónimo redirige a login; reset sin sesión redirige a login; validaciones de correo/password bloquean datos inválidos; payload `<script>` solo queda como valor de input; acción login muestra estado no configurado sin simular éxito.
- Navegador con Supabase configurado: PASS para formulario con datos inválidos, mismatch de contraseñas, login con credenciales ficticias, dashboard anónimo y callback inválido; reset anónimo llega a login con aviso.
- El usuario confirmó que registro, correo de confirmación y recuperación finalizaron correctamente; README contiene enlaces relativos a los MP4.
- No hay reproductor/herramienta de extracción de fotogramas disponible localmente; los videos no fueron inspeccionados visualmente y deben revisarse por secretos antes de hacer público el repo.
- Smoke test de reanudación: PASS, login/registro/recuperación visibles y dashboard anónimo redirige a login.
- Respuesta HTTP local: 200; X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.
- `.env.local` ignorado y `.env.example` versionable.
- Login/logout autenticado y cookies de sesión no fueron verificados independientemente; los flujos de registro y recuperación fueron comprobados por el usuario.
- Redirect allow-list no está disponible en el endpoint público settings; verificar en Supabase `http://localhost:3000/auth/callback`.

## Pending Tasks
Verificar login/logout, dashboard autenticado y cookies con la cuenta; revisar que los videos no expongan contraseñas, enlaces de recuperación, tokens o datos personales antes de hacer público el repositorio; ejecutar deployment HTTPS. Node del entorno es 20.15; actualizar a 20.19+ recomendado para eliminar advertencia de tooling.

## Important Constraints
No crear otra app; no versionar `.env.local`; no usar service role; no afirmar que la autenticación remota se probó sin configuración externa.
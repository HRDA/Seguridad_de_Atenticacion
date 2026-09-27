# Keyline: autenticación segura

Aplicación académica de autenticación con Next.js App Router, TypeScript y Supabase Auth. El proyecto utiliza Server Actions para las mutaciones y Supabase SSR para mantener la sesión en cookies.

## Tecnologías

- Next.js 16 App Router y React 19
- TypeScript en modo estricto
- Supabase Auth, `@supabase/ssr` y `@supabase/supabase-js`
- Proxy de Next.js 16 para refrescar sesión y proteger rutas

## Requisitos

- Node.js 20.19 o superior recomendado por las dependencias de desarrollo. `@supabase/supabase-js` está fijado en una versión compatible con Node 20.
- Un proyecto Supabase con Authentication habilitado.

## Instalación

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Visita `http://localhost:3000`. Los comandos de validación son `npm run lint`, `npm run type-check` y `npm run build`.

## Variables de entorno

Completa `.env.local` con los valores públicos del panel **Connect** de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

También se acepta `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en lugar de `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Estas claves son publicables y deben estar protegidas por las políticas de Supabase (RLS). No se usa ni se necesita `service_role` en esta aplicación. `.env.local` está ignorado por Git; `.env.example` no contiene secretos y sí se versiona.

## Configuración de Supabase

1. Crea un proyecto y copia su URL y clave publicable a `.env.local`.
2. En **Authentication > Providers > Email**, habilita Email/Password y configura la confirmación de email según el entorno.
3. En **Authentication > URL Configuration**, define `http://localhost:3000` como Site URL y agrega `http://localhost:3000/auth/callback` a Redirect URLs.
4. Para producción, agrega el dominio HTTPS real a Redirect URLs y establece `NEXT_PUBLIC_SITE_URL` con el origen canónico. No uses comodines amplios.
5. Para recuperación de contraseña, configura la plantilla de correo de Supabase para enlazar al flujo de recuperación del proyecto. El cambio de contraseña requiere una sesión válida del enlace.

Se confirmó que el registro, la confirmación de correo y la recuperación de contraseña funcionaron en el proyecto. La confirmación por correo está habilitada en Supabase. Las grabaciones de ambas pruebas están enlazadas abajo.

## Rutas y autenticación

- `/register`: registro de email/contraseña y confirmación por correo si Supabase la exige.
- `/login`: inicio de sesión mediante Server Action.
- `/forgot-password`: solicitud de recuperación con respuesta que no revela si el correo existe.
- `/auth/callback`: intercambia el código de Supabase por una sesión; solo permite destinos relativos para evitar open redirects.
- `/reset-password`: requiere la sesión temporal del enlace y actualiza la contraseña.
- `/dashboard`: requiere sesión verificada y muestra datos básicos de cuenta.
- `/`: redirige a dashboard o login según identidad verificada.

## Arquitectura

```text
Browser form
   -> Server Action (validación de servidor)
   -> Supabase Auth
   -> cookies SSR
   -> proxy.ts (refresco / redirección de rutas)
   -> Server Component (verifica al usuario antes de exponer datos)
```

`src/lib/supabase/client.ts` crea el cliente oficial para Client Components; `server.ts` crea un cliente por request para Server Components, Server Actions y Route Handlers; `proxy.ts` mantiene sincronizada la sesión y las cookies de respuesta. Los formularios de autenticación actuales usan Server Actions, no envían credenciales directamente desde el navegador a Supabase.

El layout raíz fuerza renderizado por request para que la navegación condicional y los controles que dependen de cookies no se prerendericen con un estado de sesión fijo.

## Seguridad

- Las contraseñas nunca se almacenan en la aplicación ni se registran. Validación cliente y servidor: formato de correo, máximo de 254 caracteres, contraseña entre 12 y 128 caracteres y coincidencia de confirmación.
- El proxy usa `auth.getClaims()` para comprobar JWT firmado; el dashboard obtiene el usuario actualizado en servidor. Middleware/proxy es una barrera de navegación, no el único control de autorización.
- El logout comprueba el resultado del SDK; si el servicio falla, no declara éxito y deja visible un aviso en la cuenta.
- Las cookies las administra `@supabase/ssr`; se configura `SameSite=Lax` y `Secure` en producción HTTPS. El adaptador estándar de Supabase SSR no marca la cookie `HttpOnly`: el cliente oficial del navegador necesita leerla para sincronizar/refrescar sesión. Forzar `HttpOnly` aquí rompería ese flujo. No se guardan tokens en `localStorage` o `sessionStorage` por código de aplicación. Si el requisito exige cookies estrictamente `HttpOnly`, habría que migrar a una sesión exclusivamente de servidor y retirar el cliente browser.
- Next.js verifica `Origin` frente a `Host` en Server Actions (CSRF); no hay mutaciones por GET. La política `SameSite=Lax` es defensa adicional.
- React escapa texto por defecto; no se usa `dangerouslySetInnerHTML`. No hay escrituras del usuario renderizadas como HTML.
- Se añaden `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción. No se fuerza CSP para no romper scripts de streaming de Next sin configurar nonces.
- No hay service role, secretos privados, logging de credenciales, endpoints de fetch arbitrario ni tablas propias que requieran RLS.

## Despliegue

En Vercel, configura las variables públicas de Supabase y `NEXT_PUBLIC_SITE_URL`, usa HTTPS y registra el dominio exacto en Supabase Redirect URLs. No se ha realizado un despliegue desde este workspace.

## Verificación local

Lint, TypeScript y build pasan. En navegador se verificaron el rechazo de datos inválidos, el rechazo genérico de credenciales incorrectas, el dashboard anónimo y un callback inválido. El usuario probó satisfactoriamente el registro, la confirmación por correo y la recuperación; los videos se enlazan abajo como evidencia. El login/logout autenticado y las cookies de sesión no fueron verificados independientemente desde esta sesión.

## Evidencia de pruebas

Los enlaces son relativos al repositorio y siguen funcionando al cambiar de rama. Al abrirlos en GitHub se accede a la vista del video.

- [Registro y confirmación de correo (MP4)](./prueba.mp4)
- [Recuperación de contraseña (MP4)](./recuperar_contrasena.mp4)


# OPEX — Guía de despliegue / Deploy guide

Última actualización: 2026-07-02. Este archivo no forma parte del sitio; puedes
excluirlo de la subida (es inofensivo si se sube).

## Qué se sube

Todo el contenido de esta carpeta **excepto** `.claude/` y (opcional) `DEPLOY.md`:

- 10 páginas HTML (incl. `404.html`) + `styles.css` + `fonts.css` + `main.js` + `favicon.svg`
- `fonts/` (10 archivos woff2 — las fuentes ahora son propias, sin Google)
- `robots.txt`, `sitemap.xml`, `.well-known/security.txt`
- `_headers` (Netlify / Cloudflare Pages) **y** `.htaccess` (Apache) — cada host
  usa el suyo e ignora el otro. Súbelos los dos.

## Según el tipo de hosting

| Host | Cabeceras de seguridad | 404 | Nada más que hacer |
|---|---|---|---|
| Apache (hosting clásico/compartido, cPanel, FTP) | `.htaccess` (automático) | `.htaccess` → `ErrorDocument` | Si al subir ves un error 500, borra la línea `Options -Indexes` de `.htaccess` |
| Netlify / Cloudflare Pages | `_headers` (automático) | `404.html` en la raíz (automático) | — |
| Nginx u otro | ninguno de los dos aplica | config del servidor | Pídeme el bloque de config equivalente |

## Pasos

1. **Dominio.** `robots.txt`, `sitemap.xml` y `.well-known/security.txt` asumen
   `https://opexxai.info`. Si el sitio va a vivir en otro dominio (o en `www.`),
   haz un buscar-y-reemplazar de `opexxai.info` en esos 3 archivos.
   El sitio debe desplegarse en la **raíz** del dominio (el `404.html` y los
   `_headers`/`.htaccess` usan rutas absolutas desde `/`).
2. **Sube los archivos** (ver lista de arriba). Comprueba que `.htaccess`,
   `.well-known/` y `.gitignore` (archivos con punto) se hayan subido — algunos
   clientes FTP los ocultan.
3. **HTTPS.** Confirma que el certificado TLS está activo y que
   `http://` redirige a `https://`. Si el host no redirige solo, descomenta el
   bloque "Force HTTPS" de `.htaccess`.
4. **HSTS** (solo cuando lleves unos días con HTTPS estable): descomenta la
   línea `Strict-Transport-Security` en `.htaccess` o `_headers`.
5. **DNS.** Crea el registro A/CNAME del dominio hacia el hosting
   (a fecha de hoy `opexxai.info` no tiene registro A — el correo ya está bien
   configurado: MX de Porkbun + SPF + DMARC).
6. **Formulario (cuando toque).**
   - Crea la access key en web3forms.com para `info.opex@opexxai.info` y pégala
     en `contacto.html` (línea del `access_key`; sustituye el placeholder).
   - La clave es pública por diseño — puede ir en el HTML sin problema.
   - Envía una prueba real y confirma que llega a tu buzón a través del
     reenvío de Porkbun (los reenviadores a veces filtran remitentes
     automáticos — pruébalo, no lo des por hecho).
   - En el panel de Web3Forms: activa la protección anti-spam y, si tu plan lo
     permite, restringe la clave a tu dominio. Mira también su DPA/condiciones
     RGPD (dónde procesan los datos, cuánto los retienen) — hace falta para la
     política de privacidad.
   - Sin la clave configurada, el formulario ahora muestra el aviso de error
     con el email directo (ya no intenta abrir el cliente de correo).
7. **Respuestas por email.** El reenvío de Porkbun solo recibe. Para
   *responder* como `info.opex@opexxai.info` sin caer en spam (tu DMARC es
   `p=quarantine`), configura un envío autenticado (buzón real o SMTP send-as
   con DKIM alineado) y haz una prueba de ida y vuelta con Gmail y Outlook.

## Verificación post-despliegue

- https://securityheaders.com → nota A (todas las cabeceras activas)
- https://observatory.mozilla.org → sin fallos de CSP
- DevTools → pestaña Red: **cero** peticiones a dominios externos al navegar
- Formulario: envío de prueba + respuesta de prueba (ver pasos 6–7)
- Modo oscuro, toggle de idioma y menú móvil funcionan con la CSP activa
- Lighthouse (rendimiento/accesibilidad/SEO): esperable ≥95 con fuentes locales

## Pendiente (decisiones tuyas, no bloqueado por código)

- **Testimonio placeholder** en `metodo.html` (sección "Testimonial pendiente"):
  quítalo o rellénalo antes de publicar.
- `canonical` + `og:url` + `og:image` en cada página: se añaden cuando el
  dominio definitivo esté confirmado (og:image además necesita una imagen
  1200×630 diseñada por ti).
- `apple-touch-icon` (PNG 180×180) — Safari/iOS no usa el favicon SVG.
- Textos legales: NIF + revisión profesional + quitar las notas "conviene
  revisar" (ver plan legal en el chat).
- **CSP:** si algún día editas el script inline del `<head>` de las páginas,
  recalcula su hash sha256 y actualízalo en `.htaccess` y `_headers`.

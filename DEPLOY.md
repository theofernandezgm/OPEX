# OPEX — Despliegue y mantenimiento

Última actualización: 2026-09-13. Este archivo no forma parte del sitio
(está en el repositorio y, como todo lo que hay en la raíz, Cloudflare lo sirve
en `/DEPLOY.md`; no contiene nada sensible).

## Dónde está el sitio

- **Hosting:** Cloudflare Pages, proyecto `opex` (URL interna: https://opex.pages.dev).
- **Dominio:** `opexxai.info`, con DNS en Cloudflare. El sitio se sirve en
  `https://www.opexxai.info`; la raíz sin `www` redirige (regla de la zona).
- **Código:** GitHub, `theofernandezgm/OPEX`, rama `main`. El proyecto Pages está
  conectado a este repositorio.
- **Formulario:** Web3Forms. La access key está en `contacto.html` y es pública por diseño.

Es un sitio estático: no hay build ni dependencias. Pages sirve la carpeta tal cual.

## Cómo publicar un cambio

No hay nada que configurar: el proyecto ya está conectado al repositorio.

- Cada **push a `main`** se publica en producción (www.opexxai.info) en 1–2 minutos.
- Cada push a **otra rama** genera una previsualización en
  `https://<rama>.opex.pages.dev` sin tocar producción. Es la forma segura de
  revisar cambios con el sitio en vivo: rama → push → revisar la URL → fusionar en `main`.
- **Marcha atrás:** Workers & Pages → `opex` → Deployments → en cualquier
  despliegue de producción anterior, "Rollback to this deployment". Inmediato.

Ajustes del proyecto (Settings → Builds), por si hay que revisarlos:

| Ajuste | Valor |
|---|---|
| Framework preset | None |
| Build command | (vacío) |
| Build output directory | `/` |
| Production branch | `main` |

### Previsualización sin pasar por Git

Con Node y Wrangler instalados (una sola vez `npx wrangler login`), desde la
carpeta del sitio:

    npx wrangler pages deploy . --project-name opex --branch <nombre>

Sube el contenido de la carpeta a `https://<nombre>.opex.pages.dev`. Con
`--branch main` iría directo a producción; mejor reservar `main` para Git, así
el repositorio y el sitio no se separan. En PowerShell, si la política de
ejecución bloquea `npx`, usa `npx.cmd`.

## Probar en local

    npx wrangler pages dev .

Sirve el sitio en http://localhost:8788 aplicando `_headers`, `404.html` y las
rutas sin extensión igual que producción. En Windows necesita el Visual C++
Redistributable (`winget install Microsoft.VCRedist.2015+.x64`); si falta, el
runtime falla al arrancar con "access violation". Abrir los `.html`
directamente también sirve para ver el diseño, pero los enlaces internos no
funcionan.

## Archivos especiales

- `_headers`: cabeceras de seguridad, caché y Early Hints. Pages lo aplica
  automáticamente. Las cabeceras `Link` de las páginas HTML hacen que Cloudflare
  envíe respuestas 103 y el navegador descargue CSS y fuente antes de recibir el HTML.
- `404.html` en la raíz: Pages lo usa como página de error sin configurar nada.
- URLs sin extensión (`/servicios`): Pages las resuelve solas a `servicios.html`.
- `robots.txt`, `sitemap.xml`, `.well-known/security.txt`: apuntan a
  `https://www.opexxai.info`. Si cambia el dominio, buscar y reemplazar en los tres.
- Todo lo que hay en la raíz del repositorio se publica (también `README.md`,
  `DEPLOY.md`, `.gitignore`). Si algún día se quiere evitar, la solución es
  mover el sitio a una subcarpeta (`site/`) y poner esa carpeta como
  "Build output directory" en Cloudflare.

## Ajustes de Cloudflare que rompen la CSP

La CSP es estricta (`default-src 'none'`; scripts solo propios más un hash).
Estas funciones del panel inyectan scripts o modifican el HTML y deben quedar
desactivadas para el dominio:

- Scrape Shield → **Email Address Obfuscation**: OFF (si no, los enlaces `mailto:` dejan de funcionar).
- Speed → Optimization → **Rocket Loader**: OFF.
- Speed → Optimization → **Auto Minify**: OFF (altera el script inline y su hash).
- Security → Bots → **Bot Fight Mode / JavaScript Detections**: OFF. Inyecta un
  script inline distinto en cada petición, que la CSP bloquea; el resultado es un
  error de consola en cada carga y una detección que nunca se ejecuta. Un sitio
  estático con formulario protegido por honeypot no lo necesita.
- **Web Analytics** (cookieless): está permitido en la CSP (`static.cloudflareinsights.com`
  y `cloudflareinsights.com`). Se puede activar o desactivar en el panel sin tocar nada.
- Speed → Optimization → **Early Hints**: ON (aprovecha las cabeceras `Link`).

## El script inline y su hash

Cada página lleva un script inline en el `<head>` que aplica el idioma guardado
antes del primer pintado. Su hash sha256 está en `_headers`. Si editas ese
script hay que recalcular el hash; si no, la CSP lo bloquea y el idioma
parpadea al cargar. En PowerShell:

    $s = "<contenido exacto del script, sin las etiquetas <script>>"
    [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($s)))

## Verificación tras publicar

- https://securityheaders.com → nota A
- https://observatory.mozilla.org → sin fallos de CSP
- DevTools → Consola: sin errores. DevTools → Red: solo peticiones al propio
  dominio (y a `cloudflareinsights.com` si Web Analytics está activo).
- Formulario: envío de prueba.
- Toggle de idioma y menú móvil.

## Notas de mantenimiento

- La cabecera y el pie son idénticos en las 10 páginas. Si cambias la
  navegación, aplícalo en todas.
- Fuentes propias en `fonts/` (IBM Plex Sans, latin y latin-ext). No hay
  peticiones a Google.
- `main.js` gestiona idioma, menú móvil, formulario y año del pie. Sin dependencias.
- Textos bilingües: cada texto va en dos `<span>`, `lang-es` y `lang-en`.

## Pendiente

- Sustituir `img/estudio-barcelona.jpg` (render) por fotografía real.
- `apple-touch-icon` (PNG 180×180); Safari e iOS no usan el favicon SVG.
- `og:image` (1200×630) por página.
- Textos legales: NIF y revisión profesional.
- Reposicionar los textos hacia clientes corporativos (hoy hablan de "pequeños negocios").

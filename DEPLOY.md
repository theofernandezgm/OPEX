# OPEX — Despliegue y mantenimiento

Última actualización: 2026-09-20. Este archivo no forma parte del sitio, pero
como todo lo que hay en la raíz del repositorio se publica junto al sitio
(Cloudflare lo serviría en `/DEPLOY.md`), hay una regla en `_redirects` que
lo bloquea (devuelve 404). Aun así, este archivo ya no lleva una lista de
pendientes ni nada que no convenga que se filtre si la regla falla algún día:
esa información vive ahora en `TODO.local.md`, que está en `.gitignore` y
nunca se sube al repositorio.

## Dónde está el sitio

- **Hosting:** Cloudflare Pages, proyecto `opex` (URL interna: https://opex.pages.dev).
- **Dominio:** `opexxai.info`, con DNS en Cloudflare. El sitio se sirve en
  `https://www.opexxai.info`; la raíz sin `www` redirige (regla de la zona).
- **Código:** GitHub, `theofernandezgm/OPEX`, rama `main`. El proyecto Pages está
  conectado a este repositorio.
- **Formulario:** Web3Forms. La access key está en `contacto.html` y es pública por diseño.

Es un sitio estático: no hay build ni dependencias. Pages sirve la carpeta tal cual.

## Cómo publicar un cambio

**`git push` a `main` es la única vía de despliegue a producción.** No hay
nada que configurar: el proyecto ya está conectado al repositorio.

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

**Solo para ramas de previsualización — nunca para `main`.** Tener dos vías
documentadas a producción es lo que provoca que el repositorio y el sitio en
vivo se acaben separando, así que `wrangler pages deploy` no se usa nunca con
`--branch main`; esa rama se publica solo mediante `git push` (ver arriba).

Con Node y Wrangler instalados (una sola vez `npx wrangler login`), desde la
carpeta del sitio:

    npx wrangler pages deploy . --project-name opex --branch <nombre>

Sube el contenido de la carpeta a `https://<nombre>.opex.pages.dev`, sin tocar
producción. En PowerShell, si la política de ejecución bloquea `npx`, usa
`npx.cmd`.

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
- **Web Analytics** (cookieless): está permitido en la CSP (`static.cloudflareinsights.com`,
  `cloudflareinsights.com`, y desde 2026-09-20 `connect-src 'self'` para el beacon
  same-origin `/cdn-cgi/rum`). Se puede activar o desactivar en el panel sin tocar nada.
- Speed → Optimization → **Early Hints**: ON (aprovecha las cabeceras `Link`).

### JS Detections (error de consola conocido y aceptado)

Bot Fight Mode está OFF y todos los demás interruptores de bots también, pero
Cloudflare sigue inyectando un script (`/cdn-cgi/challenge-platform/scripts/jsd/main.js`)
en cada petición. Esto es un comportamiento documentado del plan Free: activar
Bot Fight Mode alguna vez habilita JS Detections, pero desactivarlo después NO lo
desactiva, y el plan Free no tiene un interruptor independiente para JS
Detections (solo existe en Super Bot Fight Mode / Enterprise) ni acceso de API
con el scope necesario. Confirmado contra la documentación oficial de Cloudflare
y un hilo de su comunidad con el mismo síntoma (verificado 2026-09-20).

El script inyectado no tiene hash estable (cambia por petición) y no hay soporte
de nonce en Cloudflare Pages para un sitio estático sin backend, así que no se
puede permitir en la CSP sin añadir `'unsafe-inline'` a `script-src` — lo cual
debilitaría la CSP contra cualquier futuro XSS, a cambio de silenciar un error
cosmético. Decisión: **no se añade**. Se acepta el error de consola y el techo
de 92 en Lighthouse Best Practices como coste conocido del plan Free.

Si esto cambia de importancia (por ejemplo, un revisor de seguridad lo señala
como bloqueante), las opciones son: (a) subir a Cloudflare Pro, donde JS
Detections sí es un interruptor real, o (b) añadir `'unsafe-inline'` sabiendo
el trade-off. Ninguna se ha aplicado.

## El script inline y su hash

Cada página lleva un script inline en el `<head>` que aplica el idioma antes del
primer pintado: el elegido con el selector EN/ES si lo hay, o si no el detectado
del navegador (ES o EN; cualquier otro idioma, ES). Su hash sha256 está en
`_headers`. Si editas ese script hay que recalcular el hash; si no, la CSP lo
bloquea y el idioma parpadea al cargar. En PowerShell:

    $s = "<contenido exacto del script, sin las etiquetas <script>>"
    [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($s)))

## Verificación tras publicar

- https://securityheaders.com → nota A
- https://observatory.mozilla.org → sin fallos de CSP
- DevTools → Consola: un único error esperado y aceptado (JS Detections, ver
  más arriba). Cualquier otro error de CSP sí hay que investigarlo. DevTools →
  Red: solo peticiones al propio dominio (y a `cloudflareinsights.com` si Web
  Analytics está activo).
- Formulario: envío de prueba.
- Idioma: en una ventana privada (sin `localStorage`) debe salir el del navegador;
  el selector EN/ES lo cambia y la elección se conserva al navegar. Menú móvil.

## Notas de mantenimiento

- La cabecera y el pie son idénticos en las 10 páginas. Si cambias la
  navegación, aplícalo en todas.
- Fuentes propias en `fonts/` (IBM Plex Sans, latin y latin-ext). No hay
  peticiones a Google.
- `main.js` gestiona idioma, menú móvil, formulario y año del pie. Sin dependencias.
- Textos bilingües: cada texto va en dos `<span>`, `lang-es` y `lang-en`.

## Pendiente

Ver `TODO.local.md` (no está en el repositorio; se queda solo en este equipo).

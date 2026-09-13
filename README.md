# OPEX — sitio web

Sitio web de OPEX, estudio digital en Barcelona: https://www.opexxai.info

Sitio estático: HTML, CSS y un archivo JavaScript sin dependencias. No hay
proceso de build. Alojado en Cloudflare Pages, conectado a este repositorio.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html`, `servicios.html`, `metodo.html`, `proceso.html`, `nosotros.html`, `contacto.html` | Páginas principales |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Páginas legales |
| `404.html` | Página de error (Cloudflare la usa automáticamente) |
| `styles.css` | Estilos del sitio |
| `fonts.css`, `fonts/` | IBM Plex Sans, alojada en el propio sitio (sin peticiones a Google) |
| `main.js` | Idioma ES/EN, menú móvil, formulario de contacto, año del pie |
| `img/` | Imágenes |
| `_headers` | Cabeceras de seguridad, caché y Early Hints (formato Cloudflare Pages) |
| `robots.txt`, `sitemap.xml`, `.well-known/security.txt` | SEO y contacto de seguridad |
| `DEPLOY.md` | Guía de despliegue y mantenimiento |

## Convenciones

- Cada texto va en dos `<span>`: `lang-es` y `lang-en`. El idioma activo se
  guarda en `localStorage` (`opex-lang`).
- La cabecera y el pie son idénticos en todas las páginas. Si cambias la
  navegación, aplícalo en las diez.
- Las páginas se enlazan sin extensión (`/servicios`); Cloudflare Pages resuelve
  la ruta a `servicios.html`.
- El `<head>` lleva un script inline que aplica el idioma antes del primer
  pintado. Si lo editas, recalcula su hash sha256 en `_headers` (ver `DEPLOY.md`).

## Probar en local

Con Node instalado, desde la carpeta del sitio:

    npx wrangler pages dev .

Sirve el sitio en http://localhost:8788 con las mismas cabeceras y rutas que
producción. En PowerShell, si la política de ejecución bloquea `npx`, usa
`npx.cmd`. En Windows necesita el Visual C++ Redistributable
(`winget install Microsoft.VCRedist.2015+.x64`); sin él, el runtime falla al
arrancar. Como alternativa vale cualquier servidor estático (por ejemplo la
extensión Live Server de VS Code), aunque sin cabeceras ni rutas limpias.

## Publicar

Cada push a `main` se publica en producción en uno o dos minutos. Cualquier
otra rama genera una URL de previsualización (`https://<rama>.opex.pages.dev`)
sin tocar el sitio en vivo. Detalles, marcha atrás y ajustes de Cloudflare en
`DEPLOY.md`.

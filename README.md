# OPEX — sitio web

Sitio web de OPEX, consultoría de digitalización, automatización e
infraestructura en Barcelona: https://www.opexxai.info

Sitio estático: HTML, CSS y un archivo JavaScript sin dependencias. No hay
proceso de build. Alojado en Cloudflare Pages, conectado a este repositorio.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html`, `servicios.html`, `metodo.html`, `proceso.html`, `nosotros.html`, `contacto.html` | Páginas principales (español) |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Páginas legales (español) |
| `en/` | Las mismas nueve páginas en inglés, con nombres en inglés (`en/services.html`, `en/method.html`…) |
| `404.html` | Página de error (Cloudflare la usa automáticamente). Única página bilingüe |
| `styles.css` | Estilos del sitio |
| `fonts.css`, `fonts/` | IBM Plex Sans, alojada en el propio sitio (sin peticiones a Google) |
| `main.js` | Menú móvil, formulario de contacto, año del pie y, solo en `404.html`, el selector de idioma |
| `img/` | Imágenes |
| `og-image.png`, `og-image-en.png`, `apple-touch-icon.png`, `favicon.svg` | Imagen para redes sociales (una por idioma) e iconos |
| `_headers` | Cabeceras de seguridad, caché y Early Hints (formato Cloudflare Pages) |
| `_redirects` | Redirecciones 301 de las URLs inglesas antiguas y bloqueo de los archivos internos |
| `robots.txt`, `sitemap.xml`, `.well-known/security.txt` | SEO y contacto de seguridad |
| `DEPLOY.md` | Guía de despliegue y mantenimiento |

## Convenciones

- **Cada idioma es una URL propia.** El español vive en la raíz
  (`/servicios`, `/metodo`…) y el inglés bajo `/en/` con nombres de archivo en
  inglés (`/en/services`, `/en/method`…). No hay textos alternados por JS: cada
  página se sirve ya en su idioma, con su `<html lang>`, su `canonical` y su
  bloque `hreflang`. Al tocar una página hay que replicar el cambio en su pareja
  (`archivo.html` ↔ `en/archivo.html`).
- **`404.html` es la única página bilingüe** y la única excepción a lo anterior:
  lleva los `<span class="lang-es">` / `lang-en`, el selector EN/ES por JS y el
  script inline del `<head>` que aplica el idioma antes del primer pintado. Ese
  script es el único con hash sha256 en `_headers`; si lo editas hay que
  recalcularlo o la CSP lo bloquea (ver `DEPLOY.md`).
- La cabecera y el pie están duplicados en las 19 páginas (9 en español, 9 en
  inglés y `404.html`). Si cambias la navegación, aplícalo en las 19.
- Las páginas se enlazan sin extensión (`/servicios`); Cloudflare Pages resuelve
  la ruta a `servicios.html`, y dentro de `en/` igual.
- `styles.css`, `fonts.css` y `main.js` se enlazan con un parámetro de versión
  (`?v=AAAAMMDD`). Cuando cambies uno de esos archivos, sube la fecha en las 19
  páginas y en las líneas `Link` de `_headers` (buscar y reemplazar), y el
  cambio se verá al instante sin depender de la caché del navegador ni de Cloudflare.

Detalles de despliegue, idiomas, CSP y ajustes de Cloudflare: `DEPLOY.md`.

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

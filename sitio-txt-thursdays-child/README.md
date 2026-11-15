# minisode 2: Thursday's Child — fan site (TXT) · versión 2

Trabajo final · Laboratorio UX/UI · Diseño y desarrollo: **studio ELSE**
Construido a partir del archivo de Figma *Txt minisode 2 — Trabajo final* (páginas Desing y Átomos).

## Cómo abrirlo
Abre `index.html` en el navegador. Las fuentes y los íconos están dentro de la carpeta, así que funciona sin internet.

## Estructura
```
index.html                 → HTML semántico (header, nav, main, section, footer)
css/styles.css             → tokens del Sistema visual, modo día/noche, responsive
js/main.js                 → tema, sección activa, vidrio roto, concept photos, carruseles, parallax
assets/img/fotos           → fotos web (las mismas que se eligieron en Figma)
assets/img/logos           → logos de era, miembros, ELSE, BIGHIT, TXT
assets/fonts               → Anton, Space Grotesk, Instrument Serif
assets/vendor/fontawesome  → íconos
```

## Qué hace
| Parte | Comportamiento |
|---|---|
| Header | Fijo arriba. Al bajar, marca la sección en la que estás (desktop: enlace rojo subrayado; mobile: etiqueta bajo la barra y menú). |
| Día / noche | Interruptor sol/luna. Se recuerda la elección (`localStorage`). |
| Top hero | La foto se rompe en fragmentos de vidrio al hacer scroll. "Descubrir más" lleva a About; "Ver merch" a Merch. Cinta del tracklist en movimiento (14 s). |
| About | Datos de la era, texto y "Un desamor / Que se vuelve rabia" superpuesto. |
| Concept photos | Composición exacta de Figma (desktop 1920 y mobile 393) para END, HATE y MESS. Pestañas para cambiar de era. |
| Polaroids | Carrusel de 3 fotos (la grupal de HATE, 5). Las flechas solo aparecen al hacer clic; al activar otra polaroid, la anterior se apaga. Con teclado: Enter y flechas ←/→. |
| Parallax | Capas a distinta velocidad: palabras gigantes y panel del fondo (lentas), títulos, fotos y fragmentos. Cada logo de miembro se mueve a la par con su foto. |
| Desenfoque | Dos fotos por era están "lejos" (borrosas); al seleccionarlas se enfocan. |
| Responsive | Desktop ≥ 901 px con la composición de 1920; ≤ 900 px usa la composición mobile. Respeta `prefers-reduced-motion`. |

## Dónde cambiar cosas
- **Fotos de cada carrusel:** `js/main.js` → objeto `SEL` (número de foto por era y miembro).
- **Fotos borrosas (lejos):** `js/main.js` → objeto `LEJOS`.
- **Velocidades del parallax:** `js/main.js` → objeto `VEL`.
- **Posiciones (si cambias la composición en Figma):** `js/main.js` → objeto `LAYOUT` (x, y y rotación en px de Figma).

## Pendiente
- Tracklist, Merch y Suscríbete: secciones simples hasta que tengan diseño en Figma.

*Fan site no oficial con fines académicos. Imágenes © BIGHIT MUSIC.*

## Merch: cómo agregar las inclusiones de los álbumes
1. Guarda los SVG de cada versión en `assets/img/merch/albumes/hate/`, `end/` y `mess/`.
2. Abre `js/merch-inclusiones.js` y escribe en `src` la ruta de cada SVG
   (por defecto: `photobook.svg`, `cd.svg`, `lyric.svg`, `photocard.svg`, `sticker.svg`).
3. En ese mismo archivo ajusta `x`, `y`, `w`, `r` y `z` de cada pieza (posición, ancho, giro y profundidad).
   Puedes agregar o quitar piezas: la interacción se adapta.
Mientras no haya ningún SVG, al pasar el cursor se ve la foto del contenido del álbum (el hover de Figma).

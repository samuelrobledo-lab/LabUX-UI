/* =========================================================
   Merch › Inclusiones de cada álbum (interacción de "unboxing")
   ---------------------------------------------------------
   AQUÍ VAN TUS RECURSOS VECTORIALES.
   1. Guarda cada SVG en:  assets/img/merch/albumes/<version>/
      (hate/, end/ o mess/). Ej: assets/img/merch/albumes/hate/cd.svg
   2. Escribe su ruta en "src". Mientras ningún archivo exista,
      la tarjeta usa el hover de Figma (foto del contenido del álbum).
   3. Ajusta la posición de cada pieza cuando el álbum está abierto.
      Todo se mide en % del área de la foto de la tarjeta:
        x, y  → esquina superior izquierda (0 = izquierda/arriba, 100 = derecha/abajo)
        w     → ancho (el alto sale de la proporción del SVG)
        r     → rotación en grados (negativo = antihorario)
        z     → profundidad: el número más alto queda encima
   Puedes agregar o quitar piezas: la interacción se adapta sola.
   ========================================================= */
window.INCLUSIONES = {
  hate: [
    { nombre: 'Photobook',  src: 'assets/img/merch/albumes/hate/photobook.svg',  x: 46, y: 12, w: 42, r:   5, z: 1 },
    { nombre: 'CD',         src: 'assets/img/merch/albumes/hate/cd.svg',         x: 56, y: 30, w: 38, r:  -8, z: 2 },
    { nombre: 'Lyric paper',src: 'assets/img/merch/albumes/hate/lyric.svg',      x: 48, y: 50, w: 30, r:  10, z: 3 },
    { nombre: 'Photocard',  src: 'assets/img/merch/albumes/hate/photocard.svg',  x: 72, y: 54, w: 20, r: -14, z: 4 },
    { nombre: 'Sticker',    src: 'assets/img/merch/albumes/hate/sticker.svg',    x: 62, y: 74, w: 24, r:   6, z: 5 }
  ],
  end: [
    { nombre: 'Photobook',  src: 'assets/img/merch/albumes/end/photobook.svg',   x: 48, y: 10, w: 42, r:  -4, z: 1 },
    { nombre: 'CD',         src: 'assets/img/merch/albumes/end/cd.svg',          x: 54, y: 32, w: 38, r:   9, z: 2 },
    { nombre: 'Lyric paper',src: 'assets/img/merch/albumes/end/lyric.svg',       x: 47, y: 54, w: 30, r:  -9, z: 3 },
    { nombre: 'Photocard',  src: 'assets/img/merch/albumes/end/photocard.svg',   x: 73, y: 50, w: 20, r:  12, z: 4 },
    { nombre: 'Sticker',    src: 'assets/img/merch/albumes/end/sticker.svg',     x: 60, y: 75, w: 24, r:  -5, z: 5 }
  ],
  mess: [
    { nombre: 'Photobook',  src: 'assets/img/merch/albumes/mess/photobook.svg',  x: 47, y: 13, w: 42, r:   3, z: 1 },
    { nombre: 'CD',         src: 'assets/img/merch/albumes/mess/cd.svg',         x: 57, y: 31, w: 38, r: -11, z: 2 },
    { nombre: 'Lyric paper',src: 'assets/img/merch/albumes/mess/lyric.svg',      x: 49, y: 52, w: 30, r:   7, z: 3 },
    { nombre: 'Photocard',  src: 'assets/img/merch/albumes/mess/photocard.svg',  x: 71, y: 57, w: 20, r: -10, z: 4 },
    { nombre: 'Sticker',    src: 'assets/img/merch/albumes/mess/sticker.svg',    x: 61, y: 76, w: 24, r:   8, z: 5 }
  ]
};

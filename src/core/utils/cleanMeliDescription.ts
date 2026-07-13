const FOOTER_MARKERS = [
  'importante para tu compra',
  'importante para tu producto',
  'importante!!',
  'importante:',
  'preguntas frecuentes',
];

/**
 * Keeps only from "TÍTULO:" / "TITULO:" up to before any footer marker.
 * Returns [cleanedText, wasChanged].
 */
export function cleanMeliDescription(texto: string | null): [string | null, boolean] {
  if (texto === null || texto === undefined) {
    return [null, false];
  }

  const original = texto;
  const s = original.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const low = s.toLowerCase();

  let idxTitulo = low.indexOf('título:');
  if (idxTitulo === -1) {
    idxTitulo = low.indexOf('titulo:');
  }

  if (idxTitulo === -1) {
    return [original, false];
  }

  const startSearch = idxTitulo;
  let endIdx = s.length;

  for (const marker of FOOTER_MARKERS) {
    const pos = low.indexOf(marker, startSearch);
    if (pos !== -1 && pos < endIdx) {
      endIdx = pos;
    }
  }

  const recortado = s.slice(idxTitulo, endIdx).trim();

  if (!recortado) {
    return [original, false];
  }

  if (recortado === original.trim()) {
    return [original, false];
  }

  return [recortado, true];
}

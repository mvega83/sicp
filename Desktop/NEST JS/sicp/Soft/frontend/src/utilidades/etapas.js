// Mismo orden que la barra lateral y que design/ui-general.html. Se usa en varias
// pantallas (Inicio, Banco de ideas) para no repetir esta lista y sus textos/colores
// de "pill" en cada una por separado.
export const ORDEN_ETAPAS = [
  'banco_ideas',
  'financiamiento',
  'aprobacion',
  'licitacion',
  'proveedor',
  'obra',
  'finalizacion',
];

const ESTADO_POR_ETAPA = {
  banco_ideas: { texto: 'En banco de ideas', tipo: 'info' },
  financiamiento: { texto: 'Buscando financiamiento', tipo: 'info' },
  aprobacion: { texto: 'En aprobación', tipo: 'warn' },
  licitacion: { texto: 'En licitación', tipo: 'warn' },
  proveedor: { texto: 'Proveedor asignado', tipo: 'info' },
  obra: { texto: 'Obra en avance', tipo: 'ok' },
  finalizacion: { texto: 'Finalizado', tipo: 'ok' },
};

/** Devuelve { texto, tipo } para pintar el "pill" de estado de un proyecto según su etapa actual. */
export function obtenerEstadoEtapa(etapa) {
  return ESTADO_POR_ETAPA[etapa] ?? { texto: etapa, tipo: 'info' };
}

/** Un proyecto solo puede editarse (datos generales del banco de ideas) mientras no haya avanzado de etapa. */
export function esEditable(etapa) {
  return etapa === ORDEN_ETAPAS[0];
}

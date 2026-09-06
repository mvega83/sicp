// El backend guarda en la base de datos una URL relativa por archivo (ej.
// "/visor/<uuid>.jpg"). Esta función arma la URL completa para usarla en un <img
// src> o un <a href>, pasando siempre por /visor/:nombreArchivo — nunca por una
// carpeta estática — para que el usuario no pueda ver en qué subcarpeta ni en qué
// ruta del disco vive el archivo real al hacer clic derecho > "Copiar dirección de
// la imagen".
//
// Se toma solo el último segmento de la URL guardada (el nombre del archivo) en vez
// de usar la URL completa tal cual, para que esto siga funcionando incluso con
// datos viejos guardados en el formato anterior ("/archivos-subidos/proyectos/...").
export function construirUrlArchivo(urlGuardada) {
  if (!urlGuardada) return '';
  const nombreArchivo = urlGuardada.split('/').filter(Boolean).pop();
  return `${import.meta.env.VITE_API_URL}/visor/${nombreArchivo}`;
}

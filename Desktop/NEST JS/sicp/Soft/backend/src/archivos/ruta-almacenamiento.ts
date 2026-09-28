import { join } from 'path';

// Mismas subcarpetas que ya usa cada controlador al subir un archivo (ver
// opcionesMulter(...) en cada *.controller.ts). VisorController las recorre para
// encontrar un archivo a partir de su nombre, sin que la URL tenga que decir en
// cuál vive.
export const SUBCARPETAS_ARCHIVOS = [
  'proyectos',
  'financiamiento',
  'aprobacion',
  'licitaciones',
  'proveedores',
  'obras',
  'finalizaciones',
];

/**
 * Carpeta física donde se guardan los archivos subidos (imágenes, documentos).
 * Se lee directo de process.env (no de ConfigService) porque opciones-multer.ts la
 * necesita en el momento en que se definen los decoradores de cada controlador,
 * antes de que Nest arranque la inyección de dependencias — el mismo motivo por el
 * que auth.module.ts lee las credenciales OAuth de process.env directamente.
 *
 * Vive fuera de "backend/" (ver CARPETA_ALMACENAMIENTO_ARCHIVOS en .env), como una
 * carpeta hermana de backend/frontend, con el mismo criterio de aislamiento que ya
 * se aplica a la base de datos: los archivos no dependen de la carpeta del backend
 * ni se mezclan con el código fuente.
 */
export function obtenerCarpetaAlmacenamiento(): string {
  return (
    process.env.CARPETA_ALMACENAMIENTO_ARCHIVOS ??
    join(__dirname, '..', '..', '..', 'archivos-subidos')
  );
}

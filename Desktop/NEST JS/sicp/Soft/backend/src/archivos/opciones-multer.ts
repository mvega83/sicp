import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { obtenerCarpetaAlmacenamiento } from './ruta-almacenamiento';

/**
 * Construye la configuración de Multer para guardar archivos en una subcarpeta
 * concreta (ej. "proyectos", "licitaciones") dentro de la carpeta de almacenamiento
 * externa (ver ruta-almacenamiento.ts), para no repetir esta configuración en cada
 * controlador que necesite subir archivos.
 */
export function opcionesMulter(subcarpeta: string, extensionesPermitidas: string[]) {
  return {
    storage: diskStorage({
      destination: (_req, _archivo, callback) => {
        const carpeta = join(obtenerCarpetaAlmacenamiento(), subcarpeta);
        // Crea la carpeta si todavía no existe, para no tener que dejarla creada a mano.
        mkdirSync(carpeta, { recursive: true });
        callback(null, carpeta);
      },
      filename: (_req, archivo, callback) => {
        const nombreUnico = `${randomUUID()}${extname(archivo.originalname)}`;
        callback(null, nombreUnico);
      },
    }),
    fileFilter: (
      _req: unknown,
      archivo: Express.Multer.File,
      callback: (error: Error | null, aceptar: boolean) => void,
    ) => {
      const extension = extname(archivo.originalname).toLowerCase();
      if (!extensionesPermitidas.includes(extension)) {
        callback(
          new BadRequestException(
            `Extensión no permitida. Se aceptan: ${extensionesPermitidas.join(', ')}`,
          ),
          false,
        );
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  };
}

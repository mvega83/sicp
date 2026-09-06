import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { obtenerCarpetaAlmacenamiento, SUBCARPETAS_ARCHIVOS } from './ruta-almacenamiento';

/**
 * Entrega el contenido de un archivo subido (imagen, PDF, etc.) a partir de su
 * nombre, sin que la URL revele en qué subcarpeta ni en qué ruta del disco vive
 * realmente — a diferencia de antes, cuando los archivos se servían como estáticos
 * en "/archivos-subidos/<subcarpeta>/<archivo>" y esa ruta quedaba visible al hacer
 * clic derecho > "Copiar dirección de la imagen".
 *
 * No hace falta que quien llama diga la subcarpeta: como cada archivo se guarda con
 * un nombre único (UUID, ver opciones-multer.ts), alcanza con buscarlo en las
 * subcarpetas conocidas.
 */
@Controller('visor')
export class VisorController {
  @Get(':nombreArchivo')
  verArchivo(@Param('nombreArchivo') nombreArchivo: string, @Res() respuesta: Response) {
    // basename() evita que alguien mande algo como "../../.env" y se salga de la
    // carpeta de archivos subidos.
    const nombreSeguro = basename(nombreArchivo);
    const carpetaBase = obtenerCarpetaAlmacenamiento();

    for (const subcarpeta of SUBCARPETAS_ARCHIVOS) {
      const rutaCompleta = join(carpetaBase, subcarpeta, nombreSeguro);
      if (existsSync(rutaCompleta)) {
        // "inline" (por defecto en sendFile) para que las imágenes/PDF se vean
        // directo en el navegador, en vez de forzar una descarga.
        return respuesta.sendFile(rutaCompleta);
      }
    }
    throw new NotFoundException('Archivo no encontrado');
  }
}

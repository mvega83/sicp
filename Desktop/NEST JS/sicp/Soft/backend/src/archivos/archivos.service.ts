import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { obtenerCarpetaAlmacenamiento, SUBCARPETAS_ARCHIVOS } from './ruta-almacenamiento';

@Injectable()
export class ArchivosService {
  /**
   * Arma la URL con la que el frontend puede mostrar/descargar un archivo subido:
   * pasa por VisorController en vez de una ruta estática, para no revelar en qué
   * subcarpeta ni en qué ruta del disco vive el archivo real.
   * Si en el futuro los archivos se mueven a un almacenamiento externo (ej. un
   * bucket S3), este es el único método que habría que cambiar — los controladores
   * que suben archivos no tendrían que tocarse.
   */
  construirUrlPublica(nombreArchivo: string): string {
    return `/visor/${nombreArchivo}`;
  }

  /**
   * Borra el archivo físico del disco a partir de su nombre (mismo criterio de
   * búsqueda que VisorController: recorre las subcarpetas conocidas). Si no lo
   * encuentra no lanza error — igual hay que sacar la referencia de la base de
   * datos, y no vale la pena que eso falle por un archivo que ya no está.
   */
  eliminarArchivoFisico(nombreArchivo: string): void {
    const nombreSeguro = basename(nombreArchivo);
    const carpetaBase = obtenerCarpetaAlmacenamiento();

    for (const subcarpeta of SUBCARPETAS_ARCHIVOS) {
      const rutaCompleta = join(carpetaBase, subcarpeta, nombreSeguro);
      if (existsSync(rutaCompleta)) {
        unlinkSync(rutaCompleta);
        return;
      }
    }
  }
}

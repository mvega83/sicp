import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { Client } from 'basic-ftp';
import { obtenerCarpetaAlmacenamiento, SUBCARPETAS_ARCHIVOS } from './ruta-almacenamiento';

@Injectable()
export class ArchivosService {
  /**
   * Guarda el archivo que Multer ya escribió en el disco local y devuelve la URL
   * pública con la que el frontend puede mostrarlo/descargarlo.
   *
   * - En desarrollo (sin FTP_HOST configurado) el archivo se queda donde Multer lo
   *   dejó y se sirve a través de VisorController, como siempre.
   * - En producción sobre un hosting con disco efímero (ej. Render), el archivo se
   *   sube por FTP al hosting cPanel —que sí tiene disco persistente— y la copia
   *   local se borra apenas se confirma la subida, para no dejar basura en un disco
   *   que de todas formas se reinicia en cada despliegue.
   */
  async guardarArchivo(archivo: Express.Multer.File): Promise<string> {
    if (!process.env.FTP_HOST) {
      return `/visor/${archivo.filename}`;
    }

    const subcarpeta = basename(archivo.destination);
    const cliente = new Client();
    try {
      await cliente.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USUARIO,
        password: process.env.FTP_CLAVE,
        secure: process.env.FTP_SEGURO !== 'false',
      });
      const carpetaRemota = `${process.env.FTP_RUTA_BASE ?? 'archivos-subidos'}/${subcarpeta}`;
      await cliente.ensureDir(carpetaRemota);
      await cliente.uploadFrom(archivo.path, archivo.filename);
    } finally {
      cliente.close();
    }

    unlinkSync(archivo.path);

    const baseUrl = (process.env.FTP_URL_PUBLICA ?? '').replace(/\/$/, '');
    return `${baseUrl}/${subcarpeta}/${archivo.filename}`;
  }

  /**
   * Borra el archivo a partir de su nombre. En desarrollo lo busca en el disco
   * local recorriendo las subcarpetas conocidas (mismo criterio que
   * VisorController); con FTP configurado, intenta borrarlo de cada subcarpeta
   * remota hasta encontrarlo. Si no lo encuentra no lanza error — igual hay que
   * sacar la referencia de la base de datos, y no vale la pena que eso falle por
   * un archivo que ya no está.
   */
  async eliminarArchivoFisico(nombreArchivo: string): Promise<void> {
    const nombreSeguro = basename(nombreArchivo);

    if (!process.env.FTP_HOST) {
      const carpetaBase = obtenerCarpetaAlmacenamiento();
      for (const subcarpeta of SUBCARPETAS_ARCHIVOS) {
        const rutaCompleta = join(carpetaBase, subcarpeta, nombreSeguro);
        if (existsSync(rutaCompleta)) {
          unlinkSync(rutaCompleta);
          return;
        }
      }
      return;
    }

    const cliente = new Client();
    try {
      await cliente.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USUARIO,
        password: process.env.FTP_CLAVE,
        secure: process.env.FTP_SEGURO !== 'false',
      });
      const rutaBase = process.env.FTP_RUTA_BASE ?? 'archivos-subidos';
      for (const subcarpeta of SUBCARPETAS_ARCHIVOS) {
        try {
          await cliente.remove(`${rutaBase}/${subcarpeta}/${nombreSeguro}`);
          return;
        } catch {
          // No está en esta subcarpeta — se sigue probando con las demás.
        }
      }
    } finally {
      cliente.close();
    }
  }
}

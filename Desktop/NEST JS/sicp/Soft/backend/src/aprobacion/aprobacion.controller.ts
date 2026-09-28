import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AprobacionService } from './aprobacion.service';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('aprobacion')
@UseGuards(JwtAuthGuard)
export class AprobacionController {
  constructor(
    private readonly aprobacionService: AprobacionService,
    private readonly archivosService: ArchivosService,
  ) {}

  // Mismo criterio que /financiamiento/documentos: el id del proyecto va en el
  // body porque el archivo se sube a un endpoint fijo, no anidado bajo /:id.
  @Post('documentos')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('aprobacion', ['.jpg', '.jpeg', '.png', '.webp', '.pdf'])),
  )
  async subirDocumento(@Body('idProyecto') idProyecto: string, @UploadedFile() archivo: Express.Multer.File) {
    const url = await this.archivosService.guardarArchivo(archivo);
    return this.aprobacionService.agregarDocumento(idProyecto, url);
  }

  @Get('documentos')
  listarDocumentos(@Query('idProyecto') idProyecto: string) {
    return this.aprobacionService.listarDocumentos(idProyecto);
  }

  @Delete('documentos/:id')
  async eliminarDocumento(@Param('id') id: string) {
    const documento = await this.aprobacionService.obtenerDocumento(id);
    const nombreArchivo = documento.url.split('/').pop() ?? documento.url;
    await this.archivosService.eliminarArchivoFisico(nombreArchivo);
    await this.aprobacionService.eliminarDocumento(id);
  }
}

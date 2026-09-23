import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado';
import { FinanciamientoService } from './financiamiento.service';
import { CrearFinanciamientoDto } from './dto/crear-financiamiento.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('financiamiento')
@UseGuards(JwtAuthGuard)
export class FinanciamientoController {
  constructor(
    private readonly financiamientoService: FinanciamientoService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearFinanciamientoDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.financiamientoService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get()
  listar(@Query('idProyecto') idProyecto: string) {
    return this.financiamientoService.listarPorProyecto(idProyecto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.financiamientoService.eliminar(id);
  }

  // Documentos generales de la etapa (no ligados a una fuente puntual): mismo
  // criterio que /proyectos/:id/imagenes, solo que acá el id del proyecto va en
  // el body porque el archivo se sube a un endpoint fijo, no anidado bajo /:id.
  @Post('documentos')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('financiamiento', ['.jpg', '.jpeg', '.png', '.webp', '.pdf'])),
  )
  subirDocumento(@Body('idProyecto') idProyecto: string, @UploadedFile() archivo: Express.Multer.File) {
    const url = this.archivosService.construirUrlPublica(archivo.filename);
    return this.financiamientoService.agregarDocumento(idProyecto, url);
  }

  @Get('documentos')
  listarDocumentos(@Query('idProyecto') idProyecto: string) {
    return this.financiamientoService.listarDocumentos(idProyecto);
  }

  @Delete('documentos/:id')
  async eliminarDocumento(@Param('id') id: string) {
    const documento = await this.financiamientoService.obtenerDocumento(id);
    const nombreArchivo = documento.url.split('/').pop() ?? documento.url;
    this.archivosService.eliminarArchivoFisico(nombreArchivo);
    await this.financiamientoService.eliminarDocumento(id);
  }

  // Decretos: a diferencia de "documentos" (generales de la etapa), cada uno queda
  // ligado a una fuente de financiamiento puntual (idFuenteFinanciamiento).
  @Post('decretos')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('financiamiento', ['.jpg', '.jpeg', '.png', '.webp', '.pdf'])),
  )
  subirDecreto(
    @Body() body: { idFuenteFinanciamiento: string; fechaDecreto: string },
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const urlDecreto = this.archivosService.construirUrlPublica(archivo.filename);
    return this.financiamientoService.agregarDecreto(
      body.idFuenteFinanciamiento,
      body.fechaDecreto,
      urlDecreto,
    );
  }

  @Get('decretos')
  listarDecretos(@Query('idFuenteFinanciamiento') idFuenteFinanciamiento: string) {
    return this.financiamientoService.listarDecretosPorFuente(idFuenteFinanciamiento);
  }

  @Delete('decretos/:id')
  async eliminarDecreto(@Param('id') id: string) {
    const decreto = await this.financiamientoService.obtenerDecreto(id);
    const nombreArchivo = decreto.urlDecreto.split('/').pop() ?? decreto.urlDecreto;
    this.archivosService.eliminarArchivoFisico(nombreArchivo);
    await this.financiamientoService.eliminarDecreto(id);
  }
}

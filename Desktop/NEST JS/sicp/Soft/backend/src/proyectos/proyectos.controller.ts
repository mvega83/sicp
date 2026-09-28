import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { ProyectosService } from './proyectos.service';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';

@Controller('proyectos')
@UseGuards(JwtAuthGuard)
export class ProyectosController {
  constructor(
    private readonly proyectosService: ProyectosService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearProyectoDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.proyectosService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get()
  listar(@Query('etapa') etapa?: EtapaProyecto) {
    return this.proyectosService.listar(etapa);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.proyectosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarProyectoDto,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    return this.proyectosService.actualizar(id, datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.proyectosService.eliminar(id);
  }

  @Post(':id/enviar-a-financiamiento')
  enviarAFinanciamiento(@Param('id') id: string, @Req() req: { user: UsuarioAutenticado }) {
    return this.proyectosService.enviarAFinanciamiento(id, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Post(':id/enviar-a-aprobacion')
  enviarAAprobacion(@Param('id') id: string, @Req() req: { user: UsuarioAutenticado }) {
    return this.proyectosService.enviarAAprobacion(id, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Post(':id/enviar-a-licitacion')
  enviarALicitacion(@Param('id') id: string, @Req() req: { user: UsuarioAutenticado }) {
    return this.proyectosService.enviarALicitacion(id, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Post(':id/imagenes')
  @UseInterceptors(
    FileInterceptor('imagen', opcionesMulter('proyectos', ['.jpg', '.jpeg', '.png', '.webp', '.pdf'])),
  )
  async subirImagen(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const urlImagen = this.archivosService.construirUrlPublica(archivo.filename);
    return this.proyectosService.agregarImagen(id, urlImagen, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Delete(':id/imagenes/:nombreArchivo')
  eliminarImagen(
    @Param('id') id: string,
    @Param('nombreArchivo') nombreArchivo: string,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    this.archivosService.eliminarArchivoFisico(nombreArchivo);
    return this.proyectosService.eliminarImagen(id, nombreArchivo, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

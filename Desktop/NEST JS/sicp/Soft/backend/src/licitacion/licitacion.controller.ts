import {
  Body,
  Controller,
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
import { LicitacionService } from './licitacion.service';
import { CrearLicitacionDto } from './dto/crear-licitacion.dto';
import { ActualizarLicitacionDto } from './dto/actualizar-licitacion.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('licitacion')
@UseGuards(JwtAuthGuard)
export class LicitacionController {
  constructor(
    private readonly licitacionService: LicitacionService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearLicitacionDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.licitacionService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get()
  listar(@Query('idProyecto') idProyecto: string) {
    return this.licitacionService.listarPorProyecto(idProyecto);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.licitacionService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarLicitacionDto,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    return this.licitacionService.actualizar(id, datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Post(':id/archivo-rex')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('licitaciones', ['.pdf', '.doc', '.docx'])),
  )
  async adjuntarRex(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const url = this.archivosService.construirUrlPublica(archivo.filename);
    return this.licitacionService.adjuntarRex(id, url, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

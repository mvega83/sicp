import {
  Body,
  Controller,
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
import { FinalizacionService } from './finalizacion.service';
import { CrearFinalizacionDto } from './dto/crear-finalizacion.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('finalizacion')
@UseGuards(JwtAuthGuard)
export class FinalizacionController {
  constructor(
    private readonly finalizacionService: FinalizacionService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearFinalizacionDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.finalizacionService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get()
  obtenerPorProyecto(@Query('idProyecto') idProyecto: string) {
    return this.finalizacionService.obtenerPorProyecto(idProyecto);
  }

  @Post(':id/documento-cierre')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('finalizaciones', ['.pdf', '.jpg', '.jpeg', '.png'])),
  )
  async adjuntarDocumento(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const url = this.archivosService.construirUrlPublica(archivo.filename);
    return this.finalizacionService.adjuntarDocumentoCierre(id, url, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

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
import { ObraService } from './obra.service';
import { CrearEstadoPagoDto } from './dto/crear-estado-pago.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('obra')
@UseGuards(JwtAuthGuard)
export class ObraController {
  constructor(
    private readonly obraService: ObraService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post('estados-pago')
  crear(@Body() datos: CrearEstadoPagoDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.obraService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get('estados-pago')
  listar(@Query('idProyecto') idProyecto: string) {
    return this.obraService.listarPorProyecto(idProyecto);
  }

  @Get('estados-pago/:id')
  obtenerUno(@Param('id') id: string) {
    return this.obraService.obtenerPorId(id);
  }

  @Post('estados-pago/:id/documento')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('obras', ['.pdf', '.jpg', '.jpeg', '.png'])),
  )
  async adjuntarDocumento(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const url = this.archivosService.construirUrlPublica(archivo.filename);
    return this.obraService.adjuntarDocumento(id, url, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

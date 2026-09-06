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
import { ProveedorService } from './proveedor.service';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('proveedor')
@UseGuards(JwtAuthGuard)
export class ProveedorController {
  constructor(
    private readonly proveedorService: ProveedorService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearProveedorDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.proveedorService.crear(datos, `${req.user.nombres} ${req.user.apellidos}`);
  }

  @Get()
  listar(@Query('idProyecto') idProyecto: string) {
    return this.proveedorService.listarPorProyecto(idProyecto);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.proveedorService.obtenerPorId(id);
  }

  @Post(':id/boleta-garantia')
  @UseInterceptors(
    FileInterceptor('archivo', opcionesMulter('proveedores', ['.pdf', '.jpg', '.jpeg', '.png'])),
  )
  async adjuntarBoletaGarantia(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const url = this.archivosService.construirUrlPublica(archivo.filename);
    return this.proveedorService.adjuntarBoletaGarantia(id, url, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado';
import { FinanciamientoService } from './financiamiento.service';
import { CrearFinanciamientoDto } from './dto/crear-financiamiento.dto';

@Controller('financiamiento')
@UseGuards(JwtAuthGuard)
export class FinanciamientoController {
  constructor(private readonly financiamientoService: FinanciamientoService) {}

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
}

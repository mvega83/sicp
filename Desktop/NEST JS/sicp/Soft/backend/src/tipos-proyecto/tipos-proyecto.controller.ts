import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TiposProyectoService } from './tipos-proyecto.service';
import { CrearTipoProyectoDto } from './dto/crear-tipo-proyecto.dto';
import { ActualizarTipoProyectoDto } from './dto/actualizar-tipo-proyecto.dto';

@Controller('tipos-proyecto')
@UseGuards(JwtAuthGuard)
export class TiposProyectoController {
  constructor(private readonly tiposProyectoService: TiposProyectoService) {}

  @Post()
  crear(@Body() datos: CrearTipoProyectoDto) {
    return this.tiposProyectoService.crear(datos);
  }

  @Get()
  listar() {
    return this.tiposProyectoService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.tiposProyectoService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarTipoProyectoDto) {
    return this.tiposProyectoService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.tiposProyectoService.eliminar(id);
  }
}

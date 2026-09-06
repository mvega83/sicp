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
import { UnidadesService } from './unidades.service';
import { CrearUnidadDto } from './dto/crear-unidad.dto';
import { ActualizarUnidadDto } from './dto/actualizar-unidad.dto';

@Controller('unidades')
@UseGuards(JwtAuthGuard)
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  crear(@Body() datos: CrearUnidadDto) {
    return this.unidadesService.crear(datos);
  }

  @Get()
  listar() {
    return this.unidadesService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.unidadesService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarUnidadDto) {
    return this.unidadesService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.unidadesService.eliminar(id);
  }
}

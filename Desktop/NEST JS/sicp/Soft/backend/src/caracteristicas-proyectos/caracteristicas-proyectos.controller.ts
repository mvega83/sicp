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
import { CaracteristicasProyectosService } from './caracteristicas-proyectos.service';
import { CrearCaracteristicaProyectoDto } from './dto/crear-caracteristica-proyecto.dto';
import { ActualizarCaracteristicaProyectoDto } from './dto/actualizar-caracteristica-proyecto.dto';

@Controller('caracteristicas-proyectos')
@UseGuards(JwtAuthGuard)
export class CaracteristicasProyectosController {
  constructor(
    private readonly caracteristicasProyectosService: CaracteristicasProyectosService,
  ) {}

  @Post()
  crear(@Body() datos: CrearCaracteristicaProyectoDto) {
    return this.caracteristicasProyectosService.crear(datos);
  }

  @Get()
  listar() {
    return this.caracteristicasProyectosService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.caracteristicasProyectosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarCaracteristicaProyectoDto) {
    return this.caracteristicasProyectosService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.caracteristicasProyectosService.eliminar(id);
  }
}

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
import { LocalidadesService } from './localidades.service';
import { CrearLocalidadDto } from './dto/crear-localidad.dto';
import { ActualizarLocalidadDto } from './dto/actualizar-localidad.dto';

@Controller('localidades')
@UseGuards(JwtAuthGuard)
export class LocalidadesController {
  constructor(private readonly localidadesService: LocalidadesService) {}

  @Post()
  crear(@Body() datos: CrearLocalidadDto) {
    return this.localidadesService.crear(datos);
  }

  @Get()
  listar() {
    return this.localidadesService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.localidadesService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarLocalidadDto) {
    return this.localidadesService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.localidadesService.eliminar(id);
  }
}

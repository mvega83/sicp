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
import { TipoFuenteFinanciamientoService } from './tipo-fuente-financiamiento.service';
import { CrearTipoFuenteFinanciamientoDto } from './dto/crear-tipo-fuente-financiamiento.dto';
import { ActualizarTipoFuenteFinanciamientoDto } from './dto/actualizar-tipo-fuente-financiamiento.dto';

@Controller('tipos-fuente-financiamiento')
@UseGuards(JwtAuthGuard)
export class TipoFuenteFinanciamientoController {
  constructor(private readonly tipoFuenteFinanciamientoService: TipoFuenteFinanciamientoService) {}

  @Post()
  crear(@Body() datos: CrearTipoFuenteFinanciamientoDto) {
    return this.tipoFuenteFinanciamientoService.crear(datos);
  }

  @Get()
  listar() {
    return this.tipoFuenteFinanciamientoService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.tipoFuenteFinanciamientoService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarTipoFuenteFinanciamientoDto) {
    return this.tipoFuenteFinanciamientoService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.tipoFuenteFinanciamientoService.eliminar(id);
  }
}

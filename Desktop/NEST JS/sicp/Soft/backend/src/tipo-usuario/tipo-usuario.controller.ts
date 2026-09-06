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
import { TipoUsuarioService } from './tipo-usuario.service';
import { CrearTipoUsuarioDto } from './dto/crear-tipo-usuario.dto';
import { ActualizarTipoUsuarioDto } from './dto/actualizar-tipo-usuario.dto';

@Controller('tipos-usuario')
@UseGuards(JwtAuthGuard)
export class TipoUsuarioController {
  constructor(private readonly tipoUsuarioService: TipoUsuarioService) {}

  @Post()
  crear(@Body() datos: CrearTipoUsuarioDto) {
    return this.tipoUsuarioService.crear(datos);
  }

  @Get()
  listar() {
    return this.tipoUsuarioService.listar();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.tipoUsuarioService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarTipoUsuarioDto) {
    return this.tipoUsuarioService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.tipoUsuarioService.eliminar(id);
  }
}

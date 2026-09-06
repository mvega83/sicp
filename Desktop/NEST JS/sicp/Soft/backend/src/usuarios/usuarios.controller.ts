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
import { omitirContrasena } from '../comun/utilidades/omitir-contrasena';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async crear(@Body() datos: CrearUsuarioDto) {
    return omitirContrasena(await this.usuariosService.crear(datos));
  }

  @Get()
  async listar() {
    const usuarios = await this.usuariosService.listar();
    return usuarios.map(omitirContrasena);
  }

  @Get(':id')
  async obtenerUno(@Param('id') id: string) {
    return omitirContrasena(await this.usuariosService.obtenerPorId(id));
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() datos: ActualizarUsuarioDto) {
    return omitirContrasena(await this.usuariosService.actualizar(id, datos));
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.usuariosService.eliminar(id);
  }
}

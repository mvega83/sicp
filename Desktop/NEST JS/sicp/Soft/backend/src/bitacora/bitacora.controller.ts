import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado';
import { BitacoraService } from './bitacora.service';
import { CrearEventoBitacoraDto } from './dto/crear-evento-bitacora.dto';
import { ActualizarEventoBitacoraDto } from './dto/actualizar-evento-bitacora.dto';
import { EtapaProyecto } from './entidades/bitacora.entity';

@Controller('bitacora')
@UseGuards(JwtAuthGuard)
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  /** Ej: GET /bitacora?idProyecto=xxx o GET /bitacora?idProyecto=xxx&etapa=obra */
  @Get()
  listar(
    @Query('idProyecto') idProyecto: string,
    @Query('etapa') etapa?: EtapaProyecto,
  ) {
    return this.bitacoraService.listarPorProyecto(idProyecto, etapa);
  }

  // A diferencia de los eventos automáticos que registran los módulos de cada etapa
  // (ej. "se creó el registro de financiamiento"), este endpoint deja que el propio
  // usuario agregue una observación libre (ej. desde Banco de Ideas).
  @Post()
  crear(@Body() datos: CrearEventoBitacoraDto, @Req() req: { user: UsuarioAutenticado }) {
    return this.bitacoraService.agregarComentario(
      datos.idProyecto,
      datos.descripcion,
      `${req.user.nombres} ${req.user.apellidos}`,
    );
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarEventoBitacoraDto) {
    return this.bitacoraService.actualizarEvento(id, datos.descripcion);
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BitacoraService } from './bitacora.service';
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
}

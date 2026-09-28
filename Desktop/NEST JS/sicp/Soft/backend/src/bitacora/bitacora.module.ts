import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bitacora } from './entidades/bitacora.entity';
import { Proyecto } from '../proyectos/entidades/proyecto.entity';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';

@Module({
  // Se registra el repositorio de Proyecto (no ProyectosModule completo) para poder
  // consultar la etapa actual de un proyecto al crear/editar comentarios, sin
  // generar una dependencia circular: ProyectosModule ya importa BitacoraModule.
  imports: [TypeOrmModule.forFeature([Bitacora, Proyecto])],
  controllers: [BitacoraController],
  providers: [BitacoraService],
  exports: [BitacoraService],
})
export class BitacoraModule {}

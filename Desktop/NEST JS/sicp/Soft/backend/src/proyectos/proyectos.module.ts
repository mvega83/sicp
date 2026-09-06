import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entidades/proyecto.entity';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto]), BitacoraModule, ArchivosModule],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  // Se exporta ProyectosService y el repositorio (vía TypeOrmModule) para que los
  // módulos de las etapas 2 a 6 puedan verificar que un proyecto existe y avanzarlo
  // de etapa sin duplicar lógica.
  exports: [ProyectosService, TypeOrmModule],
})
export class ProyectosModule {}

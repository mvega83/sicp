import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entidades/proyecto.entity';
import { CaracteristicaProyecto } from '../caracteristicas-proyectos/entidades/caracteristica-proyecto.entity';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  // CaracteristicaProyecto se agrega acá (no importando ProyectosModule desde
  // caracteristicas-proyectos) solo para poder inyectar su repositorio y resolver
  // los ids que llegan en el DTO a entidades reales antes de guardar la relación.
  imports: [
    TypeOrmModule.forFeature([Proyecto, CaracteristicaProyecto]),
    BitacoraModule,
    ArchivosModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  // Se exporta ProyectosService y el repositorio (vía TypeOrmModule) para que los
  // módulos de las etapas 2 a 6 puedan verificar que un proyecto existe y avanzarlo
  // de etapa sin duplicar lógica.
  exports: [ProyectosService, TypeOrmModule],
})
export class ProyectosModule {}

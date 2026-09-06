import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaracteristicaProyecto } from './entidades/caracteristica-proyecto.entity';
import { CaracteristicasProyectosService } from './caracteristicas-proyectos.service';
import { CaracteristicasProyectosController } from './caracteristicas-proyectos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaracteristicaProyecto])],
  controllers: [CaracteristicasProyectosController],
  providers: [CaracteristicasProyectosService],
})
export class CaracteristicasProyectosModule {}

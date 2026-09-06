import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuenteFinanciamiento } from './entidades/fuente-financiamiento.entity';
import { FinanciamientoService } from './financiamiento.service';
import { FinanciamientoController } from './financiamiento.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [TypeOrmModule.forFeature([FuenteFinanciamiento]), BitacoraModule, ProyectosModule],
  controllers: [FinanciamientoController],
  providers: [FinanciamientoService],
})
export class FinanciamientoModule {}

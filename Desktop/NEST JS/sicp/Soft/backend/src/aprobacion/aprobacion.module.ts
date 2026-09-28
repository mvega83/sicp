import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoAprobacion } from './entidades/documento-aprobacion.entity';
import { AprobacionService } from './aprobacion.service';
import { AprobacionController } from './aprobacion.controller';
import { ProyectosModule } from '../proyectos/proyectos.module';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoAprobacion]), ProyectosModule, ArchivosModule],
  controllers: [AprobacionController],
  providers: [AprobacionService],
})
export class AprobacionModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licitacion } from './entidades/licitacion.entity';
import { LicitacionService } from './licitacion.service';
import { LicitacionController } from './licitacion.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Licitacion]),
    BitacoraModule,
    ArchivosModule,
    ProyectosModule,
  ],
  controllers: [LicitacionController],
  providers: [LicitacionService],
})
export class LicitacionModule {}

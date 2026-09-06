import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finalizacion } from './entidades/finalizacion.entity';
import { FinalizacionService } from './finalizacion.service';
import { FinalizacionController } from './finalizacion.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finalizacion]),
    BitacoraModule,
    ArchivosModule,
    ProyectosModule,
  ],
  controllers: [FinalizacionController],
  providers: [FinalizacionService],
})
export class FinalizacionModule {}

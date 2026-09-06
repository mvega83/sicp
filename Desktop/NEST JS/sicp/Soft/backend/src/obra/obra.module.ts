import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPago } from './entidades/estado-pago.entity';
import { ObraService } from './obra.service';
import { ObraController } from './obra.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoPago]), BitacoraModule, ArchivosModule, ProyectosModule],
  controllers: [ObraController],
  providers: [ObraService],
})
export class ObraModule {}

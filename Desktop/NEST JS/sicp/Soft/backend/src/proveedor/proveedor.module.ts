import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entidades/proveedor.entity';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ArchivosModule } from '../archivos/archivos.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proveedor]),
    BitacoraModule,
    ArchivosModule,
    ProyectosModule,
  ],
  controllers: [ProveedorController],
  providers: [ProveedorService],
})
export class ProveedorModule {}

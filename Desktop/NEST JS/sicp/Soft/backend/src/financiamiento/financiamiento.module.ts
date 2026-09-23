import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuenteFinanciamiento } from './entidades/fuente-financiamiento.entity';
import { DocumentoFinanciamiento } from './entidades/documento-financiamiento.entity';
import { DecretoFinanciamiento } from './entidades/decreto-financiamiento.entity';
import { TipoFuenteFinanciamiento } from '../tipo-fuente-financiamiento/entidades/tipo-fuente-financiamiento.entity';
import { FinanciamientoService } from './financiamiento.service';
import { FinanciamientoController } from './financiamiento.controller';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ProyectosModule } from '../proyectos/proyectos.module';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuenteFinanciamiento,
      DocumentoFinanciamiento,
      DecretoFinanciamiento,
      TipoFuenteFinanciamiento,
    ]),
    BitacoraModule,
    ProyectosModule,
    ArchivosModule,
  ],
  controllers: [FinanciamientoController],
  providers: [FinanciamientoService],
})
export class FinanciamientoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoFuenteFinanciamiento } from './entidades/tipo-fuente-financiamiento.entity';
import { TipoFuenteFinanciamientoService } from './tipo-fuente-financiamiento.service';
import { TipoFuenteFinanciamientoController } from './tipo-fuente-financiamiento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoFuenteFinanciamiento])],
  controllers: [TipoFuenteFinanciamientoController],
  providers: [TipoFuenteFinanciamientoService],
})
export class TipoFuenteFinanciamientoModule {}

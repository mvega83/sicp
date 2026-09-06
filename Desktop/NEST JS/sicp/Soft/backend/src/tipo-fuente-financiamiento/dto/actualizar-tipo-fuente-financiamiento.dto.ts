import { PartialType } from '@nestjs/mapped-types';
import { CrearTipoFuenteFinanciamientoDto } from './crear-tipo-fuente-financiamiento.dto';

export class ActualizarTipoFuenteFinanciamientoDto extends PartialType(
  CrearTipoFuenteFinanciamientoDto,
) {}

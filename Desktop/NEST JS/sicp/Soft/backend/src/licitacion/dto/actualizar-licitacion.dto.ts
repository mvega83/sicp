import { PartialType } from '@nestjs/mapped-types';
import { CrearLicitacionDto } from './crear-licitacion.dto';

// Se usa para ir completando fechas a medida que avanza la licitación (respuesta,
// finalización, adjudicación) sin tener que reenviar todo el registro.
export class ActualizarLicitacionDto extends PartialType(CrearLicitacionDto) {}

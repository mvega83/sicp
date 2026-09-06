import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CrearUnidadDto } from './crear-unidad.dto';

export class ActualizarUnidadDto extends PartialType(CrearUnidadDto) {
  // No va en CrearUnidadDto porque toda unidad nueva nace activa (estado = 1 por
  // defecto en la entidad) — este campo solo tiene sentido al editar.
  @IsOptional()
  @IsIn([1, -1], { message: 'El estado debe ser 1 (activo) o -1 (de baja)' })
  estado?: number;
}

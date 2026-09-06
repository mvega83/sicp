import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CrearCaracteristicaProyectoDto } from './crear-caracteristica-proyecto.dto';

export class ActualizarCaracteristicaProyectoDto extends PartialType(
  CrearCaracteristicaProyectoDto,
) {
  // No va en CrearCaracteristicaProyectoDto porque toda característica nueva nace
  // activa (estado = 1 por defecto en la entidad) — este campo solo tiene sentido
  // al editar.
  @IsOptional()
  @IsIn([1, -1], { message: 'El estado debe ser 1 (activo) o -1 (inactivo)' })
  estado?: number;
}

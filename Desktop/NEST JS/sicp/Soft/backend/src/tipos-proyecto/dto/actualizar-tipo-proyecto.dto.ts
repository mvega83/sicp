import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CrearTipoProyectoDto } from './crear-tipo-proyecto.dto';

export class ActualizarTipoProyectoDto extends PartialType(CrearTipoProyectoDto) {
  @IsOptional()
  @IsIn([1, -1], { message: 'El estado debe ser 1 (activo) o -1 (inactivo)' })
  estado?: number;
}

import { IsDateString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CrearFinalizacionDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsDateString({}, { message: 'La fecha de cierre no es válida' })
  fechaCierre: string;

  @IsOptional()
  @MaxLength(2000)
  observacionesFinales?: string;
}

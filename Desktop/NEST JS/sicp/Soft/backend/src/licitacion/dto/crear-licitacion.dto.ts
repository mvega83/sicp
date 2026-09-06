import { IsDateString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CrearLicitacionDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsNotEmpty({ message: 'Debes indicar el id de la licitación (ej. de Mercado Público)' })
  @MaxLength(100)
  idLicitacionExterna: string;

  @IsNotEmpty({ message: 'Debes indicar quién es el responsable' })
  @MaxLength(150)
  responsable: string;

  @IsDateString({}, { message: 'La fecha de licitación no es válida' })
  fechaLicitacion: string;

  @IsOptional()
  @IsDateString()
  fechaRespuesta?: string;

  @IsOptional()
  @IsDateString()
  fechaFinalizacion?: string;

  @IsOptional()
  @IsDateString()
  fechaAdjudicacion?: string;
}

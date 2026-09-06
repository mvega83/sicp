import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, MaxLength } from 'class-validator';

export class CrearFinanciamientoDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsNotEmpty({ message: 'Debes indicar el nombre de la fuente de financiamiento' })
  @MaxLength(150)
  nombreFuente: string;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsOptional()
  @MaxLength(1000)
  observaciones?: string;
}

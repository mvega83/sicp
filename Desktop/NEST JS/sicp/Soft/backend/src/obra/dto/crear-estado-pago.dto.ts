import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearEstadoPagoDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsNotEmpty({ message: 'Debes indicar el ITO a cargo' })
  @MaxLength(150)
  ito: string;

  @IsInt()
  @Min(1)
  numeroEstadoPago: number;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsDateString({}, { message: 'La fecha no es válida' })
  fecha: string;

  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;
}

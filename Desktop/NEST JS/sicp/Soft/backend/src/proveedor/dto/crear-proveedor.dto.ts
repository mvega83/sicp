import { IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CrearProveedorDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  @MaxLength(200)
  nombreEmpresa: string;

  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio' })
  @MaxLength(20)
  rutEmpresa: string;

  @IsOptional()
  @MaxLength(2000)
  datosGenerales?: string;

  @IsNotEmpty({ message: 'Debes indicar el banco' })
  @MaxLength(100)
  banco: string;

  @IsNotEmpty({ message: 'Debes indicar el tipo de cuenta' })
  @MaxLength(50)
  tipoCuenta: string;

  @IsNotEmpty({ message: 'El número de cuenta bancaria es obligatorio' })
  @MaxLength(50)
  numeroCuentaBancaria: string;
}

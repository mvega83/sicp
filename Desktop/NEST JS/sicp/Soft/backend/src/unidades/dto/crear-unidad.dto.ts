import { IsNotEmpty, MaxLength } from 'class-validator';

export class CrearUnidadDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(250)
  nombre: string;
}

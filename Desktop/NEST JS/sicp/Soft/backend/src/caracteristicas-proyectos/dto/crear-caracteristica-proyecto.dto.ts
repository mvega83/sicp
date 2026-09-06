import { IsNotEmpty, MaxLength } from 'class-validator';

export class CrearCaracteristicaProyectoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;
}

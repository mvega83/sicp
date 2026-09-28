import { IsNotEmpty, MaxLength } from 'class-validator';

export class ActualizarEventoBitacoraDto {
  @IsNotEmpty({ message: 'La observación no puede estar vacía' })
  @MaxLength(1000, { message: 'La observación no puede superar los 1000 caracteres' })
  descripcion: string;
}

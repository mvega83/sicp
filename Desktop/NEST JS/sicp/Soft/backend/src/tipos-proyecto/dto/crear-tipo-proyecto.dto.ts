import { IsNotEmpty, MaxLength } from 'class-validator';

export class CrearTipoProyectoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  nombre: string;
}

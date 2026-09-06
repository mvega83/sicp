import { IsInt, IsNotEmpty, Max, MaxLength, Min } from 'class-validator';

export class CrearTipoUsuarioDto {
  @IsInt()
  @Min(0)
  @Max(99, { message: 'El código debe tener máximo 2 dígitos (0 a 99)' })
  codigo: number;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;
}

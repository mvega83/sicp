import { IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearLocalidadDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  nombre: string;

  // @IsIn ya rechaza undefined (no está en la lista permitida), pero se agrega
  // @IsNotEmpty para dar un mensaje explícito y consistente con el resto del proyecto
  // cuando el campo directamente no se envía.
  @IsNotEmpty({ message: 'La zona es obligatoria' })
  @IsIn([1, 2], { message: 'La zona debe ser 1 (Urbana) o 2 (Rural)' })
  zona: number;

  @IsNotEmpty({ message: 'El sector es obligatorio' })
  @IsIn([1, 2, 3, 4, 5, 6, 7, 8], {
    message:
      'El sector debe ser 1 (Céntrico), 2 (Parte alta), 3 (El Portal), 4 (Fray Jorge), ' +
      '5 (Puertas del Sol), 6 (Sector Limarí), 7 (Sector El Romeral) u 8 (Sector fuera de Ovalle)',
  })
  sector: number;
}

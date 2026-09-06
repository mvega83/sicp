import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CrearTipoFuenteFinanciamientoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  nombre: string;

  @IsNotEmpty({ message: 'La procedencia es obligatoria' })
  @MaxLength(150)
  procedencia: string;

  @IsOptional()
  @MaxLength(1000)
  observaciones?: string;
}

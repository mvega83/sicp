import {
  ArrayMaxSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CrearProyectoDto {
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  @MaxLength(200)
  nombre: string;

  // Sin fijar versión: no importa si el UUID del tipo de proyecto es v1 o v4, solo
  // que sea un UUID válido.
  @IsUUID('all', { message: 'Debes seleccionar un tipo de proyecto válido' })
  idTipoProyecto: string;

  @IsUUID('all', { message: 'Debes seleccionar una localidad válida' })
  idLocalidad: string;

  @IsNotEmpty({ message: 'La comuna es obligatoria' })
  @MaxLength(100)
  comuna: string;

  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(250)
  direccion: string;

  @IsLatitude({ message: 'La latitud no es válida' })
  latitud: number;

  @IsLongitude({ message: 'La longitud no es válida' })
  longitud: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  caracteristicas?: string[];
}

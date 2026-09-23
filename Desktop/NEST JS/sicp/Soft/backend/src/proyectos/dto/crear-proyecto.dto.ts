import {
  ArrayMaxSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
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

  // Se reciben ids del catálogo de características (no texto libre): el servicio se
  // encarga de resolverlos a entidades antes de guardar la relación.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsUUID('all', { each: true, message: 'Cada característica seleccionada debe ser válida' })
  idsCaracteristicas?: string[];
}

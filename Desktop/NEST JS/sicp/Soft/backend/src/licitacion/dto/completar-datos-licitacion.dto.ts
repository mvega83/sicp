import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

// Convierte el campo cuando viaja como string dentro de un multipart/form-data
// (el frontend hace JSON.stringify del arreglo antes de enviarlo), pero lo deja
// pasar tal cual si ya llega como arreglo (ej. en un request JSON normal).
const transformarArregloJson = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? JSON.parse(value) : value;

// Etapa 2 del flujo de licitación: los datos propios de la licitación, que se
// completan en un segundo guardado (después de haber creado la Resolución). El
// PDF de preguntas y respuestas viaja aparte en el mismo request multipart.
export class CompletarDatosLicitacionDto {
  @IsNotEmpty({ message: 'Debes indicar el id de la licitación (ej. de Mercado Público)' })
  @MaxLength(100)
  idLicitacionExterna: string;

  @IsNotEmpty({ message: 'Debes indicar quién es el/la funcionario(a) de compras' })
  @MaxLength(150)
  responsable: string;

  @IsDateString({}, { message: 'La fecha de licitación no es válida' })
  fechaLicitacion: string;

  @IsDateString({}, { message: 'La fecha de inicio de respuesta no es válida' })
  fechaRespuestaDesde: string;

  @IsDateString({}, { message: 'La fecha de término de respuesta no es válida' })
  fechaRespuestaHasta: string;

  @IsDateString({}, { message: 'La fecha de cierre no es válida' })
  fechaFinalizacion: string;

  @IsDateString({}, { message: 'La fecha de adjudicación no es válida' })
  fechaAdjudicacion: string;

  @Transform(transformarArregloJson)
  @IsArray()
  @ArrayMinSize(3, { message: 'La comisión de titulares debe tener exactamente 3 nombres' })
  @ArrayMaxSize(3, { message: 'La comisión de titulares debe tener exactamente 3 nombres' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  comisionTitulares: string[];

  @Transform(transformarArregloJson)
  @IsArray()
  @ArrayMinSize(3, { message: 'La comisión de suplentes debe tener exactamente 3 nombres' })
  @ArrayMaxSize(3, { message: 'La comisión de suplentes debe tener exactamente 3 nombres' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  comisionSuplentes: string[];
}

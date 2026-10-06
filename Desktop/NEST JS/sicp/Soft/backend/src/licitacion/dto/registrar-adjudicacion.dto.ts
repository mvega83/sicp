import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsNumber, IsPositive, MaxLength, ValidateIf } from 'class-validator';
import { ResultadoAdjudicacion } from '../entidades/licitacion.entity';

// Etapa 4 del flujo de licitación: Adjudicación. Es condicional según
// `resultado` — los campos del proveedor solo se validan si es "adjudicado", y
// `fechaDesierta` solo si es "desierta" (ver @ValidateIf). Los PDFs (acta de
// evaluación o acta de licitación desierta, según corresponda) viajan aparte en
// el mismo request multipart — ver @UploadedFiles en el controller.
export class RegistrarAdjudicacionDto {
  @IsIn(Object.values(ResultadoAdjudicacion), { message: 'El resultado debe ser "adjudicado" o "desierta"' })
  resultado: ResultadoAdjudicacion;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @IsNotEmpty({ message: 'Debes indicar el nombre del proveedor' })
  @MaxLength(250)
  nombreProveedor?: string;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @IsNotEmpty({ message: 'Debes indicar el RUT del proveedor' })
  @MaxLength(20)
  rutProveedor?: string;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @IsNotEmpty({ message: 'Debes indicar el teléfono del proveedor' })
  @MaxLength(30)
  telefonoProveedor?: string;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @IsEmail({}, { message: 'Debes ingresar un correo válido' })
  correoProveedor?: string;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @IsNotEmpty({ message: 'Debes indicar el nombre del encargado' })
  @MaxLength(150)
  nombreEncargadoProveedor?: string;

  // Viaja como string dentro del multipart/form-data; se transforma a number
  // antes de validar (mismo criterio que los arreglos JSON de la comisión
  // evaluadora en CompletarDatosLicitacionDto, pero acá solo hace falta castear
  // el tipo, no parsear JSON).
  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.ADJUDICADO)
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber({}, { message: 'El monto de adjudicación debe ser un número' })
  @IsPositive({ message: 'El monto de adjudicación debe ser mayor a 0' })
  montoAdjudicacion?: number;

  @ValidateIf((datos) => datos.resultado === ResultadoAdjudicacion.DESIERTA)
  @IsDateString({}, { message: 'La fecha no es válida' })
  fechaDesierta?: string;
}

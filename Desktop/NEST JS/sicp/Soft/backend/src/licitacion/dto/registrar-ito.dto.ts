import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

// Etapa 6 del flujo de licitación: ITO (Inspector Técnico de Obra). Sin
// archivo — solo la unidad (catálogo de Configuración) y el nombre. Es el
// último paso: al completarse, la licitación pasa al historial.
export class RegistrarItoDto {
  @IsUUID('all', { message: 'Debes seleccionar una unidad válida' })
  idUnidadIto: string;

  @IsNotEmpty({ message: 'Debes indicar el nombre del ITO' })
  @MaxLength(150)
  nombreIto: string;
}

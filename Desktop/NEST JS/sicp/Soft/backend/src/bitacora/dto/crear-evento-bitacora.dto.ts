import { IsEnum, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { EtapaProyecto } from '../entidades/bitacora.entity';

export class CrearEventoBitacoraDto {
  @IsUUID('all', { message: 'El id del proyecto no es válido' })
  idProyecto: string;

  @IsEnum(EtapaProyecto, { message: 'La etapa indicada no es válida' })
  etapa: EtapaProyecto;

  @IsNotEmpty({ message: 'La observación no puede estar vacía' })
  @MaxLength(1000, { message: 'La observación no puede superar los 1000 caracteres' })
  descripcion: string;
}

import { IsDateString, IsUUID } from 'class-validator';

// Etapa 1 del flujo de licitación: el Solicitante. El PDF de bases técnicas viaja
// aparte en el mismo request multipart (ver @UploadedFile en el controller), no en
// este DTO.
export class CrearLicitacionDto {
  @IsUUID('4', { message: 'idProyecto debe ser un id de proyecto válido' })
  idProyecto: string;

  @IsUUID('all', { message: 'Debes seleccionar una unidad solicitante válida' })
  idUnidad: string;

  @IsDateString({}, { message: 'La fecha de solicitud no es válida' })
  fechaSolicitud: string;
}

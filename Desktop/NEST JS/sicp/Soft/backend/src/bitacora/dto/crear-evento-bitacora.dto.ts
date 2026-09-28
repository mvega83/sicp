import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

// No incluye "etapa": el comentario siempre queda etiquetado con la etapa actual
// del proyecto, decidida por el backend (ver BitacoraService.agregarComentario),
// para que el cliente no pueda falsificar en qué etapa se escribió.
export class CrearEventoBitacoraDto {
  @IsUUID('all', { message: 'El id del proyecto no es válido' })
  idProyecto: string;

  @IsNotEmpty({ message: 'La observación no puede estar vacía' })
  @MaxLength(1000, { message: 'La observación no puede superar los 1000 caracteres' })
  descripcion: string;
}

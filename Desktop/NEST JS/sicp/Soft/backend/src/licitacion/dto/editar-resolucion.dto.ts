import { IsDateString, IsNotEmpty, MaxLength } from 'class-validator';

// Etapa 2 del flujo de licitación: la Resolución — se usa tanto para
// completarla la primera vez (después del Solicitante) como para editarla
// después. El PDF viaja aparte en el mismo request multipart y es opcional acá
// (a diferencia de CrearLicitacionDto): el controller/service exige uno solo
// si todavía no había ninguno guardado — ver licitacionService.editarResolucion.
export class EditarResolucionDto {
  @IsNotEmpty({ message: 'Debes indicar el número de resolución' })
  @MaxLength(100)
  numeroResolucion: string;

  @IsDateString({}, { message: 'La fecha de resolución no es válida' })
  fechaResolucion: string;
}

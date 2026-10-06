import { IsDateString, IsNotEmpty, MaxLength } from 'class-validator';

// Etapa 5 del flujo de licitación: REX de adjudicación. El PDF viaja aparte en
// el mismo request multipart (ver @UploadedFile en el controller). Aplica igual
// para ambos resultados de la etapa 4 (adjudicado o desierta).
export class RegistrarRexAdjudicacionDto {
  @IsNotEmpty({ message: 'Debes indicar el número de la REX' })
  @MaxLength(100)
  numeroRexAdjudicacion: string;

  @IsDateString({}, { message: 'La fecha de la REX no es válida' })
  fechaRexAdjudicacion: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CrearProyectoDto } from './crear-proyecto.dto';

// Igual que CrearProyectoDto, pero con todos los campos opcionales: para actualizar
// un proyecto no hace falta reenviar todos sus datos, solo lo que cambia.
export class ActualizarProyectoDto extends PartialType(CrearProyectoDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CrearUsuarioDto } from './crear-usuario.dto';

// Todos los campos son opcionales al editar (ej. cambiar solo el teléfono, sin tocar
// la contraseña). Si "contrasena" viene presente, el service la vuelve a hashear; si
// no viene, se deja la contraseña actual intacta.
export class ActualizarUsuarioDto extends PartialType(CrearUsuarioDto) {
  // No va en CrearUsuarioDto porque todo usuario nuevo nace activo (estado = 1 por
  // defecto en la entidad) — este campo solo tiene sentido al editar, para dar de
  // baja o reactivar a alguien.
  @IsOptional()
  @IsIn([1, -1], { message: 'El estado debe ser 1 (activo) o -1 (de baja)' })
  estado?: number;
}

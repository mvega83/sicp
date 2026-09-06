import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EsRunValido } from '../../comun/validadores/run.validador';

// Datos para crear un usuario "local" desde Administración > Usuarios (con correo y
// contraseña propios, sin depender de una cuenta de Google/Microsoft).
export class CrearUsuarioDto {
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(100)
  nombres: string;

  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(100)
  apellidos: string;

  @IsEmail({}, { message: 'Debes ingresar un correo válido' })
  correo: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @EsRunValido()
  run: string;

  // Sin fijar versión: no importa si el UUID del tipo_usuario es v1 o v4, solo que
  // sea un UUID válido.
  @IsUUID('all', { message: 'Debes seleccionar un tipo de usuario válido' })
  idTipoUsuario: string;

  @IsUUID('all', { message: 'Debes seleccionar una unidad válida' })
  idUnidad: string;

  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}

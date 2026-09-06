import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

// Datos que pide el login de desarrollo: sin contraseña, a propósito, porque solo
// sirve para probar el sistema mientras no haya credenciales reales de Google/Microsoft.
export class IniciarSesionDevDto {
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(120)
  nombres: string;

  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(120)
  apellidos: string;

  @IsEmail({}, { message: 'Debes ingresar un correo válido' })
  correo: string;
}

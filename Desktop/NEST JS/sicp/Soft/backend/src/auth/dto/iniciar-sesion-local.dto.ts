import { IsEmail, IsNotEmpty } from 'class-validator';

// Datos que pide el login con correo y contraseña (usuarios creados desde
// Administración > Usuarios, ver src/usuarios/).
export class IniciarSesionLocalDto {
  @IsEmail({}, { message: 'Debes ingresar un correo válido' })
  correo: string;

  @IsNotEmpty({ message: 'Debes ingresar tu contraseña' })
  contrasena: string;
}

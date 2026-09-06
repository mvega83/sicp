import { Usuario } from '../../auth/entidades/usuario.entity';

/**
 * El campo contrasenaHash nunca debe salir del backend en una respuesta HTTP, ni
 * siquiera hasheado — no hay ninguna razón para que el frontend lo reciba. Se usa en
 * cada lugar donde se devuelve un Usuario completo (login local, CRUD de Administración).
 */
export function omitirContrasena(usuario: Usuario): Omit<Usuario, 'contrasenaHash'> {
  const { contrasenaHash, ...resto } = usuario;
  return resto;
}

import clienteHttp from './clienteHttp';

// Le pregunta al backend qué formas de login están disponibles ahora mismo (login
// de desarrollo siempre en desarrollo, Google/Microsoft solo si el backend tiene
// las credenciales configuradas). Así el botón de Google no aparece si en realidad
// todavía no va a funcionar.
export async function obtenerProveedoresDisponibles() {
  const respuesta = await clienteHttp.get('/auth/proveedores-disponibles');
  return respuesta.data;
}

export async function iniciarSesionDev(nombres, apellidos, correo) {
  const respuesta = await clienteHttp.post('/auth/login-dev', { nombres, apellidos, correo });
  return respuesta.data; // { token, usuario }
}

export async function iniciarSesionLocal(correo, contrasena) {
  const respuesta = await clienteHttp.post('/auth/login-local', { correo, contrasena });
  return respuesta.data; // { token, usuario }
}

// Se usa al cargar la app para confirmar que el token guardado en localStorage
// sigue siendo válido (por si venció, o si el backend se reinició con otra clave).
export async function obtenerPerfil() {
  const respuesta = await clienteHttp.get('/auth/perfil');
  return respuesta.data;
}

export function urlLoginGoogle() {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
}

export function urlLoginMicrosoft() {
  return `${import.meta.env.VITE_API_URL}/auth/microsoft`;
}

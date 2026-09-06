import clienteHttp from './clienteHttp';

export async function listarUsuarios() {
  const respuesta = await clienteHttp.get('/usuarios');
  return respuesta.data;
}

export async function crearUsuario(datos) {
  const respuesta = await clienteHttp.post('/usuarios', datos);
  return respuesta.data;
}

export async function actualizarUsuario(id, datos) {
  const respuesta = await clienteHttp.patch(`/usuarios/${id}`, datos);
  return respuesta.data;
}

export async function eliminarUsuario(id) {
  await clienteHttp.delete(`/usuarios/${id}`);
}

import clienteHttp from './clienteHttp';

export async function listarTiposUsuario() {
  const respuesta = await clienteHttp.get('/tipos-usuario');
  return respuesta.data;
}

export async function crearTipoUsuario(datos) {
  const respuesta = await clienteHttp.post('/tipos-usuario', datos);
  return respuesta.data;
}

export async function actualizarTipoUsuario(id, datos) {
  const respuesta = await clienteHttp.patch(`/tipos-usuario/${id}`, datos);
  return respuesta.data;
}

export async function eliminarTipoUsuario(id) {
  await clienteHttp.delete(`/tipos-usuario/${id}`);
}

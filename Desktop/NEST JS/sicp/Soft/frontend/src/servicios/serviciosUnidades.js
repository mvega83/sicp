import clienteHttp from './clienteHttp';

export async function listarUnidades() {
  const respuesta = await clienteHttp.get('/unidades');
  return respuesta.data;
}

export async function crearUnidad(datos) {
  const respuesta = await clienteHttp.post('/unidades', datos);
  return respuesta.data;
}

export async function actualizarUnidad(id, datos) {
  const respuesta = await clienteHttp.patch(`/unidades/${id}`, datos);
  return respuesta.data;
}

export async function eliminarUnidad(id) {
  await clienteHttp.delete(`/unidades/${id}`);
}

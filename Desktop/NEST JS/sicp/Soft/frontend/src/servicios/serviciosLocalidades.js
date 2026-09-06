import clienteHttp from './clienteHttp';

export async function listarLocalidades() {
  const respuesta = await clienteHttp.get('/localidades');
  return respuesta.data;
}

export async function crearLocalidad(datos) {
  const respuesta = await clienteHttp.post('/localidades', datos);
  return respuesta.data;
}

export async function actualizarLocalidad(id, datos) {
  const respuesta = await clienteHttp.patch(`/localidades/${id}`, datos);
  return respuesta.data;
}

export async function eliminarLocalidad(id) {
  await clienteHttp.delete(`/localidades/${id}`);
}

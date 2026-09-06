import clienteHttp from './clienteHttp';

export async function listarTiposProyecto() {
  const respuesta = await clienteHttp.get('/tipos-proyecto');
  return respuesta.data;
}

export async function crearTipoProyecto(datos) {
  const respuesta = await clienteHttp.post('/tipos-proyecto', datos);
  return respuesta.data;
}

export async function actualizarTipoProyecto(id, datos) {
  const respuesta = await clienteHttp.patch(`/tipos-proyecto/${id}`, datos);
  return respuesta.data;
}

export async function eliminarTipoProyecto(id) {
  await clienteHttp.delete(`/tipos-proyecto/${id}`);
}

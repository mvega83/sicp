import clienteHttp from './clienteHttp';

export async function listarTiposFuenteFinanciamiento() {
  const respuesta = await clienteHttp.get('/tipos-fuente-financiamiento');
  return respuesta.data;
}

export async function crearTipoFuenteFinanciamiento(datos) {
  const respuesta = await clienteHttp.post('/tipos-fuente-financiamiento', datos);
  return respuesta.data;
}

export async function actualizarTipoFuenteFinanciamiento(id, datos) {
  const respuesta = await clienteHttp.patch(`/tipos-fuente-financiamiento/${id}`, datos);
  return respuesta.data;
}

export async function eliminarTipoFuenteFinanciamiento(id) {
  await clienteHttp.delete(`/tipos-fuente-financiamiento/${id}`);
}

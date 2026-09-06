import clienteHttp from './clienteHttp';

export async function listarFinanciamiento(idProyecto) {
  const respuesta = await clienteHttp.get('/financiamiento', { params: { idProyecto } });
  return respuesta.data;
}

export async function crearFinanciamiento(datos) {
  const respuesta = await clienteHttp.post('/financiamiento', datos);
  return respuesta.data;
}

export async function eliminarFinanciamiento(id) {
  await clienteHttp.delete(`/financiamiento/${id}`);
}

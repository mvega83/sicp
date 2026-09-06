import clienteHttp from './clienteHttp';

export async function obtenerFinalizacion(idProyecto) {
  const respuesta = await clienteHttp.get('/finalizacion', { params: { idProyecto } });
  return respuesta.data;
}

export async function crearFinalizacion(datos) {
  const respuesta = await clienteHttp.post('/finalizacion', datos);
  return respuesta.data;
}

export async function adjuntarDocumentoCierre(id, archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post(`/finalizacion/${id}/documento-cierre`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

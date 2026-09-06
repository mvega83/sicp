import clienteHttp from './clienteHttp';

export async function listarLicitaciones(idProyecto) {
  const respuesta = await clienteHttp.get('/licitacion', { params: { idProyecto } });
  return respuesta.data;
}

export async function crearLicitacion(datos) {
  const respuesta = await clienteHttp.post('/licitacion', datos);
  return respuesta.data;
}

export async function actualizarLicitacion(id, datos) {
  const respuesta = await clienteHttp.patch(`/licitacion/${id}`, datos);
  return respuesta.data;
}

export async function adjuntarRex(id, archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post(`/licitacion/${id}/archivo-rex`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

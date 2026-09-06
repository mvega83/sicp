import clienteHttp from './clienteHttp';

export async function listarEstadosPago(idProyecto) {
  const respuesta = await clienteHttp.get('/obra/estados-pago', { params: { idProyecto } });
  return respuesta.data;
}

export async function crearEstadoPago(datos) {
  const respuesta = await clienteHttp.post('/obra/estados-pago', datos);
  return respuesta.data;
}

export async function adjuntarDocumentoEstadoPago(id, archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post(`/obra/estados-pago/${id}/documento`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

import clienteHttp from './clienteHttp';

export async function listarBitacora(idProyecto, etapa) {
  const respuesta = await clienteHttp.get('/bitacora', {
    params: etapa ? { idProyecto, etapa } : { idProyecto },
  });
  return respuesta.data;
}

export async function agregarEventoBitacora(datos) {
  const respuesta = await clienteHttp.post('/bitacora', datos);
  return respuesta.data;
}

export async function actualizarEventoBitacora(id, descripcion) {
  const respuesta = await clienteHttp.patch(`/bitacora/${id}`, { descripcion });
  return respuesta.data;
}

import clienteHttp from './clienteHttp';

export async function listarBitacora(idProyecto, etapa) {
  const respuesta = await clienteHttp.get('/bitacora', {
    params: etapa ? { idProyecto, etapa } : { idProyecto },
  });
  return respuesta.data;
}

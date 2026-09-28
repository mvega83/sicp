import clienteHttp from './clienteHttp';

export async function listarDocumentosAprobacion(idProyecto) {
  const respuesta = await clienteHttp.get('/aprobacion/documentos', { params: { idProyecto } });
  return respuesta.data;
}

export async function subirDocumentoAprobacion(idProyecto, archivo) {
  const formulario = new FormData();
  formulario.append('idProyecto', idProyecto);
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post('/aprobacion/documentos', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

export async function eliminarDocumentoAprobacion(id) {
  await clienteHttp.delete(`/aprobacion/documentos/${id}`);
}

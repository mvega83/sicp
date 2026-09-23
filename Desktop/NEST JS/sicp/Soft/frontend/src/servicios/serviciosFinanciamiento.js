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

export async function listarDocumentosFinanciamiento(idProyecto) {
  const respuesta = await clienteHttp.get('/financiamiento/documentos', { params: { idProyecto } });
  return respuesta.data;
}

export async function subirDocumentoFinanciamiento(idProyecto, archivo) {
  const formulario = new FormData();
  formulario.append('idProyecto', idProyecto);
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post('/financiamiento/documentos', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

export async function eliminarDocumentoFinanciamiento(id) {
  await clienteHttp.delete(`/financiamiento/documentos/${id}`);
}

export async function listarDecretosFinanciamiento(idFuenteFinanciamiento) {
  const respuesta = await clienteHttp.get('/financiamiento/decretos', {
    params: { idFuenteFinanciamiento },
  });
  return respuesta.data;
}

export async function subirDecretoFinanciamiento(idFuenteFinanciamiento, fechaDecreto, archivo) {
  const formulario = new FormData();
  formulario.append('idFuenteFinanciamiento', idFuenteFinanciamiento);
  formulario.append('fechaDecreto', fechaDecreto);
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post('/financiamiento/decretos', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

export async function eliminarDecretoFinanciamiento(id) {
  await clienteHttp.delete(`/financiamiento/decretos/${id}`);
}

import clienteHttp from './clienteHttp';

export async function listarProyectos() {
  const respuesta = await clienteHttp.get('/proyectos');
  return respuesta.data;
}

export async function obtenerProyecto(id) {
  const respuesta = await clienteHttp.get(`/proyectos/${id}`);
  return respuesta.data;
}

export async function crearProyecto(datos) {
  const respuesta = await clienteHttp.post('/proyectos', datos);
  return respuesta.data;
}

export async function actualizarProyecto(id, datos) {
  const respuesta = await clienteHttp.patch(`/proyectos/${id}`, datos);
  return respuesta.data;
}

export async function eliminarProyecto(id) {
  await clienteHttp.delete(`/proyectos/${id}`);
}

export async function subirImagenProyecto(id, archivo) {
  const formulario = new FormData();
  formulario.append('imagen', archivo);
  const respuesta = await clienteHttp.post(`/proyectos/${id}/imagenes`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// "url" es la URL guardada tal cual (ej. "/visor/abc123.pdf"); el backend solo
// necesita el nombre del archivo, así que se toma el último segmento acá — mismo
// criterio que construirUrlArchivo (utilidades/archivos.js).
export async function eliminarImagenProyecto(id, url) {
  const nombreArchivo = url.split('/').filter(Boolean).pop();
  const respuesta = await clienteHttp.delete(`/proyectos/${id}/imagenes/${nombreArchivo}`);
  return respuesta.data;
}

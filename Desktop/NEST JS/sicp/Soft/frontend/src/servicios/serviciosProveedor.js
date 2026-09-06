import clienteHttp from './clienteHttp';

export async function listarProveedores(idProyecto) {
  const respuesta = await clienteHttp.get('/proveedor', { params: { idProyecto } });
  return respuesta.data;
}

export async function crearProveedor(datos) {
  const respuesta = await clienteHttp.post('/proveedor', datos);
  return respuesta.data;
}

export async function adjuntarBoletaGarantia(id, archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post(`/proveedor/${id}/boleta-garantia`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

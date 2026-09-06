import clienteHttp from './clienteHttp';

export async function listarCaracteristicasProyectos() {
  const respuesta = await clienteHttp.get('/caracteristicas-proyectos');
  return respuesta.data;
}

export async function crearCaracteristicaProyecto(datos) {
  const respuesta = await clienteHttp.post('/caracteristicas-proyectos', datos);
  return respuesta.data;
}

export async function actualizarCaracteristicaProyecto(id, datos) {
  const respuesta = await clienteHttp.patch(`/caracteristicas-proyectos/${id}`, datos);
  return respuesta.data;
}

export async function eliminarCaracteristicaProyecto(id) {
  await clienteHttp.delete(`/caracteristicas-proyectos/${id}`);
}

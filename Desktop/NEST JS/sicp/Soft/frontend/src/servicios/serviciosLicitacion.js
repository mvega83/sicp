import clienteHttp from './clienteHttp';

export async function listarLicitaciones(idProyecto) {
  const respuesta = await clienteHttp.get('/licitacion', { params: { idProyecto } });
  return respuesta.data;
}

// Etapa 1 del flujo de licitación: crea el registro con el Solicitante (unidad,
// fecha y PDF de bases técnicas). Es multipart porque el archivo va en el mismo
// request.
export async function crearSolicitanteLicitacion({ idProyecto, idUnidad, fechaSolicitud, archivo }) {
  const formulario = new FormData();
  formulario.append('idProyecto', idProyecto);
  formulario.append('idUnidad', idUnidad);
  formulario.append('fechaSolicitud', fechaSolicitud);
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.post('/licitacion', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// Etapa 2 del flujo de licitación: completa la Resolución la primera vez (el
// archivo es obligatorio ahí) y también sirve para editarla después, mientras
// la licitación siga "en progreso" (no se puede una vez completados los Datos
// de la licitación). En la edición el archivo es opcional: si no se pasa, el
// backend mantiene el PDF ya guardado.
export async function editarResolucionLicitacion(id, { numeroResolucion, fechaResolucion, archivo }) {
  const formulario = new FormData();
  formulario.append('numeroResolucion', numeroResolucion);
  formulario.append('fechaResolucion', fechaResolucion);
  if (archivo) {
    formulario.append('archivo', archivo);
  }
  const respuesta = await clienteHttp.patch(`/licitacion/${id}/resolucion`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// Etapa 3 del flujo de licitación: completa los datos propios de la licitación
// (fechas, comisión evaluadora, etc.) sobre una licitación cuya Resolución ya
// está completa. Las comisiones viajan como string JSON (no como campos
// repetidos) porque así las espera el DTO del backend al venir dentro de un multipart.
export async function completarDatosLicitacion(id, datos) {
  const formulario = new FormData();
  formulario.append('idLicitacionExterna', datos.idLicitacionExterna);
  formulario.append('responsable', datos.responsable);
  formulario.append('fechaLicitacion', datos.fechaLicitacion);
  formulario.append('fechaRespuestaDesde', datos.fechaRespuestaDesde);
  formulario.append('fechaRespuestaHasta', datos.fechaRespuestaHasta);
  formulario.append('fechaFinalizacion', datos.fechaFinalizacion);
  formulario.append('fechaAdjudicacion', datos.fechaAdjudicacion);
  formulario.append('comisionTitulares', JSON.stringify(datos.comisionTitulares));
  formulario.append('comisionSuplentes', JSON.stringify(datos.comisionSuplentes));
  formulario.append('archivo', datos.archivo);
  // REX con respuestas: opcional, a diferencia del documento de preguntas y
  // respuestas de arriba — solo se manda si se seleccionó un archivo.
  if (datos.archivoRex) {
    formulario.append('archivoRex', datos.archivoRex);
  }
  const respuesta = await clienteHttp.patch(`/licitacion/${id}/datos-licitacion`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// Etapa 4 del flujo de licitación: Adjudicación. Condicional según
// `resultado` ("adjudicado" o "desierta") — solo se adjunta el archivo que
// corresponde (acta de evaluación o acta de licitación desierta).
export async function registrarAdjudicacion(id, datos) {
  const formulario = new FormData();
  formulario.append('resultado', datos.resultado);
  if (datos.resultado === 'adjudicado') {
    formulario.append('nombreProveedor', datos.nombreProveedor);
    formulario.append('rutProveedor', datos.rutProveedor);
    formulario.append('telefonoProveedor', datos.telefonoProveedor);
    formulario.append('correoProveedor', datos.correoProveedor);
    formulario.append('nombreEncargadoProveedor', datos.nombreEncargadoProveedor);
    formulario.append('montoAdjudicacion', datos.montoAdjudicacion);
    formulario.append('archivoActaEvaluacion', datos.archivoActaEvaluacion);
  } else {
    formulario.append('fechaDesierta', datos.fechaDesierta);
    formulario.append('archivoActaDesierta', datos.archivoActaDesierta);
  }
  const respuesta = await clienteHttp.patch(`/licitacion/${id}/adjudicacion`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// Etapa 5 del flujo de licitación: REX de adjudicación.
export async function registrarRexAdjudicacion(id, { numeroRexAdjudicacion, fechaRexAdjudicacion, archivo }) {
  const formulario = new FormData();
  formulario.append('numeroRexAdjudicacion', numeroRexAdjudicacion);
  formulario.append('fechaRexAdjudicacion', fechaRexAdjudicacion);
  formulario.append('archivo', archivo);
  const respuesta = await clienteHttp.patch(`/licitacion/${id}/rex-adjudicacion`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return respuesta.data;
}

// Etapa 6 del flujo de licitación: ITO. Sin archivo, así que va como JSON
// normal (no multipart) — último paso, al completarse la licitación pasa al
// historial.
export async function registrarIto(id, { idUnidadIto, nombreIto }) {
  const respuesta = await clienteHttp.patch(`/licitacion/${id}/ito`, { idUnidadIto, nombreIto });
  return respuesta.data;
}

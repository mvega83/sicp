import { Fragment, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import BitacoraFlotante from '../Bitacora/BitacoraFlotante';
import {
  completarDatosLicitacion,
  crearSolicitanteLicitacion,
  editarResolucionLicitacion,
  listarLicitaciones,
  registrarAdjudicacion,
  registrarIto,
  registrarRexAdjudicacion,
} from '../../servicios/serviciosLicitacion';
import { listarProyectos } from '../../servicios/serviciosProyectos';
import { listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { listarUnidades } from '../../servicios/serviciosUnidades';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import EtiquetasProyecto from '../comunes/EtiquetasProyecto';
import Icono from '../comunes/Icono';
import TituloTarjeta from '../comunes/TituloTarjeta';
import { construirUrlArchivo } from '../../utilidades/archivos';
import { CaracteristicasProyecto, DatosGeneralesProyecto, ImagenesProyecto } from '../comunes/DetalleProyecto';
import ResumenFinanciamiento from '../comunes/ResumenFinanciamiento';
import ResumenAprobacion from '../comunes/ResumenAprobacion';
import TablaFuentesFinanciamiento from '../comunes/TablaFuentesFinanciamiento';

// Valores iniciales del formulario del Paso 1 (Solicitante). El archivo PDF se
// guarda aparte (en su propio useState) porque un <input type="file"> no se
// puede controlar con "value" como el resto de los campos de texto.
const VALORES_INICIALES_SOLICITANTE = {
  idUnidad: '',
  fechaSolicitud: '',
};

// Valores iniciales del formulario del Paso 2 (Resolución). Se reutiliza tanto
// para completarla la primera vez como para editarla después.
const VALORES_INICIALES_RESOLUCION = {
  numeroResolucion: '',
  fechaResolucion: '',
};

// Valores iniciales del formulario del Paso 3 (Datos de la licitación). Las
// comisiones evaluadoras son siempre 3 nombres (titulares y suplentes), así
// que se guardan como arreglos de 3 posiciones en vez de 6 campos sueltos.
const VALORES_INICIALES_DATOS_LICITACION = {
  idLicitacionExterna: '',
  responsable: '',
  fechaLicitacion: '',
  fechaRespuestaDesde: '',
  fechaRespuestaHasta: '',
  fechaFinalizacion: '',
  fechaAdjudicacion: '',
  titulares: ['', '', ''],
  suplentes: ['', '', ''],
};

// Valores iniciales del formulario del Paso 4 (Adjudicación). "resultado" es
// '' hasta que se elige una opción — recién ahí se muestran los campos que
// correspondan (proveedor, o fecha de licitación desierta).
const VALORES_INICIALES_ADJUDICACION = {
  resultado: '',
  nombreProveedor: '',
  rutProveedor: '',
  telefonoProveedor: '',
  correoProveedor: '',
  nombreEncargadoProveedor: '',
  montoAdjudicacion: '',
  fechaDesierta: '',
};

// Valores iniciales del formulario del Paso 5 (REX de adjudicación).
const VALORES_INICIALES_REX_ADJUDICACION = {
  numeroRexAdjudicacion: '',
  fechaRexAdjudicacion: '',
};

// Valores iniciales del formulario del Paso 6 (ITO).
const VALORES_INICIALES_ITO = {
  idUnidadIto: '',
  nombreIto: '',
};

// Convierte una fecha "YYYY-MM-DD" a formato chileno para mostrarla de solo
// lectura; si no hay fecha, muestra un guion. Se fuerza la hora a medianoche
// local (en vez de dejar que Date la interprete como UTC) para que no se corra
// un día hacia atrás en zonas horarias detrás de UTC — mismo ajuste que ya usan
// TablaFuentesFinanciamiento.jsx y PaginaFinanciamiento.jsx con fechaDecreto.
function formatearFecha(fecha) {
  return fecha ? new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CL') : '—';
}

function formatearMonto(monto) {
  return monto !== null && monto !== undefined ? `$${Number(monto).toLocaleString('es-CL')}` : '—';
}

export default function PaginaLicitacion() {
  // null = todavía no se eligió con qué proyecto trabajar; ahí se muestra el
  // listado de proyectos en esta etapa en vez del formulario (mismo patrón que
  // PaginaFinanciamiento.jsx).
  const [idProyecto, setIdProyecto] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [montosPorProyecto, setMontosPorProyecto] = useState({});
  const [licitaciones, setLicitaciones] = useState([]);
  // Catálogo de unidades (Configuración), para los <select> de "Unidad
  // solicitante" (Paso 1) y "Unidad del ITO" (Paso 6).
  const [unidades, setUnidades] = useState([]);

  // Estado del Paso 1 (Solicitante).
  const [datosSolicitante, setDatosSolicitante] = useState(VALORES_INICIALES_SOLICITANTE);
  const [archivoSolicitante, setArchivoSolicitante] = useState(null);
  const [enviandoSolicitante, setEnviandoSolicitante] = useState(false);

  // Estado del Paso 2 (Resolución). Se reutiliza tanto para completarla la
  // primera vez (cuando todavía no existe) como para editarla después —
  // `editandoResolucion` solo distingue la UI (mostrar "Cancelar" o no) cuando
  // ya estaba completa y el usuario decide modificarla.
  const [datosResolucion, setDatosResolucion] = useState(VALORES_INICIALES_RESOLUCION);
  const [archivoResolucion, setArchivoResolucion] = useState(null);
  const [enviandoResolucion, setEnviandoResolucion] = useState(false);
  const [editandoResolucion, setEditandoResolucion] = useState(false);

  // Estado del Paso 3 (Datos de la licitación).
  const [datosLicitacion, setDatosLicitacion] = useState(VALORES_INICIALES_DATOS_LICITACION);
  const [archivoPreguntas, setArchivoPreguntas] = useState(null);
  // REX con respuestas: a diferencia del documento de preguntas y respuestas,
  // este archivo es opcional.
  const [archivoRexRespuestas, setArchivoRexRespuestas] = useState(null);
  const [enviandoDatosLicitacion, setEnviandoDatosLicitacion] = useState(false);

  // Estado del Paso 4 (Adjudicación).
  const [datosAdjudicacion, setDatosAdjudicacion] = useState(VALORES_INICIALES_ADJUDICACION);
  const [archivoActaEvaluacion, setArchivoActaEvaluacion] = useState(null);
  const [archivoActaDesierta, setArchivoActaDesierta] = useState(null);
  const [enviandoAdjudicacion, setEnviandoAdjudicacion] = useState(false);

  // Estado del Paso 5 (REX de adjudicación).
  const [datosRex, setDatosRex] = useState(VALORES_INICIALES_REX_ADJUDICACION);
  const [archivoRexAdjudicacion, setArchivoRexAdjudicacion] = useState(null);
  const [enviandoRex, setEnviandoRex] = useState(false);

  // Estado del Paso 6 (ITO) — último paso: al guardarse, la licitación pasa al
  // historial.
  const [datosIto, setDatosIto] = useState(VALORES_INICIALES_ITO);
  const [enviandoIto, setEnviandoIto] = useState(false);

  // Qué paso de la línea de tiempo se está mostrando (1 a 6) — los "botones"
  // numerados funcionan como un menú/pestañas: se puede volver a un paso
  // anterior ya completo para revisarlo, pero los pasos siguientes siguen
  // bloqueados hasta completar el anterior.
  const [pasoSeleccionado, setPasoSeleccionado] = useState(1);

  // Una vez que el ITO cierra una licitación, el proceso del proyecto queda
  // "terminado" — no se vuelve a mostrar el formulario de Solicitante solo. La
  // única excepción es si la última licitación quedó "desierta": ahí se ofrece
  // un botón explícito para iniciar un nuevo ciclo, en vez de reabrirlo solo.
  // Este estado controla si ese nuevo ciclo ya se "destrabó" con el botón.
  const [iniciandoNuevoCiclo, setIniciandoNuevoCiclo] = useState(false);

  // Modales de solo lectura con los archivos de las etapas anteriores (1 =
  // Banco de Ideas, 2 = Financiamiento, 3 = Aprobación), mismo patrón que
  // PaginaFinanciamiento.jsx y PaginaAprobacion.jsx.
  const [mostrarArchivosEtapa1, setMostrarArchivosEtapa1] = useState(false);
  const [mostrarArchivosEtapa2, setMostrarArchivosEtapa2] = useState(false);
  const [mostrarArchivosEtapa3, setMostrarArchivosEtapa3] = useState(false);

  useEffect(() => {
    cargarProyectos();
    listarUnidades().then(setUnidades);
  }, []);

  useEffect(() => {
    if (idProyecto) cargarLicitaciones();
    else setLicitaciones([]);
    // Al cambiar de proyecto se limpian los formularios de los 6 pasos, para no
    // dejar datos de un proyecto anterior a medio llenar en las cajas de texto.
    setDatosSolicitante(VALORES_INICIALES_SOLICITANTE);
    setArchivoSolicitante(null);
    setDatosResolucion(VALORES_INICIALES_RESOLUCION);
    setArchivoResolucion(null);
    setEditandoResolucion(false);
    setDatosLicitacion(VALORES_INICIALES_DATOS_LICITACION);
    setArchivoPreguntas(null);
    setArchivoRexRespuestas(null);
    setDatosAdjudicacion(VALORES_INICIALES_ADJUDICACION);
    setArchivoActaEvaluacion(null);
    setArchivoActaDesierta(null);
    setDatosRex(VALORES_INICIALES_REX_ADJUDICACION);
    setArchivoRexAdjudicacion(null);
    setDatosIto(VALORES_INICIALES_ITO);
    setPasoSeleccionado(1);
    setIniciandoNuevoCiclo(false);
  }, [idProyecto]);

  function cargarProyectos() {
    setCargandoProyectos(true);
    listarProyectos('licitacion')
      .then(async (lista) => {
        setProyectos(lista);
        // El monto de cada proyecto (suma de sus fuentes de financiamiento) no
        // viene en el listado de /proyectos, así que se busca aparte por
        // proyecto — igual que "Valor del proyecto" en DetalleProyecto.jsx.
        const montos = await Promise.all(
          lista.map((proyecto) =>
            listarFinanciamiento(proyecto.id).then((fuentes) => [
              proyecto.id,
              fuentes.reduce((suma, fuente) => suma + Number(fuente.monto), 0),
            ]),
          ),
        );
        setMontosPorProyecto(Object.fromEntries(montos));
      })
      .finally(() => setCargandoProyectos(false));
  }

  function cargarLicitaciones() {
    listarLicitaciones(idProyecto).then(setLicitaciones);
  }

  // El backend permite, a lo sumo, una licitación "en progreso" por proyecto
  // (aquella sin idUnidadIto todavía, es decir que le falta alguno de los 6
  // pasos). El resto, ya completas, son el historial de solo lectura.
  const licitacionEnProgreso = licitaciones.find((licitacion) => !licitacion.idUnidadIto);
  const historial = licitaciones.filter((licitacion) => licitacion.idUnidadIto);
  // `licitaciones` viene ordenado por fecha de creación descendente (ver
  // licitacionService.listarPorProyecto), así que historial[0] es la última
  // licitación que se cerró — la que decide si el proyecto ya quedó resuelto
  // (adjudicado: no se vuelve a abrir un ciclo solo) o si quedó desierta (ahí
  // se ofrece el botón para reiniciar).
  const ultimaCompletada = historial[0] ?? null;
  const tieneResolucion = Boolean(licitacionEnProgreso?.numeroResolucion);
  const tieneDatosLicitacion = Boolean(licitacionEnProgreso?.idLicitacionExterna);
  const tieneAdjudicacion = Boolean(licitacionEnProgreso?.resultadoAdjudicacion);
  const tieneRex = Boolean(licitacionEnProgreso?.numeroRexAdjudicacion);

  // Definición de los 6 "botones" de la línea de tiempo — se arma como datos en
  // vez de repetir el JSX 6 veces. `completado` colorea el círculo y pone el
  // check; `habilitado` controla si se puede hacer clic (los pasos bloqueados
  // muestran candado visual vía la clase "bloqueado").
  const pasosLicitacion = [
    { numero: 1, etiqueta: 'Solicitante', completado: Boolean(licitacionEnProgreso), habilitado: true },
    { numero: 2, etiqueta: 'Resolución', completado: tieneResolucion, habilitado: Boolean(licitacionEnProgreso) },
    { numero: 3, etiqueta: 'Datos de la licitación', completado: tieneDatosLicitacion, habilitado: tieneResolucion },
    { numero: 4, etiqueta: 'Adjudicación', completado: tieneAdjudicacion, habilitado: tieneDatosLicitacion },
    { numero: 5, etiqueta: 'REX de adjudicación', completado: tieneRex, habilitado: tieneAdjudicacion },
    { numero: 6, etiqueta: 'ITO', completado: false, habilitado: tieneRex },
  ];

  // Cada vez que cambia el estado de la licitación en progreso (se completó
  // algún paso, o se completó el ITO y pasó al historial), el menú salta
  // automáticamente al paso que corresponde — sin impedir que el usuario, ya
  // parado ahí, vuelva a un paso anterior para revisarlo.
  useEffect(() => {
    if (!licitacionEnProgreso) setPasoSeleccionado(1);
    else if (!tieneResolucion) setPasoSeleccionado(2);
    else if (!tieneDatosLicitacion) setPasoSeleccionado(3);
    else if (!tieneAdjudicacion) setPasoSeleccionado(4);
    else if (!tieneRex) setPasoSeleccionado(5);
    else setPasoSeleccionado(6);
    setEditandoResolucion(false);
    setArchivoResolucion(null);
    setIniciandoNuevoCiclo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licitacionEnProgreso?.id, tieneResolucion, tieneDatosLicitacion, tieneAdjudicacion, tieneRex]);

  async function manejarEnvioSolicitante(evento) {
    evento.preventDefault();
    if (!archivoSolicitante) return;
    setEnviandoSolicitante(true);
    try {
      await crearSolicitanteLicitacion({
        idProyecto,
        idUnidad: datosSolicitante.idUnidad,
        fechaSolicitud: datosSolicitante.fechaSolicitud,
        archivo: archivoSolicitante,
      });
      setDatosSolicitante(VALORES_INICIALES_SOLICITANTE);
      setArchivoSolicitante(null);
      cargarLicitaciones();
    } finally {
      setEnviandoSolicitante(false);
    }
  }

  function iniciarEdicionResolucion() {
    setDatosResolucion({
      numeroResolucion: licitacionEnProgreso.numeroResolucion,
      fechaResolucion: licitacionEnProgreso.fechaResolucion,
    });
    setArchivoResolucion(null);
    setEditandoResolucion(true);
  }

  function cancelarEdicionResolucion() {
    setDatosResolucion(VALORES_INICIALES_RESOLUCION);
    setArchivoResolucion(null);
    setEditandoResolucion(false);
  }

  // Sirve tanto para completar la Resolución la primera vez como para
  // editarla después — ambos casos usan el mismo endpoint del backend, que
  // exige el PDF solo si todavía no había ninguno guardado.
  async function manejarEnvioResolucion(evento) {
    evento.preventDefault();
    if (!tieneResolucion && !archivoResolucion) return;
    setEnviandoResolucion(true);
    try {
      await editarResolucionLicitacion(licitacionEnProgreso.id, {
        numeroResolucion: datosResolucion.numeroResolucion,
        fechaResolucion: datosResolucion.fechaResolucion,
        archivo: archivoResolucion,
      });
      setDatosResolucion(VALORES_INICIALES_RESOLUCION);
      setArchivoResolucion(null);
      setEditandoResolucion(false);
      cargarLicitaciones();
    } finally {
      setEnviandoResolucion(false);
    }
  }

  // Actualiza un nombre dentro de la comisión evaluadora (titulares o
  // suplentes) sin perder los otros dos nombres ya escritos.
  function manejarCambioComision(grupo, indice, valor) {
    setDatosLicitacion((previo) => {
      const copia = [...previo[grupo]];
      copia[indice] = valor;
      return { ...previo, [grupo]: copia };
    });
  }

  async function manejarEnvioDatosLicitacion(evento) {
    evento.preventDefault();
    if (!archivoPreguntas) return;
    setEnviandoDatosLicitacion(true);
    try {
      await completarDatosLicitacion(licitacionEnProgreso.id, {
        idLicitacionExterna: datosLicitacion.idLicitacionExterna,
        responsable: datosLicitacion.responsable,
        fechaLicitacion: datosLicitacion.fechaLicitacion,
        fechaRespuestaDesde: datosLicitacion.fechaRespuestaDesde,
        fechaRespuestaHasta: datosLicitacion.fechaRespuestaHasta,
        fechaFinalizacion: datosLicitacion.fechaFinalizacion,
        fechaAdjudicacion: datosLicitacion.fechaAdjudicacion,
        comisionTitulares: datosLicitacion.titulares,
        comisionSuplentes: datosLicitacion.suplentes,
        archivo: archivoPreguntas,
        archivoRex: archivoRexRespuestas,
      });
      setDatosLicitacion(VALORES_INICIALES_DATOS_LICITACION);
      setArchivoPreguntas(null);
      setArchivoRexRespuestas(null);
      cargarLicitaciones();
    } finally {
      setEnviandoDatosLicitacion(false);
    }
  }

  async function manejarEnvioAdjudicacion(evento) {
    evento.preventDefault();
    if (!datosAdjudicacion.resultado) return;
    if (datosAdjudicacion.resultado === 'adjudicado' && !archivoActaEvaluacion) return;
    if (datosAdjudicacion.resultado === 'desierta' && !archivoActaDesierta) return;
    setEnviandoAdjudicacion(true);
    try {
      await registrarAdjudicacion(licitacionEnProgreso.id, {
        resultado: datosAdjudicacion.resultado,
        nombreProveedor: datosAdjudicacion.nombreProveedor,
        rutProveedor: datosAdjudicacion.rutProveedor,
        telefonoProveedor: datosAdjudicacion.telefonoProveedor,
        correoProveedor: datosAdjudicacion.correoProveedor,
        nombreEncargadoProveedor: datosAdjudicacion.nombreEncargadoProveedor,
        montoAdjudicacion: datosAdjudicacion.montoAdjudicacion,
        archivoActaEvaluacion,
        fechaDesierta: datosAdjudicacion.fechaDesierta,
        archivoActaDesierta,
      });
      setDatosAdjudicacion(VALORES_INICIALES_ADJUDICACION);
      setArchivoActaEvaluacion(null);
      setArchivoActaDesierta(null);
      cargarLicitaciones();
    } finally {
      setEnviandoAdjudicacion(false);
    }
  }

  async function manejarEnvioRex(evento) {
    evento.preventDefault();
    if (!archivoRexAdjudicacion) return;
    setEnviandoRex(true);
    try {
      await registrarRexAdjudicacion(licitacionEnProgreso.id, {
        numeroRexAdjudicacion: datosRex.numeroRexAdjudicacion,
        fechaRexAdjudicacion: datosRex.fechaRexAdjudicacion,
        archivo: archivoRexAdjudicacion,
      });
      setDatosRex(VALORES_INICIALES_REX_ADJUDICACION);
      setArchivoRexAdjudicacion(null);
      cargarLicitaciones();
    } finally {
      setEnviandoRex(false);
    }
  }

  async function manejarEnvioIto(evento) {
    evento.preventDefault();
    setEnviandoIto(true);
    try {
      await registrarIto(licitacionEnProgreso.id, datosIto);
      setDatosIto(VALORES_INICIALES_ITO);
      cargarLicitaciones();
    } finally {
      setEnviandoIto(false);
    }
  }

  // Ya se tiene la lista cargada, así que el nombre del proyecto elegido sale de
  // ahí en vez de pedirlo de nuevo al backend.
  const proyectoSeleccionado = proyectos.find((proyecto) => proyecto.id === idProyecto);

  return (
    <div>
      <EncabezadoPagina
        icono="folderOpen"
        titulo={proyectoSeleccionado ? `Licitación: ${proyectoSeleccionado.nombre}` : 'Licitación'}
        descripcion="Etapa 4 — el proyecto sale a licitación."
        etiquetas={proyectoSeleccionado && <EtiquetasProyecto proyecto={proyectoSeleccionado} />}
        accion={
          idProyecto && (
            <Button variant="outline-secondary" size="sm" onClick={() => setIdProyecto(null)}>
              <Icono nombre="arrowLeft" tamano={12} className="me-2" />
              Volver al listado
            </Button>
          )
        }
      />

      {!idProyecto ? (
        cargandoProyectos ? (
          <Spinner animation="border" role="status" />
        ) : proyectos.length === 0 ? (
          <p className="text-secondary">Todavía no hay proyectos en la etapa de Licitación.</p>
        ) : (
          <div className="table-wrap">
            <table className="projects">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Tipo y localidad</th>
                  <th>Monto</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => (
                  <tr
                    className="proj-row"
                    key={proyecto.id}
                    role="button"
                    onClick={() => setIdProyecto(proyecto.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="proj-name">{proyecto.nombre}</div>
                      {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {proyecto.tipoProyecto?.nombre && (
                          <span className="pill tipo">{proyecto.tipoProyecto.nombre}</span>
                        )}
                        {proyecto.localidad?.nombre && (
                          <span className="pill localidad">{proyecto.localidad.nombre}</span>
                        )}
                      </div>
                    </td>
                    <td className="mono">
                      {montosPorProyecto[proyecto.id] !== undefined
                        ? `$${montosPorProyecto[proyecto.id].toLocaleString('es-CL')}`
                        : '—'}
                    </td>
                    <td className="mono">{new Date(proyecto.fechaActualizacion).toLocaleDateString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          <Row className="g-3 mb-3">
            <Col lg={7}>
              {proyectoSeleccionado && <DatosGeneralesProyecto proyecto={proyectoSeleccionado} />}
            </Col>

            <Col lg={5}>
              {proyectoSeleccionado && (
                <div className="mb-3">
                  <CaracteristicasProyecto proyecto={proyectoSeleccionado} />
                </div>
              )}

              {/* Historial de solo lectura de las 3 etapas anteriores — cada
                  botón abre su propio modal, igual que en Financiamiento/Aprobación. */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button
                  variant="light"
                  className="btn-archivo-verde"
                  size="sm"
                  onClick={() => setMostrarArchivosEtapa1(true)}
                >
                  <Icono nombre="image" tamano={14} className="me-2" />
                  Archivos etapa 1
                </Button>
                <Button
                  variant="light"
                  className="btn-archivo-amarillo"
                  size="sm"
                  onClick={() => setMostrarArchivosEtapa2(true)}
                >
                  <Icono nombre="sackDollar" tamano={14} className="me-2" />
                  Archivos etapa 2
                </Button>
                <Button
                  variant="light"
                  className="btn-archivo-azul"
                  size="sm"
                  onClick={() => setMostrarArchivosEtapa3(true)}
                >
                  <Icono nombre="squareCheck" tamano={14} className="me-2" />
                  Archivos etapa 3
                </Button>
              </div>

              <TablaFuentesFinanciamiento idProyecto={idProyecto} />
            </Col>
          </Row>

          {/* Línea de etapas (stepper) de 6 pasos, con los números funcionando
              como un menú de pestañas: se puede navegar libremente de vuelta a
              un paso anterior ya completo para revisarlo, pero cada paso
              siguiente sigue bloqueado hasta completar el anterior (backend
              permite, a lo sumo, una licitación en progreso por proyecto — sin
              idUnidadIto todavía). Al guardar un paso, el menú salta solo al
              siguiente. */}
          <div className="bg-white p-3 rounded border mb-3">
            <div className="etapas-licitacion-cabecera">
              {pasosLicitacion.map((paso, indice) => (
                <Fragment key={paso.numero}>
                  <button
                    type="button"
                    className="etapa-licitacion-boton"
                    onClick={() => paso.habilitado && setPasoSeleccionado(paso.numero)}
                    disabled={!paso.habilitado}
                  >
                    <div
                      className={`etapa-licitacion-numero ${!paso.habilitado ? 'bloqueado' : paso.completado ? 'completado' : 'activo'} ${pasoSeleccionado === paso.numero ? 'seleccionado' : ''}`}
                    >
                      {paso.completado ? <Icono nombre="circleCheck" tamano={18} /> : paso.numero}
                    </div>
                    <span
                      className={`etapa-licitacion-label ${paso.habilitado ? '' : 'bloqueado'} ${pasoSeleccionado === paso.numero ? 'seleccionado' : ''}`}
                    >
                      {paso.etiqueta}
                    </span>
                  </button>
                  {indice < pasosLicitacion.length - 1 && (
                    <div className={`etapa-licitacion-conector ${paso.completado ? 'completado' : ''}`} />
                  )}
                </Fragment>
              ))}
            </div>

            {pasoSeleccionado === 1 && (
              <div className="etapa-licitacion-panel">
                {licitacionEnProgreso ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      Unidad solicitante <strong className="text-dark">{licitacionEnProgreso.unidad?.nombre}</strong> ·
                      fecha <strong className="text-dark">{formatearFecha(licitacionEnProgreso.fechaSolicitud)}</strong>
                      {' · '}
                      <a href={construirUrlArchivo(licitacionEnProgreso.documentoBasesTecnicas)} target="_blank" rel="noreferrer">
                        Ver bases técnicas
                      </a>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setPasoSeleccionado(2)}>
                      Siguiente etapa →
                    </Button>
                  </div>
                ) : ultimaCompletada?.resultadoAdjudicacion === 'adjudicado' ? (
                  <div className="etapa-licitacion-resumen small text-secondary">
                    <Icono nombre="circleCheck" tamano={14} className="me-2 text-success" />
                    Proceso de licitación finalizado — la licitación{' '}
                    <strong className="text-dark">{ultimaCompletada.idLicitacionExterna}</strong> fue adjudicada a{' '}
                    <strong className="text-dark">{ultimaCompletada.nombreProveedor}</strong>. Revisa el historial más abajo.
                  </div>
                ) : ultimaCompletada?.resultadoAdjudicacion === 'desierta' && !iniciandoNuevoCiclo ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      La licitación anterior quedó <strong className="text-dark">desierta</strong>. Los datos quedaron
                      guardados en el historial más abajo.
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setIniciandoNuevoCiclo(true)}>
                      Comenzar nuevamente el proceso
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={manejarEnvioSolicitante}>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label className="small">Unidad solicitante</Form.Label>
                        <Form.Select
                          value={datosSolicitante.idUnidad}
                          onChange={(e) => setDatosSolicitante({ ...datosSolicitante, idUnidad: e.target.value })}
                          required
                        >
                          <option value="" disabled>Selecciona una…</option>
                          {unidades.map((unidad) => (
                            <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosSolicitante.fechaSolicitud}
                          onChange={(e) => setDatosSolicitante({ ...datosSolicitante, fechaSolicitud: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Bases técnicas (PDF)</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setArchivoSolicitante(e.target.files?.[0] ?? null)}
                          required
                        />
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="mt-3" disabled={enviandoSolicitante}>
                      {enviandoSolicitante ? 'Guardando…' : 'Guardar solicitante'}
                    </Button>
                  </Form>
                )}
              </div>
            )}

            {pasoSeleccionado === 2 && (
              <div className="etapa-licitacion-panel">
                {!licitacionEnProgreso ? (
                  <p className="small text-secondary mb-0">Completa el Solicitante para continuar.</p>
                ) : tieneResolucion && !editandoResolucion ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      Resolución <strong className="text-dark">{licitacionEnProgreso.numeroResolucion}</strong> del{' '}
                      <strong className="text-dark">{formatearFecha(licitacionEnProgreso.fechaResolucion)}</strong>
                      {' · '}
                      <a href={construirUrlArchivo(licitacionEnProgreso.documentoResolucion)} target="_blank" rel="noreferrer">
                        Ver PDF
                      </a>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={iniciarEdicionResolucion}>
                        <Icono nombre="pen" tamano={12} className="me-2" />
                        Editar
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setPasoSeleccionado(3)}>
                        Siguiente etapa →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form onSubmit={manejarEnvioResolucion}>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label className="small">N° de resolución</Form.Label>
                        <Form.Control
                          value={datosResolucion.numeroResolucion}
                          onChange={(e) => setDatosResolucion({ ...datosResolucion, numeroResolucion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha de resolución</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosResolucion.fechaResolucion}
                          onChange={(e) => setDatosResolucion({ ...datosResolucion, fechaResolucion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">PDF de la resolución</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setArchivoResolucion(e.target.files?.[0] ?? null)}
                          required={!tieneResolucion}
                        />
                        {tieneResolucion && (
                          <Form.Text className="text-secondary">Déjalo vacío para mantener el PDF actual.</Form.Text>
                        )}
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-3">
                      <Button type="submit" variant="primary" disabled={enviandoResolucion}>
                        {enviandoResolucion ? 'Guardando…' : tieneResolucion ? 'Guardar cambios' : 'Guardar resolución'}
                      </Button>
                      {editandoResolucion && (
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={cancelarEdicionResolucion}
                          disabled={enviandoResolucion}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Form>
                )}
              </div>
            )}

            {pasoSeleccionado === 3 && (
              <div className="etapa-licitacion-panel">
                {!tieneResolucion ? (
                  <p className="small text-secondary mb-0">Completa la Resolución para continuar.</p>
                ) : tieneDatosLicitacion ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      ID licitación <strong className="text-dark">{licitacionEnProgreso.idLicitacionExterna}</strong>
                      {' · '}Funcionario(a) de compras{' '}
                      <strong className="text-dark">{licitacionEnProgreso.responsable}</strong>
                      {' · '}
                      <a href={construirUrlArchivo(licitacionEnProgreso.documentoPreguntasRespuestas)} target="_blank" rel="noreferrer">
                        Ver preguntas y respuestas
                      </a>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setPasoSeleccionado(4)}>
                      Siguiente etapa →
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={manejarEnvioDatosLicitacion}>
                    <Row className="g-2">
                      <Col md={6}>
                        <Form.Label className="small">ID de licitación</Form.Label>
                        <Form.Control
                          value={datosLicitacion.idLicitacionExterna}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, idLicitacionExterna: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small">Funcionario(a) de compras</Form.Label>
                        <Form.Control
                          value={datosLicitacion.responsable}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, responsable: e.target.value })}
                          required
                        />
                      </Col>
                    </Row>

                    <Row className="g-2 mt-1">
                      <Col md={4}>
                        <Form.Label className="small">Fecha de inicio de la licitación</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosLicitacion.fechaLicitacion}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, fechaLicitacion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha de cierre</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosLicitacion.fechaFinalizacion}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, fechaFinalizacion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha de adjudicación</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosLicitacion.fechaAdjudicacion}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, fechaAdjudicacion: e.target.value })}
                          required
                        />
                      </Col>
                    </Row>

                    <Row className="g-2 mt-1">
                      <Col md={4}>
                        <Form.Label className="small">Fecha de respuesta desde</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosLicitacion.fechaRespuestaDesde}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, fechaRespuestaDesde: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha de respuesta hasta</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosLicitacion.fechaRespuestaHasta}
                          onChange={(e) => setDatosLicitacion({ ...datosLicitacion, fechaRespuestaHasta: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Documento de preguntas y respuestas (PDF)</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setArchivoPreguntas(e.target.files?.[0] ?? null)}
                          required
                        />
                      </Col>
                    </Row>

                    <Row className="g-2 mt-1">
                      <Col md={4}>
                        <Form.Label className="small">REX con respuestas (opcional)</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setArchivoRexRespuestas(e.target.files?.[0] ?? null)}
                        />
                      </Col>
                    </Row>

                    <Row className="g-2 mt-3">
                      <Col md={6}>
                        <p className="small fw-bold mb-2">Comisión evaluadora — titulares</p>
                        <Row className="g-2">
                          {datosLicitacion.titulares.map((nombre, indice) => (
                            <Col xs={12} key={`titular-${indice}`}>
                              <Form.Control
                                placeholder={`Nombre ${indice + 1}`}
                                value={nombre}
                                onChange={(e) => manejarCambioComision('titulares', indice, e.target.value)}
                                required
                              />
                            </Col>
                          ))}
                        </Row>
                      </Col>
                      <Col md={6}>
                        <p className="small fw-bold mb-2">Comisión evaluadora — suplentes</p>
                        <Row className="g-2">
                          {datosLicitacion.suplentes.map((nombre, indice) => (
                            <Col xs={12} key={`suplente-${indice}`}>
                              <Form.Control
                                placeholder={`Nombre ${indice + 1}`}
                                value={nombre}
                                onChange={(e) => manejarCambioComision('suplentes', indice, e.target.value)}
                                required
                              />
                            </Col>
                          ))}
                        </Row>
                      </Col>
                    </Row>

                    <Button type="submit" variant="primary" className="mt-3" disabled={enviandoDatosLicitacion}>
                      {enviandoDatosLicitacion ? 'Guardando…' : 'Guardar datos de licitación'}
                    </Button>
                  </Form>
                )}
              </div>
            )}

            {pasoSeleccionado === 4 && (
              <div className="etapa-licitacion-panel">
                {!tieneDatosLicitacion ? (
                  <p className="small text-secondary mb-0">Completa los Datos de la licitación para continuar.</p>
                ) : tieneAdjudicacion ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      {licitacionEnProgreso.resultadoAdjudicacion === 'adjudicado' ? (
                        <>
                          Adjudicado a <strong className="text-dark">{licitacionEnProgreso.nombreProveedor}</strong>
                          {' '}(RUT {licitacionEnProgreso.rutProveedor}) por{' '}
                          <strong className="text-dark">{formatearMonto(licitacionEnProgreso.montoAdjudicacion)}</strong>
                          {' · '}
                          <a href={construirUrlArchivo(licitacionEnProgreso.documentoActaEvaluacion)} target="_blank" rel="noreferrer">
                            Ver acta de evaluación
                          </a>
                        </>
                      ) : (
                        <>
                          Licitación declarada <strong className="text-dark">desierta</strong> el{' '}
                          <strong className="text-dark">{formatearFecha(licitacionEnProgreso.fechaDesierta)}</strong>
                          {' · '}
                          <a href={construirUrlArchivo(licitacionEnProgreso.documentoActaDesierta)} target="_blank" rel="noreferrer">
                            Ver acta
                          </a>
                        </>
                      )}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setPasoSeleccionado(5)}>
                      Siguiente etapa →
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={manejarEnvioAdjudicacion}>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label className="small">Resultado</Form.Label>
                        <Form.Select
                          value={datosAdjudicacion.resultado}
                          onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, resultado: e.target.value })}
                          required
                        >
                          <option value="" disabled>Selecciona…</option>
                          <option value="adjudicado">Adjudicado</option>
                          <option value="desierta">Desierta</option>
                        </Form.Select>
                      </Col>
                    </Row>

                    {datosAdjudicacion.resultado === 'adjudicado' && (
                      <>
                        <Row className="g-2 mt-1">
                          <Col md={6}>
                            <Form.Label className="small">Nombre del proveedor</Form.Label>
                            <Form.Control
                              value={datosAdjudicacion.nombreProveedor}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, nombreProveedor: e.target.value })}
                              required
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Label className="small">RUT</Form.Label>
                            <Form.Control
                              value={datosAdjudicacion.rutProveedor}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, rutProveedor: e.target.value })}
                              required
                            />
                          </Col>
                        </Row>
                        <Row className="g-2 mt-1">
                          <Col md={4}>
                            <Form.Label className="small">Teléfono</Form.Label>
                            <Form.Control
                              value={datosAdjudicacion.telefonoProveedor}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, telefonoProveedor: e.target.value })}
                              required
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Label className="small">Correo electrónico</Form.Label>
                            <Form.Control
                              type="email"
                              value={datosAdjudicacion.correoProveedor}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, correoProveedor: e.target.value })}
                              required
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Label className="small">Nombre del encargado</Form.Label>
                            <Form.Control
                              value={datosAdjudicacion.nombreEncargadoProveedor}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, nombreEncargadoProveedor: e.target.value })}
                              required
                            />
                          </Col>
                        </Row>
                        <Row className="g-2 mt-1">
                          <Col md={4}>
                            <Form.Label className="small">Monto de adjudicación</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={datosAdjudicacion.montoAdjudicacion}
                              onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, montoAdjudicacion: e.target.value })}
                              required
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Label className="small">Acta de evaluación (PDF)</Form.Label>
                            <Form.Control
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setArchivoActaEvaluacion(e.target.files?.[0] ?? null)}
                              required
                            />
                          </Col>
                        </Row>
                      </>
                    )}

                    {datosAdjudicacion.resultado === 'desierta' && (
                      <Row className="g-2 mt-1">
                        <Col md={4}>
                          <Form.Label className="small">Fecha</Form.Label>
                          <Form.Control
                            type="date"
                            value={datosAdjudicacion.fechaDesierta}
                            onChange={(e) => setDatosAdjudicacion({ ...datosAdjudicacion, fechaDesierta: e.target.value })}
                            required
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Acta (PDF)</Form.Label>
                          <Form.Control
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setArchivoActaDesierta(e.target.files?.[0] ?? null)}
                            required
                          />
                        </Col>
                      </Row>
                    )}

                    <Button type="submit" variant="primary" className="mt-3" disabled={enviandoAdjudicacion}>
                      {enviandoAdjudicacion ? 'Guardando…' : 'Guardar adjudicación'}
                    </Button>
                  </Form>
                )}
              </div>
            )}

            {pasoSeleccionado === 5 && (
              <div className="etapa-licitacion-panel">
                {!tieneAdjudicacion ? (
                  <p className="small text-secondary mb-0">Completa la Adjudicación para continuar.</p>
                ) : tieneRex ? (
                  <div className="etapa-licitacion-resumen small text-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      REX <strong className="text-dark">{licitacionEnProgreso.numeroRexAdjudicacion}</strong> del{' '}
                      <strong className="text-dark">{formatearFecha(licitacionEnProgreso.fechaRexAdjudicacion)}</strong>
                      {' · '}
                      <a href={construirUrlArchivo(licitacionEnProgreso.documentoRexAdjudicacion)} target="_blank" rel="noreferrer">
                        Ver PDF
                      </a>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setPasoSeleccionado(6)}>
                      Siguiente etapa →
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={manejarEnvioRex}>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label className="small">N° de REX</Form.Label>
                        <Form.Control
                          value={datosRex.numeroRexAdjudicacion}
                          onChange={(e) => setDatosRex({ ...datosRex, numeroRexAdjudicacion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Fecha</Form.Label>
                        <Form.Control
                          type="date"
                          value={datosRex.fechaRexAdjudicacion}
                          onChange={(e) => setDatosRex({ ...datosRex, fechaRexAdjudicacion: e.target.value })}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Documento (PDF)</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setArchivoRexAdjudicacion(e.target.files?.[0] ?? null)}
                          required
                        />
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="mt-3" disabled={enviandoRex}>
                      {enviandoRex ? 'Guardando…' : 'Guardar REX de adjudicación'}
                    </Button>
                  </Form>
                )}
              </div>
            )}

            {pasoSeleccionado === 6 && (
              <div className="etapa-licitacion-panel">
                {!tieneRex ? (
                  <p className="small text-secondary mb-0">Completa la REX de adjudicación para continuar.</p>
                ) : (
                  <Form onSubmit={manejarEnvioIto}>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label className="small">Unidad</Form.Label>
                        <Form.Select
                          value={datosIto.idUnidadIto}
                          onChange={(e) => setDatosIto({ ...datosIto, idUnidadIto: e.target.value })}
                          required
                        >
                          <option value="" disabled>Selecciona una…</option>
                          {unidades.map((unidad) => (
                            <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small">Nombre del ITO</Form.Label>
                        <Form.Control
                          value={datosIto.nombreIto}
                          onChange={(e) => setDatosIto({ ...datosIto, nombreIto: e.target.value })}
                          required
                        />
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="mt-3" disabled={enviandoIto}>
                      {enviandoIto ? 'Guardando…' : 'Guardar ITO'}
                    </Button>
                  </Form>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-3 rounded border mb-3">
            <TituloTarjeta icono="clipboardList">Historial de licitaciones</TituloTarjeta>
            {historial.length === 0 ? (
              <p className="text-secondary small mb-0">Todavía no hay licitaciones completas para este proyecto.</p>
            ) : (
              <div className="table-wrap">
                <table className="projects">
                  <thead>
                    <tr>
                      <th>ID licitación</th>
                      <th>Funcionario(a) de compras</th>
                      <th>Unidad solicitante</th>
                      <th>N° resolución</th>
                      <th>Resultado</th>
                      <th>Proveedor</th>
                      <th>Monto adjudicación</th>
                      <th>N° REX adjudicación</th>
                      <th>ITO</th>
                      <th>Bases técnicas</th>
                      <th>Resolución</th>
                      <th>Preguntas y respuestas</th>
                      <th>REX con respuestas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((licitacion) => (
                      <tr className="proj-row" key={licitacion.id}>
                        <td className="mono">{licitacion.idLicitacionExterna}</td>
                        <td>{licitacion.responsable}</td>
                        <td>{licitacion.unidad?.nombre ?? '—'}</td>
                        <td className="mono">{licitacion.numeroResolucion}</td>
                        <td>
                          {licitacion.resultadoAdjudicacion === 'adjudicado' ? (
                            <a href={construirUrlArchivo(licitacion.documentoActaEvaluacion)} target="_blank" rel="noreferrer">
                              Adjudicado
                            </a>
                          ) : (
                            <a href={construirUrlArchivo(licitacion.documentoActaDesierta)} target="_blank" rel="noreferrer">
                              Desierta
                            </a>
                          )}
                        </td>
                        <td>{licitacion.nombreProveedor ?? '—'}</td>
                        <td className="mono">{formatearMonto(licitacion.montoAdjudicacion)}</td>
                        <td>
                          <a href={construirUrlArchivo(licitacion.documentoRexAdjudicacion)} target="_blank" rel="noreferrer">
                            {licitacion.numeroRexAdjudicacion}
                          </a>
                        </td>
                        <td>
                          {licitacion.unidadIto?.nombre ?? '—'}
                          {licitacion.nombreIto ? ` — ${licitacion.nombreIto}` : ''}
                        </td>
                        <td>
                          <a href={construirUrlArchivo(licitacion.documentoBasesTecnicas)} target="_blank" rel="noreferrer">
                            Ver bases técnicas
                          </a>
                        </td>
                        <td>
                          <a href={construirUrlArchivo(licitacion.documentoResolucion)} target="_blank" rel="noreferrer">
                            Ver resolución
                          </a>
                        </td>
                        <td>
                          {licitacion.documentoPreguntasRespuestas ? (
                            <a href={construirUrlArchivo(licitacion.documentoPreguntasRespuestas)} target="_blank" rel="noreferrer">
                              Ver preguntas y respuestas
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {licitacion.documentoRexRespuestas ? (
                            <a href={construirUrlArchivo(licitacion.documentoRexRespuestas)} target="_blank" rel="noreferrer">
                              Ver REX
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <BitacoraFlotante idProyecto={idProyecto} etapaActual={proyectoSeleccionado?.etapaActual} />
        </>
      )}

      <Modal show={mostrarArchivosEtapa1} onHide={() => setMostrarArchivosEtapa1(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title as="div">
            <TituloTarjeta icono="image" as="span">Archivo Banco de Ideas</TituloTarjeta>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {proyectoSeleccionado && (
            <ImagenesProyecto proyecto={proyectoSeleccionado} titulo={null} sinTarjeta />
          )}
        </Modal.Body>
      </Modal>

      <ResumenFinanciamiento
        idProyecto={idProyecto}
        show={mostrarArchivosEtapa2}
        onHide={() => setMostrarArchivosEtapa2(false)}
      />

      <ResumenAprobacion
        idProyecto={idProyecto}
        show={mostrarArchivosEtapa3}
        onHide={() => setMostrarArchivosEtapa3(false)}
      />
    </div>
  );
}

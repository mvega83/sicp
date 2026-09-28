import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import ListaBitacora from '../Bitacora/ListaBitacora';
import { adjuntarRex, crearLicitacion, listarLicitaciones } from '../../servicios/serviciosLicitacion';
import { listarProyectos } from '../../servicios/serviciosProyectos';
import { listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import EtiquetasProyecto from '../comunes/EtiquetasProyecto';
import Icono from '../comunes/Icono';
import TituloTarjeta from '../comunes/TituloTarjeta';
import { construirUrlArchivo } from '../../utilidades/archivos';

const VALORES_INICIALES = {
  idLicitacionExterna: '',
  responsable: '',
  fechaLicitacion: '',
  fechaRespuesta: '',
  fechaFinalizacion: '',
  fechaAdjudicacion: '',
};

export default function PaginaLicitacion() {
  // null = todavía no se eligió con qué proyecto trabajar; ahí se muestra el
  // listado de proyectos en esta etapa en vez del formulario (mismo patrón que
  // PaginaFinanciamiento.jsx).
  const [idProyecto, setIdProyecto] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [montosPorProyecto, setMontosPorProyecto] = useState({});
  const [licitaciones, setLicitaciones] = useState([]);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (idProyecto) cargarLicitaciones();
    else setLicitaciones([]);
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

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      // Las fechas opcionales se mandan solo si se completaron, para no pisar el
      // validador del backend con strings vacíos.
      const cuerpo = { idProyecto, idLicitacionExterna: datos.idLicitacionExterna, responsable: datos.responsable, fechaLicitacion: datos.fechaLicitacion };
      ['fechaRespuesta', 'fechaFinalizacion', 'fechaAdjudicacion'].forEach((campo) => {
        if (datos[campo]) cuerpo[campo] = datos[campo];
      });
      await crearLicitacion(cuerpo);
      setDatos(VALORES_INICIALES);
      cargarLicitaciones();
    } finally {
      setEnviando(false);
    }
  }

  async function manejarAdjuntarRex(idLicitacion, evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await adjuntarRex(idLicitacion, archivo);
    cargarLicitaciones();
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
        <Row className="g-3">
          <Col lg={7}>
            <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border mb-3">
              <Row className="g-2">
                <Col md={6}>
                  <Form.Label className="small">ID de licitación</Form.Label>
                  <Form.Control
                    value={datos.idLicitacionExterna}
                    onChange={(e) => setDatos({ ...datos, idLicitacionExterna: e.target.value })}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Responsable</Form.Label>
                  <Form.Control
                    value={datos.responsable}
                    onChange={(e) => setDatos({ ...datos, responsable: e.target.value })}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small">Fecha licitación</Form.Label>
                  <Form.Control
                    type="date"
                    value={datos.fechaLicitacion}
                    onChange={(e) => setDatos({ ...datos, fechaLicitacion: e.target.value })}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small">Fecha respuesta</Form.Label>
                  <Form.Control
                    type="date"
                    value={datos.fechaRespuesta}
                    onChange={(e) => setDatos({ ...datos, fechaRespuesta: e.target.value })}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small">Fecha finalización</Form.Label>
                  <Form.Control
                    type="date"
                    value={datos.fechaFinalizacion}
                    onChange={(e) => setDatos({ ...datos, fechaFinalizacion: e.target.value })}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small">Fecha adjudicación</Form.Label>
                  <Form.Control
                    type="date"
                    value={datos.fechaAdjudicacion}
                    onChange={(e) => setDatos({ ...datos, fechaAdjudicacion: e.target.value })}
                  />
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3" disabled={enviando}>
                Guardar licitación
              </Button>
            </Form>

            <div className="table-wrap">
              <table className="projects">
                <thead>
                  <tr>
                    <th>ID licitación</th>
                    <th>Responsable</th>
                    <th>Adjudicación</th>
                    <th>REX</th>
                  </tr>
                </thead>
                <tbody>
                  {licitaciones.map((licitacion) => (
                    <tr className="proj-row" key={licitacion.id}>
                      <td className="mono">{licitacion.idLicitacionExterna}</td>
                      <td>{licitacion.responsable}</td>
                      <td className="mono">{licitacion.fechaAdjudicacion ?? '—'}</td>
                      <td>
                        {licitacion.archivoRex ? (
                          <a href={construirUrlArchivo(licitacion.archivoRex)} target="_blank" rel="noreferrer">
                            Ver archivo
                          </a>
                        ) : (
                          <Form.Control
                            type="file"
                            size="sm"
                            accept=".pdf,.doc,.docx"
                            onChange={(evento) => manejarAdjuntarRex(licitacion.id, evento)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={5}>
            <div className="bg-white p-3 rounded border">
              <TituloTarjeta icono="clipboardList">Bitácora</TituloTarjeta>
              <ListaBitacora idProyecto={idProyecto} etapa="licitacion" />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

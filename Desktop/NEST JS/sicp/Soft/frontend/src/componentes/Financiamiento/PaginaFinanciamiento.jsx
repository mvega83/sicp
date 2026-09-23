import { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import ListaBitacora from '../Bitacora/ListaBitacora';
import DetalleProyecto from '../comunes/DetalleProyecto';
import Icono from '../comunes/Icono';
import { listarProyectos } from '../../servicios/serviciosProyectos';
import {
  crearFinanciamiento,
  eliminarDecretoFinanciamiento,
  eliminarDocumentoFinanciamiento,
  eliminarFinanciamiento,
  listarDecretosFinanciamiento,
  listarDocumentosFinanciamiento,
  listarFinanciamiento,
  subirDecretoFinanciamiento,
  subirDocumentoFinanciamiento,
} from '../../servicios/serviciosFinanciamiento';
import { listarTiposFuenteFinanciamiento } from '../../servicios/serviciosTipoFuenteFinanciamiento';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { construirUrlArchivo } from '../../utilidades/archivos';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { idTipoFuenteFinanciamiento: '', monto: '', observaciones: '' };

export default function PaginaFinanciamiento() {
  // null = todavía no se eligió con qué proyecto trabajar; ahí se muestra el
  // listado de proyectos en esta etapa en vez del formulario.
  const [idProyecto, setIdProyecto] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [fuentes, setFuentes] = useState([]);
  const [tiposFuente, setTiposFuente] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const inputArchivoRef = useRef(null);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Fuente sobre la que está abierto el modal de decretos (null = modal cerrado).
  const [fuenteDecretos, setFuenteDecretos] = useState(null);
  const [decretos, setDecretos] = useState([]);
  const [fechaNuevoDecreto, setFechaNuevoDecreto] = useState('');
  const [subiendoDecreto, setSubiendoDecreto] = useState(false);
  const inputDecretoRef = useRef(null);

  useEffect(() => {
    cargarProyectos();
    // Catálogo de fuentes disponibles (Configuración): se carga una sola vez, no
    // depende de qué proyecto esté seleccionado.
    listarTiposFuenteFinanciamiento().then(setTiposFuente);
  }, []);

  useEffect(() => {
    if (idProyecto) {
      cargarFuentes();
      cargarDocumentos();
    } else {
      setFuentes([]);
      setDocumentos([]);
    }
  }, [idProyecto]);

  function cargarProyectos() {
    setCargandoProyectos(true);
    listarProyectos('financiamiento')
      .then(setProyectos)
      .finally(() => setCargandoProyectos(false));
  }

  function cargarFuentes() {
    listarFinanciamiento(idProyecto).then(setFuentes);
  }

  function cargarDocumentos() {
    listarDocumentosFinanciamiento(idProyecto).then(setDocumentos);
  }

  async function manejarSeleccionDocumento(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSubiendoDocumento(true);
    try {
      await subirDocumentoFinanciamiento(idProyecto, archivo);
      cargarDocumentos();
    } finally {
      setSubiendoDocumento(false);
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }

  async function manejarEliminarDocumento(documento) {
    const confirmado = await confirmarEliminacion(
      'Se eliminará este documento de la etapa de Financiamiento. Esta acción no se puede deshacer.',
    );
    if (!confirmado) return;
    await eliminarDocumentoFinanciamiento(documento.id);
    cargarDocumentos();
    mostrarExito('¡Eliminado!', 'El documento se eliminó correctamente.');
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await crearFinanciamiento({
        idProyecto,
        idTipoFuenteFinanciamiento: datos.idTipoFuenteFinanciamiento,
        monto: parseFloat(datos.monto),
        observaciones: datos.observaciones || undefined,
      });
      setDatos(VALORES_INICIALES);
      cargarFuentes();
    } catch (error) {
      setError(
        error?.response?.data?.message ?? 'No se pudo agregar la fuente de financiamiento. Intenta de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  function abrirModalDecretos(fuente) {
    setFuenteDecretos(fuente);
    setFechaNuevoDecreto('');
    listarDecretosFinanciamiento(fuente.id).then(setDecretos);
  }

  function cargarDecretos() {
    if (fuenteDecretos) listarDecretosFinanciamiento(fuenteDecretos.id).then(setDecretos);
  }

  async function manejarSeleccionDecreto(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo || !fechaNuevoDecreto) return;
    setSubiendoDecreto(true);
    try {
      await subirDecretoFinanciamiento(fuenteDecretos.id, fechaNuevoDecreto, archivo);
      setFechaNuevoDecreto('');
      cargarDecretos();
    } finally {
      setSubiendoDecreto(false);
      if (inputDecretoRef.current) inputDecretoRef.current.value = '';
    }
  }

  async function manejarEliminarDecreto(decreto) {
    const confirmado = await confirmarEliminacion(
      'Se eliminará este decreto. Esta acción no se puede deshacer.',
    );
    if (!confirmado) return;
    await eliminarDecretoFinanciamiento(decreto.id);
    cargarDecretos();
    mostrarExito('¡Eliminado!', 'El decreto se eliminó correctamente.');
  }

  async function manejarEliminar(fuente) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará la fuente "${fuente.tipoFuenteFinanciamiento?.nombre}" ($${Number(fuente.monto).toLocaleString('es-CL')}). Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarFinanciamiento(fuente.id);
    cargarFuentes();
    mostrarExito('¡Eliminado!', 'La fuente de financiamiento se eliminó correctamente.');
  }

  // Ya se tiene la lista cargada, así que el nombre del proyecto elegido sale de
  // ahí en vez de pedirlo de nuevo al backend.
  const proyectoSeleccionado = proyectos.find((proyecto) => proyecto.id === idProyecto);

  // El proyecto no puede tener la misma fuente dos veces, así que ni se ofrecen
  // las que ya tiene agregadas (además de que el backend también lo rechaza).
  const tiposFuenteDisponibles = tiposFuente.filter(
    (tipo) => !fuentes.some((fuente) => fuente.idTipoFuenteFinanciamiento === tipo.id),
  );

  return (
    <div>
      <EncabezadoPagina
        icono="sackDollar"
        titulo="Financiamiento"
        descripcion="Etapa 2 — fuentes de financiamiento asociadas a un proyecto."
      />

      {!idProyecto ? (
        cargandoProyectos ? (
          <Spinner animation="border" role="status" />
        ) : proyectos.length === 0 ? (
          <p className="text-secondary">Todavía no hay proyectos en la etapa de Financiamiento.</p>
        ) : (
          <div className="table-wrap">
            <table className="projects">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Tipo y localidad</th>
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
                    <td className="mono">{new Date(proyecto.fechaActualizacion).toLocaleDateString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => setIdProyecto(null)}>
            <Icono nombre="arrowLeft" tamano={12} className="me-2" />
            Volver al listado
          </Button>

          <DetalleProyecto proyecto={proyectoSeleccionado} />

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-3">
            <Col lg={7}>
              <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border mb-3">
                <Row className="g-2 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small">Fuente</Form.Label>
                    <Form.Select
                      value={datos.idTipoFuenteFinanciamiento}
                      onChange={(e) => setDatos({ ...datos, idTipoFuenteFinanciamiento: e.target.value })}
                      required
                    >
                      <option value="" disabled>Selecciona una…</option>
                      {tiposFuenteDisponibles.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                      ))}
                    </Form.Select>
                    {tiposFuenteDisponibles.length === 0 && (
                      <div className="text-secondary small mt-1">
                        Ya se agregaron todas las fuentes disponibles a este proyecto.
                      </div>
                    )}
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small">Monto (CLP)</Form.Label>
                    <Form.Control
                      type="number"
                      value={datos.monto}
                      onChange={(e) => setDatos({ ...datos, monto: e.target.value })}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small">Observaciones</Form.Label>
                    <Form.Control
                      value={datos.observaciones}
                      onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      disabled={enviando || tiposFuenteDisponibles.length === 0}
                    >
                      Agregar
                    </Button>
                  </Col>
                </Row>
              </Form>

              <div className="table-wrap">
                <table className="projects">
                  <thead>
                    <tr>
                      <th>Fuente</th>
                      <th>Monto</th>
                      <th>Observaciones</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuentes.map((fuente) => (
                      <tr className="proj-row" key={fuente.id}>
                        <td>
                          <div className="proj-name">{fuente.tipoFuenteFinanciamiento?.nombre}</div>
                          {fuente.tipoFuenteFinanciamiento?.procedencia && (
                            <div className="proj-commune">{fuente.tipoFuenteFinanciamiento.procedencia}</div>
                          )}
                        </td>
                        <td className="mono">${Number(fuente.monto).toLocaleString('es-CL')}</td>
                        <td className="text-secondary">{fuente.observaciones}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="link"
                            aria-label="Decretos de la fuente"
                            title="Decretos"
                            onClick={() => abrirModalDecretos(fuente)}
                          >
                            <Icono nombre="fileLines" tamano={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="link"
                            className="text-danger"
                            aria-label="Eliminar fuente de financiamiento"
                            title="Eliminar"
                            onClick={() => manejarEliminar(fuente)}
                          >
                            <Icono nombre="trash" tamano={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
            <Col lg={5}>
              <div className="bg-white p-3 rounded border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 mb-0">Documentos</h2>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => inputArchivoRef.current?.click()}
                    disabled={subiendoDocumento}
                  >
                    {subiendoDocumento ? 'Subiendo…' : '+ Agregar archivo'}
                  </Button>
                  <input
                    ref={inputArchivoRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="d-none"
                    onChange={manejarSeleccionDocumento}
                  />
                </div>
                {documentos.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {documentos.map((documento) => {
                      const esPdf = documento.url.toLowerCase().endsWith('.pdf');
                      return (
                        <div key={documento.id} style={{ position: 'relative' }}>
                          <a
                            href={construirUrlArchivo(documento.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="d-flex flex-column align-items-center justify-content-center text-decoration-none"
                            style={{
                              width: 96,
                              height: 72,
                              borderRadius: 8,
                              background: 'var(--sicp-fondo)',
                              border: '1px solid var(--sicp-borde)',
                              overflow: 'hidden',
                            }}
                          >
                            {esPdf ? (
                              <>
                                <Icono nombre="filePdf" tamano={22} className="text-danger" />
                                <span className="text-secondary" style={{ fontSize: 10, marginTop: 4 }}>PDF</span>
                              </>
                            ) : (
                              <img
                                src={construirUrlArchivo(documento.url)}
                                alt="Documento de financiamiento"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                          </a>
                          <button
                            type="button"
                            onClick={() => manejarEliminarDocumento(documento)}
                            aria-label="Eliminar documento"
                            className="btn btn-outline-danger"
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 22,
                              height: 22,
                              padding: 0,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icono nombre="xmark" tamano={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-secondary small mb-0">Todavía no hay documentos.</p>
                )}
              </div>

              <div className="bg-white p-3 rounded border">
                <h2 className="h6">Bitácora</h2>
                <ListaBitacora idProyecto={idProyecto} etapa="financiamiento" />
              </div>
            </Col>
          </Row>
        </>
      )}

      <Modal show={Boolean(fuenteDecretos)} onHide={() => setFuenteDecretos(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">
            Decretos — {fuenteDecretos?.tipoFuenteFinanciamiento?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2 align-items-end mb-3">
            <Col xs={5}>
              <Form.Label className="small">Fecha del decreto</Form.Label>
              <Form.Control
                type="date"
                value={fechaNuevoDecreto}
                onChange={(e) => setFechaNuevoDecreto(e.target.value)}
              />
            </Col>
            <Col xs={7}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => inputDecretoRef.current?.click()}
                disabled={!fechaNuevoDecreto || subiendoDecreto}
              >
                {subiendoDecreto ? 'Subiendo…' : '+ Agregar decreto'}
              </Button>
              <input
                ref={inputDecretoRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="d-none"
                onChange={manejarSeleccionDecreto}
              />
            </Col>
          </Row>
          {!fechaNuevoDecreto && (
            <p className="text-secondary small">Elige primero la fecha del decreto, luego el archivo.</p>
          )}

          {decretos.length ? (
            <ul className="list-unstyled m-0">
              {decretos.map((decreto) => (
                <li
                  key={decreto.id}
                  className="d-flex justify-content-between align-items-center border-top pt-2 mt-2"
                >
                  <a href={construirUrlArchivo(decreto.urlDecreto)} target="_blank" rel="noreferrer">
                    <Icono nombre="filePdf" tamano={14} className="me-2 text-danger" />
                    {new Date(`${decreto.fechaDecreto}T00:00:00`).toLocaleDateString('es-CL')}
                  </a>
                  <Button
                    size="sm"
                    variant="link"
                    className="text-danger"
                    aria-label="Eliminar decreto"
                    onClick={() => manejarEliminarDecreto(decreto)}
                  >
                    <Icono nombre="trash" tamano={13} />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary small mb-0">Todavía no hay decretos para esta fuente.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import {
  eliminarImagenProyecto,
  enviarProyectoAFinanciamiento,
  obtenerProyecto,
  subirImagenProyecto,
} from '../../servicios/serviciosProyectos';
import { agregarEventoBitacora } from '../../servicios/serviciosBitacora';
import ListaBitacora from '../Bitacora/ListaBitacora';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import Icono from '../comunes/Icono';
import MapaProyecto from '../comunes/MapaProyecto';
import { construirUrlArchivo } from '../../utilidades/archivos';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastCreado } from '../../utilidades/toast';
import { esEditable, ORDEN_ETAPAS } from '../../utilidades/etapas';

export default function FichaProyecto() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const inputArchivoRef = useRef(null);
  // Imagen que se está mostrando en grande (null = visor cerrado). Se guarda la URL
  // completa, no el índice, porque es lo único que el visor necesita para dibujarse.
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [textoObservacion, setTextoObservacion] = useState('');
  const [enviandoObservacion, setEnviandoObservacion] = useState(false);
  // ListaBitacora solo recarga cuando cambian sus props; al no tener ninguna que
  // varíe al agregar una observación, se le pasa esta como "key" para forzar que se
  // vuelva a montar (y por lo tanto vuelva a pedir la lista actualizada al backend).
  const [refrescoBitacora, setRefrescoBitacora] = useState(0);

  useEffect(() => {
    cargarProyecto();
  }, [id]);

  function cargarProyecto() {
    setCargando(true);
    obtenerProyecto(id)
      .then(setProyecto)
      .finally(() => setCargando(false));
  }

  async function manejarSeleccionImagen(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSubiendoImagen(true);
    try {
      const proyectoActualizado = await subirImagenProyecto(id, archivo);
      setProyecto(proyectoActualizado);
    } finally {
      setSubiendoImagen(false);
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }

  async function manejarEliminarArchivo(url) {
    const confirmado = await confirmarEliminacion(
      'Se eliminará este archivo del proyecto. Esta acción no se puede deshacer.',
    );
    if (!confirmado) return;
    const proyectoActualizado = await eliminarImagenProyecto(id, url);
    setProyecto(proyectoActualizado);
    mostrarExito('¡Eliminado!', 'El archivo se eliminó correctamente.');
  }

  async function manejarEnvioObservacion(evento) {
    evento.preventDefault();
    const descripcion = textoObservacion.trim();
    if (!descripcion) return;
    setEnviandoObservacion(true);
    try {
      await agregarEventoBitacora({ idProyecto: id, etapa: ORDEN_ETAPAS[0], descripcion });
      setTextoObservacion('');
      setRefrescoBitacora((anterior) => anterior + 1);
      mostrarToastCreado('La observación se agregó a la bitácora.');
    } finally {
      setEnviandoObservacion(false);
    }
  }

  async function manejarEnvioAFinanciamiento() {
    const confirmado = await confirmarEliminacion(
      `El proyecto "${proyecto.nombre}" pasará a la etapa de Financiamiento y ya no podrá editarse desde banco de ideas.`,
      '¿Enviar a Financiamiento?',
      'Enviar',
    );
    if (!confirmado) return;
    const proyectoActualizado = await enviarProyectoAFinanciamiento(id);
    setProyecto(proyectoActualizado);
    mostrarExito('¡Enviado!', 'El proyecto pasó a la etapa de Financiamiento.');
  }

  if (cargando) return <Spinner animation="border" role="status" />;
  if (!proyecto) return <p>No se encontró el proyecto.</p>;

  return (
    <div>
      <EncabezadoPagina
        icono="folderOpen"
        titulo={proyecto.nombre}
        descripcion={
          <>
            {proyecto.tipoProyecto?.nombre && (
              <span className="pill tipo me-2">{proyecto.tipoProyecto.nombre}</span>
            )}
            {proyecto.localidad?.nombre && (
              <span className="pill localidad me-2">{proyecto.localidad.nombre}</span>
            )}
            {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
          </>
        }
        // Editar y "Enviar a Financiamiento" solo tienen sentido mientras el proyecto
        // sigue en banco de ideas: una vez avanza de etapa, el backend rechaza ambas
        // acciones (403 en el PATCH, y el envío ya no aplica dos veces).
        accion={
          esEditable(proyecto.etapaActual) && (
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => navegar(`/proyectos/${id}/editar`)}>
                <Icono nombre="pen" tamano={14} className="me-2" />
                Editar
              </Button>
              <Button variant="primary" onClick={manejarEnvioAFinanciamiento}>
                Enviar a Financiamiento
              </Button>
            </div>
          )
        }
      />

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="h6">Datos generales</Card.Title>
              <Row className="g-3 small">
                <Col md={6}>
                  <div className="text-secondary">Dirección</div>
                  <div>{proyecto.direccion}</div>
                </Col>
                <Col md={6}>
                  <div className="text-secondary">Localidad</div>
                  <div>{proyecto.localidad?.nombre}</div>
                </Col>
                <Col md={3}>
                  <div className="text-secondary">Latitud</div>
                  <div>{proyecto.latitud}</div>
                </Col>
                <Col md={3}>
                  <div className="text-secondary">Longitud</div>
                  <div>{proyecto.longitud}</div>
                </Col>
              </Row>
              {/* Solo lectura: acá no se debe poder mover el marcador, esa edición
                  vive en el formulario de alta/edición. */}
              <div className="mt-3">
                <MapaProyecto latitud={proyecto.latitud} longitud={proyecto.longitud} soloLectura />
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="h6">Características</Card.Title>
              {proyecto.caracteristicas?.length ? (
                <div className="d-flex flex-wrap gap-2">
                  {proyecto.caracteristicas.map((caracteristica) => (
                    <span key={caracteristica.id} className="badge bg-light text-dark border">
                      {caracteristica.nombre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-secondary small mb-0">Sin características registradas.</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title className="h6 mb-0">Imágenes y documentos</Card.Title>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => inputArchivoRef.current?.click()}
                  disabled={subiendoImagen}
                >
                  {subiendoImagen ? 'Subiendo…' : '+ Agregar archivo'}
                </Button>
                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="d-none"
                  onChange={manejarSeleccionImagen}
                />
              </div>
              {proyecto.imagenes?.length ? (
                <div className="d-flex flex-wrap gap-2">
                  {proyecto.imagenes.map((url) => {
                    const esPdf = url.toLowerCase().endsWith('.pdf');
                    return (
                      <div key={url} style={{ position: 'relative' }}>
                        {esPdf ? (
                          <a
                            href={construirUrlArchivo(url)}
                            target="_blank"
                            rel="noreferrer"
                            className="d-flex flex-column align-items-center justify-content-center text-decoration-none"
                            style={{
                              width: 96,
                              height: 72,
                              borderRadius: 8,
                              background: 'var(--sicp-fondo)',
                              border: '1px solid var(--sicp-borde)',
                            }}
                          >
                            <Icono nombre="filePdf" tamano={22} className="text-danger" />
                            <span className="text-secondary" style={{ fontSize: 10, marginTop: 4 }}>PDF</span>
                          </a>
                        ) : (
                          <img
                            src={construirUrlArchivo(url)}
                            alt="Imagen del proyecto"
                            onClick={() => setImagenAmpliada(construirUrlArchivo(url))}
                            style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => manejarEliminarArchivo(url)}
                          aria-label="Eliminar archivo"
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
                <p className="text-secondary small mb-0">Todavía no hay imágenes ni documentos.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title className="h6">Bitácora</Card.Title>

              <Form onSubmit={manejarEnvioObservacion} className="mb-3">
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    maxLength={1000}
                    placeholder="Agregar una observación…"
                    value={textoObservacion}
                    onChange={(evento) => setTextoObservacion(evento.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline-secondary"
                    disabled={enviandoObservacion || !textoObservacion.trim()}
                  >
                    {enviandoObservacion ? 'Guardando…' : 'Agregar observación'}
                  </Button>
                </div>
              </Form>

              <ListaBitacora key={refrescoBitacora} idProyecto={id} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Visor de imagen ampliada: se cierra tocando fuera, con el botón de cierre, o
          con Escape (comportamiento propio de react-bootstrap Modal). */}
      <Modal show={Boolean(imagenAmpliada)} onHide={() => setImagenAmpliada(null)} centered size="lg">
        <Modal.Body className="p-0" style={{ position: 'relative' }}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setImagenAmpliada(null)}
            aria-label="Cerrar"
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
          >
            <Icono nombre="xmark" tamano={14} />
          </Button>
          <img
            src={imagenAmpliada}
            alt="Imagen del proyecto ampliada"
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

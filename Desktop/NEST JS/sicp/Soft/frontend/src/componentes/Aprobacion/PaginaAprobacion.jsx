import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import BitacoraFlotante from '../Bitacora/BitacoraFlotante';
import { CaracteristicasProyecto, DatosGeneralesProyecto, ImagenesProyecto } from '../comunes/DetalleProyecto';
import EtiquetasProyecto from '../comunes/EtiquetasProyecto';
import Icono from '../comunes/Icono';
import TituloTarjeta from '../comunes/TituloTarjeta';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import { enviarProyectoALicitacion, listarProyectos } from '../../servicios/serviciosProyectos';
import {
  eliminarDocumentoAprobacion,
  listarDocumentosAprobacion,
  subirDocumentoAprobacion,
} from '../../servicios/serviciosAprobacion';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { construirUrlArchivo } from '../../utilidades/archivos';
import ResumenFinanciamiento from '../comunes/ResumenFinanciamiento';
import TablaFuentesFinanciamiento from '../comunes/TablaFuentesFinanciamiento';

/**
 * Etapa 3 (intermedia entre Financiamiento y Licitación): por ahora no tiene datos
 * de negocio propios, solo permite consultar el proyecto, adjuntar archivos y
 * avanzarlo a Licitación — mismo layout de 2 columnas que PaginaFinanciamiento.jsx.
 */
export default function PaginaAprobacion() {
  const [idProyecto, setIdProyecto] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const inputArchivoRef = useRef(null);
  const [mostrarArchivosEtapa1, setMostrarArchivosEtapa1] = useState(false);
  const [mostrarArchivosEtapa2, setMostrarArchivosEtapa2] = useState(false);

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (idProyecto) cargarDocumentos();
    else setDocumentos([]);
  }, [idProyecto]);

  function cargarProyectos() {
    setCargandoProyectos(true);
    listarProyectos('aprobacion')
      .then(setProyectos)
      .finally(() => setCargandoProyectos(false));
  }

  function cargarDocumentos() {
    listarDocumentosAprobacion(idProyecto).then(setDocumentos);
  }

  async function manejarSeleccionDocumento(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSubiendoDocumento(true);
    try {
      await subirDocumentoAprobacion(idProyecto, archivo);
      cargarDocumentos();
    } finally {
      setSubiendoDocumento(false);
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }

  async function manejarEliminarDocumento(documento) {
    const confirmado = await confirmarEliminacion(
      'Se eliminará este documento de la etapa de Aprobación. Esta acción no se puede deshacer.',
    );
    if (!confirmado) return;
    await eliminarDocumentoAprobacion(documento.id);
    cargarDocumentos();
    mostrarExito('¡Eliminado!', 'El documento se eliminó correctamente.');
  }

  async function manejarEnvioALicitacion() {
    const confirmado = await confirmarEliminacion(
      `El proyecto "${proyectoSeleccionado.nombre}" pasará a la etapa de Licitación.`,
      '¿Enviar a Licitación?',
      'Enviar',
    );
    if (!confirmado) return;
    await enviarProyectoALicitacion(idProyecto);
    mostrarExito('¡Enviado!', 'El proyecto pasó a la etapa de Licitación.');
    setIdProyecto(null);
    cargarProyectos();
  }

  const proyectoSeleccionado = proyectos.find((proyecto) => proyecto.id === idProyecto);

  return (
    <div>
      <EncabezadoPagina
        icono="squareCheck"
        titulo={proyectoSeleccionado ? `Aprobación: ${proyectoSeleccionado.nombre}` : 'Aprobación'}
        descripcion="Etapa 3 — revisión y aprobación del proyecto antes de licitar."
        etiquetas={proyectoSeleccionado && <EtiquetasProyecto proyecto={proyectoSeleccionado} />}
        accion={
          idProyecto && (
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={() => setIdProyecto(null)}>
                <Icono nombre="arrowLeft" tamano={12} className="me-2" />
                Volver al listado
              </Button>
              <Button variant="primary" size="sm" onClick={manejarEnvioALicitacion}>
                <Icono nombre="folderOpen" tamano={14} className="me-2" />
                Enviar a Licitación
              </Button>
            </div>
          )
        }
      />

      {!idProyecto ? (
        cargandoProyectos ? (
          <Spinner animation="border" role="status" />
        ) : proyectos.length === 0 ? (
          <p className="text-secondary">Todavía no hay proyectos en la etapa de Aprobación.</p>
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

              {/* Botonera hacia el historial de solo lectura de etapas anteriores:
                  cada botón abre su propio modal en vez de ocupar espacio fijo. */}
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
              </div>

              <TablaFuentesFinanciamiento idProyecto={idProyecto} />

              <div className="bg-white p-3 rounded border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <TituloTarjeta icono="fileLines" className="mb-0">Archivos</TituloTarjeta>
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
                                alt="Documento de aprobación"
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
            </Col>
          </Row>

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
    </div>
  );
}

import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import SelectorProyecto from '../comunes/SelectorProyecto';
import ListaBitacora from '../Bitacora/ListaBitacora';
import { adjuntarDocumentoCierre, crearFinalizacion, obtenerFinalizacion } from '../../servicios/serviciosFinalizacion';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import { construirUrlArchivo } from '../../utilidades/archivos';

const VALORES_INICIALES = { fechaCierre: '', observacionesFinales: '' };

export default function PaginaFinalizacion() {
  const [idProyecto, setIdProyecto] = useState(null);
  const [finalizacion, setFinalizacion] = useState(null);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (idProyecto) cargarFinalizacion();
    else setFinalizacion(null);
  }, [idProyecto]);

  function cargarFinalizacion() {
    obtenerFinalizacion(idProyecto).then(setFinalizacion);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await crearFinalizacion({
        idProyecto,
        fechaCierre: datos.fechaCierre,
        observacionesFinales: datos.observacionesFinales || undefined,
      });
      cargarFinalizacion();
    } finally {
      setEnviando(false);
    }
  }

  async function manejarAdjuntarDocumento(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo || !finalizacion) return;
    await adjuntarDocumentoCierre(finalizacion.id, archivo);
    cargarFinalizacion();
  }

  return (
    <div>
      <EncabezadoPagina icono="circleCheck" titulo="Finalización" descripcion="Etapa 6 — cierre del proyecto." />

      <SelectorProyecto idProyectoSeleccionado={idProyecto} onSeleccionar={setIdProyecto} />

      {idProyecto && (
        <Row className="g-3">
          <Col lg={7}>
            {finalizacion ? (
              <Alert variant="success">
                Proyecto cerrado el {finalizacion.fechaCierre}.
                {finalizacion.observacionesFinales && <p className="mb-0 mt-2">{finalizacion.observacionesFinales}</p>}
                <Form.Group className="mt-3">
                  <Form.Label className="small">Documento de cierre</Form.Label>
                  {finalizacion.documentoCierre ? (
                    <div>
                      <a href={construirUrlArchivo(finalizacion.documentoCierre)} target="_blank" rel="noreferrer">
                        Ver documento
                      </a>
                    </div>
                  ) : (
                    <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={manejarAdjuntarDocumento} />
                  )}
                </Form.Group>
              </Alert>
            ) : (
              <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border">
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Label className="small">Fecha de cierre</Form.Label>
                    <Form.Control
                      type="date"
                      value={datos.fechaCierre}
                      onChange={(e) => setDatos({ ...datos, fechaCierre: e.target.value })}
                      required
                    />
                  </Col>
                  <Col md={8}>
                    <Form.Label className="small">Observaciones finales</Form.Label>
                    <Form.Control
                      value={datos.observacionesFinales}
                      onChange={(e) => setDatos({ ...datos, observacionesFinales: e.target.value })}
                    />
                  </Col>
                </Row>
                <Button type="submit" variant="primary" className="mt-3" disabled={enviando}>
                  Cerrar proyecto
                </Button>
              </Form>
            )}
          </Col>
          <Col lg={5}>
            <div className="bg-white p-3 rounded border">
              <h2 className="h6">Bitácora</h2>
              <ListaBitacora idProyecto={idProyecto} etapa="finalizacion" />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

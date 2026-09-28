import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SelectorProyecto from '../comunes/SelectorProyecto';
import ListaBitacora from '../Bitacora/ListaBitacora';
import { adjuntarDocumentoEstadoPago, crearEstadoPago, listarEstadosPago } from '../../servicios/serviciosObra';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import EtiquetasProyecto from '../comunes/EtiquetasProyecto';
import TituloTarjeta from '../comunes/TituloTarjeta';
import { construirUrlArchivo } from '../../utilidades/archivos';

const VALORES_INICIALES = { ito: '', numeroEstadoPago: '', monto: '', fecha: '', descripcion: '' };

export default function PaginaObra() {
  const [idProyecto, setIdProyecto] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [estadosPago, setEstadosPago] = useState([]);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (idProyecto) cargarEstadosPago();
    else setEstadosPago([]);
  }, [idProyecto]);

  function cargarEstadosPago() {
    listarEstadosPago(idProyecto).then(setEstadosPago);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await crearEstadoPago({
        idProyecto,
        ito: datos.ito,
        numeroEstadoPago: parseInt(datos.numeroEstadoPago, 10),
        monto: parseFloat(datos.monto),
        fecha: datos.fecha,
        descripcion: datos.descripcion || undefined,
      });
      setDatos(VALORES_INICIALES);
      cargarEstadosPago();
    } finally {
      setEnviando(false);
    }
  }

  async function manejarAdjuntarDocumento(idEstadoPago, evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await adjuntarDocumentoEstadoPago(idEstadoPago, archivo);
    cargarEstadosPago();
  }

  return (
    <div>
      <EncabezadoPagina
        icono="helmetSafety"
        titulo={proyectoSeleccionado ? `Desarrollo de obra: ${proyectoSeleccionado.nombre}` : 'Desarrollo de obra'}
        descripcion="Etapa 5 — estados de pago de la ejecución de la obra."
        etiquetas={proyectoSeleccionado && <EtiquetasProyecto proyecto={proyectoSeleccionado} />}
      />

      <SelectorProyecto
        idProyectoSeleccionado={idProyecto}
        onSeleccionar={(id, proyecto) => {
          setIdProyecto(id);
          setProyectoSeleccionado(proyecto);
        }}
      />

      {idProyecto && (
        <Row className="g-3">
          <Col lg={7}>
            <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border mb-3">
              <Row className="g-2">
                <Col md={4}>
                  <Form.Label className="small">ITO</Form.Label>
                  <Form.Control
                    value={datos.ito}
                    onChange={(e) => setDatos({ ...datos, ito: e.target.value })}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="small">N° estado</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={datos.numeroEstadoPago}
                    onChange={(e) => setDatos({ ...datos, numeroEstadoPago: e.target.value })}
                    required
                  />
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
                  <Form.Label className="small">Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={datos.fecha}
                    onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
                    required
                  />
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3" disabled={enviando}>
                Guardar estado de pago
              </Button>
            </Form>

            <div className="table-wrap">
              <table className="projects">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>ITO</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {estadosPago.map((estadoPago) => (
                    <tr className="proj-row" key={estadoPago.id}>
                      <td className="mono">{estadoPago.numeroEstadoPago}</td>
                      <td>{estadoPago.ito}</td>
                      <td className="mono">${Number(estadoPago.monto).toLocaleString('es-CL')}</td>
                      <td className="mono">{estadoPago.fecha}</td>
                      <td>
                        {estadoPago.documentoAdjunto ? (
                          <a href={construirUrlArchivo(estadoPago.documentoAdjunto)} target="_blank" rel="noreferrer">
                            Ver archivo
                          </a>
                        ) : (
                          <Form.Control
                            type="file"
                            size="sm"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(evento) => manejarAdjuntarDocumento(estadoPago.id, evento)}
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
              <ListaBitacora idProyecto={idProyecto} etapa="obra" />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

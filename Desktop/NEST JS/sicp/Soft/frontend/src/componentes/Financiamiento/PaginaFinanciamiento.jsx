import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SelectorProyecto from '../comunes/SelectorProyecto';
import ListaBitacora from '../Bitacora/ListaBitacora';
import { crearFinanciamiento, eliminarFinanciamiento, listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { nombreFuente: '', monto: '', observaciones: '' };

export default function PaginaFinanciamiento() {
  const [idProyecto, setIdProyecto] = useState(null);
  const [fuentes, setFuentes] = useState([]);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (idProyecto) cargarFuentes();
    else setFuentes([]);
  }, [idProyecto]);

  function cargarFuentes() {
    listarFinanciamiento(idProyecto).then(setFuentes);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await crearFinanciamiento({
        idProyecto,
        nombreFuente: datos.nombreFuente,
        monto: parseFloat(datos.monto),
        observaciones: datos.observaciones || undefined,
      });
      setDatos(VALORES_INICIALES);
      cargarFuentes();
    } finally {
      setEnviando(false);
    }
  }

  async function manejarEliminar(fuente) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará la fuente "${fuente.nombreFuente}" ($${Number(fuente.monto).toLocaleString('es-CL')}). Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarFinanciamiento(fuente.id);
    cargarFuentes();
    mostrarExito('¡Eliminado!', 'La fuente de financiamiento se eliminó correctamente.');
  }

  return (
    <div>
      <EncabezadoPagina
        icono="sackDollar"
        titulo="Financiamiento"
        descripcion="Etapa 2 — fuentes de financiamiento asociadas a un proyecto."
      />

      <SelectorProyecto idProyectoSeleccionado={idProyecto} onSeleccionar={setIdProyecto} />

      {idProyecto && (
        <Row className="g-3">
          <Col lg={7}>
            <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border mb-3">
              <Row className="g-2 align-items-end">
                <Col md={4}>
                  <Form.Label className="small">Fuente</Form.Label>
                  <Form.Control
                    value={datos.nombreFuente}
                    onChange={(e) => setDatos({ ...datos, nombreFuente: e.target.value })}
                    placeholder="Ej. FNDR"
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
                  <Form.Label className="small">Observaciones</Form.Label>
                  <Form.Control
                    value={datos.observaciones}
                    onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="primary" className="w-100" disabled={enviando}>
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
                        <div className="proj-name">{fuente.nombreFuente}</div>
                      </td>
                      <td className="mono">${Number(fuente.monto).toLocaleString('es-CL')}</td>
                      <td className="text-secondary">{fuente.observaciones}</td>
                      <td className="text-end">
                        <Button size="sm" variant="link" className="text-danger" onClick={() => manejarEliminar(fuente)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={5}>
            <div className="bg-white p-3 rounded border">
              <h2 className="h6">Bitácora</h2>
              <ListaBitacora idProyecto={idProyecto} etapa="financiamiento" />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

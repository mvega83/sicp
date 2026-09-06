import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearTipoFuenteFinanciamiento,
  actualizarTipoFuenteFinanciamiento,
  eliminarTipoFuenteFinanciamiento,
  listarTiposFuenteFinanciamiento,
} from '../../servicios/serviciosTipoFuenteFinanciamiento';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { nombre: '', procedencia: '', observaciones: '' };

export default function PaginaFuentesFinanciamiento() {
  const [tiposFuente, setTiposFuente] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEnEdicion, setTipoEnEdicion] = useState(null); // null = creando uno nuevo
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTiposFuente();
  }, []);

  function cargarTiposFuente() {
    setCargando(true);
    listarTiposFuenteFinanciamiento()
      .then(setTiposFuente)
      .catch(() => setError('No se pudo cargar el listado de fuentes de financiamiento.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setTipoEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(tipoFuente) {
    setTipoEnEdicion(tipoFuente);
    setDatos({
      nombre: tipoFuente.nombre,
      procedencia: tipoFuente.procedencia,
      observaciones: tipoFuente.observaciones ?? '',
    });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (tipoEnEdicion) {
        await actualizarTipoFuenteFinanciamiento(tipoEnEdicion.id, datos);
        mostrarToastActualizado(`"${datos.nombre}" se actualizó correctamente.`);
      } else {
        await crearTipoFuenteFinanciamiento(datos);
        mostrarToastCreado(`"${datos.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarTiposFuente();
    } catch {
      setError('No se pudo guardar la fuente de financiamiento. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(tipoFuente) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente "${tipoFuente.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarTipoFuenteFinanciamiento(tipoFuente.id);
    cargarTiposFuente();
    mostrarExito('¡Eliminada!', `"${tipoFuente.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="coins"
        titulo="Fuentes de financiamiento"
        descripcion="Configuración — catálogo de fuentes de financiamiento disponibles."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nueva fuente
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : tiposFuente.length === 0 ? (
        <p className="text-secondary">Todavía no hay fuentes de financiamiento. Crea la primera.</p>
      ) : (
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Procedencia</th>
                <th>Observaciones</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tiposFuente.map((tipoFuente) => (
                <tr className="proj-row" key={tipoFuente.id}>
                  <td>
                    <div className="proj-name">{tipoFuente.nombre}</div>
                  </td>
                  <td>
                    <span className="pill info">{tipoFuente.procedencia}</span>
                  </td>
                  <td className="text-secondary">{tipoFuente.observaciones ?? '—'}</td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(tipoFuente)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(tipoFuente)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={modalAbierto} onHide={() => setModalAbierto(false)} centered>
        <Form onSubmit={manejarEnvioFormulario}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">
              {tipoEnEdicion ? 'Editar fuente de financiamiento' : 'Nueva fuente de financiamiento'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small">Nombre</Form.Label>
                <Form.Control
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  placeholder="Ej. FNDR, Fondos municipales propios"
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Procedencia</Form.Label>
                <Form.Control
                  value={datos.procedencia}
                  onChange={(e) => setDatos({ ...datos, procedencia: e.target.value })}
                  placeholder="Ej. GORE, Ministerios, etc."
                  required
                />
              </Col>
              <Col md={12}>
                <Form.Label className="small">Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={datos.observaciones}
                  onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalAbierto(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

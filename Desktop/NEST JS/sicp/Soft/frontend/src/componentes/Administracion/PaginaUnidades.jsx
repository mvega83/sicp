import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearUnidad,
  actualizarUnidad,
  eliminarUnidad,
  listarUnidades,
} from '../../servicios/serviciosUnidades';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { nombre: '' };

export default function PaginaUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [unidadEnEdicion, setUnidadEnEdicion] = useState(null); // null = creando una nueva
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarUnidades();
  }, []);

  function cargarUnidades() {
    setCargando(true);
    listarUnidades()
      .then(setUnidades)
      .catch(() => setError('No se pudo cargar el listado de unidades.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setUnidadEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(unidad) {
    setUnidadEnEdicion(unidad);
    setDatos({ nombre: unidad.nombre });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (unidadEnEdicion) {
        await actualizarUnidad(unidadEnEdicion.id, datos);
        mostrarToastActualizado(`"${datos.nombre}" se actualizó correctamente.`);
      } else {
        await crearUnidad(datos);
        mostrarToastCreado(`"${datos.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarUnidades();
    } catch {
      setError('No se pudo guardar la unidad. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(unidad) {
    const activar = unidad.estado === -1;
    const confirmado = await confirmarEliminacion(
      activar
        ? `"${unidad.nombre}" volverá a estar disponible para asignar.`
        : `"${unidad.nombre}" dejará de estar disponible para asignar hasta que la reactives.`,
      activar ? '¿Reactivar unidad?' : '¿Dar de baja esta unidad?',
      activar ? 'Reactivar' : 'Dar de baja',
    );
    if (!confirmado) return;
    await actualizarUnidad(unidad.id, { estado: activar ? 1 : -1 });
    cargarUnidades();
    mostrarExito(activar ? '¡Reactivada!' : '¡Dada de baja!', `"${unidad.nombre}" se actualizó correctamente.`);
  }

  async function manejarEliminar(unidad) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente la unidad "${unidad.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarUnidad(unidad.id);
    cargarUnidades();
    mostrarExito('¡Eliminada!', `"${unidad.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="building"
        titulo="Unidades"
        descripcion="Administración — unidades municipales del sistema."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nueva unidad
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : unidades.length === 0 ? (
        <p className="text-secondary">Todavía no hay unidades. Crea la primera.</p>
      ) : (
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((unidad) => (
                <tr className="proj-row" key={unidad.id}>
                  <td>
                    <div className="proj-name">{unidad.nombre}</div>
                  </td>
                  <td>
                    <span className={`pill ${unidad.estado === 1 ? 'ok' : 'crit'}`}>
                      {unidad.estado === 1 ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td className="mono">
                    {new Date(unidad.fechaModificacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(unidad)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={unidad.estado === 1 ? 'outline-danger' : 'outline-secondary'}
                      className="me-2"
                      onClick={() => manejarCambioEstado(unidad)}
                    >
                      {unidad.estado === 1 ? 'Dar de baja' : 'Reactivar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(unidad)}>
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
              {unidadEnEdicion ? 'Editar unidad' : 'Nueva unidad'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => setDatos({ ...datos, nombre: evento.target.value })}
                placeholder="Ej. SECPLAN, Dirección de Obras, Tránsito"
                maxLength={250}
                required
              />
            </Form.Group>
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

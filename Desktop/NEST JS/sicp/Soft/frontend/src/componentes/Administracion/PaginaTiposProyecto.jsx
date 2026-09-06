import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearTipoProyecto,
  actualizarTipoProyecto,
  eliminarTipoProyecto,
  listarTiposProyecto,
} from '../../servicios/serviciosTiposProyecto';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { nombre: '' };

export default function PaginaTiposProyecto() {
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEnEdicion, setTipoEnEdicion] = useState(null);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTipos();
  }, []);

  function cargarTipos() {
    setCargando(true);
    listarTiposProyecto()
      .then(setTipos)
      .catch(() => setError('No se pudo cargar el listado de tipos de proyecto.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setTipoEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(tipo) {
    setTipoEnEdicion(tipo);
    setDatos({ nombre: tipo.nombre });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (tipoEnEdicion) {
        await actualizarTipoProyecto(tipoEnEdicion.id, datos);
        mostrarToastActualizado(`"${datos.nombre}" se actualizó correctamente.`);
      } else {
        await crearTipoProyecto(datos);
        mostrarToastCreado(`"${datos.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarTipos();
    } catch {
      setError('No se pudo guardar el tipo de proyecto. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(tipo) {
    const activar = tipo.estado === -1;
    const confirmado = await confirmarEliminacion(
      activar
        ? `"${tipo.nombre}" volverá a estar disponible para asignar.`
        : `"${tipo.nombre}" dejará de estar disponible para asignar hasta que lo reactives.`,
      activar ? '¿Reactivar tipo de proyecto?' : '¿Dar de baja este tipo de proyecto?',
      activar ? 'Reactivar' : 'Dar de baja',
    );
    if (!confirmado) return;
    await actualizarTipoProyecto(tipo.id, { estado: activar ? 1 : -1 });
    cargarTipos();
    mostrarExito(activar ? '¡Reactivado!' : '¡Dado de baja!', `"${tipo.nombre}" se actualizó correctamente.`);
  }

  async function manejarEliminar(tipo) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente el tipo de proyecto "${tipo.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarTipoProyecto(tipo.id);
    cargarTipos();
    mostrarExito('¡Eliminado!', `"${tipo.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="landmark"
        titulo="Tipos de proyecto"
        descripcion="Configuración — catálogo de tipos de proyecto disponibles para el banco de ideas (ej. Plaza, Sede social, Multicancha)."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nuevo tipo
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : tipos.length === 0 ? (
        <p className="text-secondary">Todavía no hay tipos de proyecto. Crea el primero.</p>
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
              {tipos.map((tipo) => (
                <tr className="proj-row" key={tipo.id}>
                  <td>
                    <div className="proj-name">{tipo.nombre}</div>
                  </td>
                  <td>
                    <span className={`pill ${tipo.estado === 1 ? 'ok' : 'crit'}`}>
                      {tipo.estado === 1 ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td className="mono">
                    {new Date(tipo.fechaModificacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(tipo)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={tipo.estado === 1 ? 'outline-danger' : 'outline-secondary'}
                      className="me-2"
                      onClick={() => manejarCambioEstado(tipo)}
                    >
                      {tipo.estado === 1 ? 'Dar de baja' : 'Reactivar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(tipo)}>
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
              {tipoEnEdicion ? 'Editar tipo de proyecto' : 'Nuevo tipo de proyecto'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => setDatos({ ...datos, nombre: evento.target.value })}
                placeholder="Ej. Plaza, Sede social, Multicancha"
                maxLength={150}
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

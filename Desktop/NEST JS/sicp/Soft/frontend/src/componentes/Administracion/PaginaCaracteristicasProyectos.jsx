import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearCaracteristicaProyecto,
  actualizarCaracteristicaProyecto,
  eliminarCaracteristicaProyecto,
  listarCaracteristicasProyectos,
} from '../../servicios/serviciosCaracteristicasProyectos';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { nombre: '' };

export default function PaginaCaracteristicasProyectos() {
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [caracteristicaEnEdicion, setCaracteristicaEnEdicion] = useState(null); // null = creando una nueva
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCaracteristicas();
  }, []);

  function cargarCaracteristicas() {
    setCargando(true);
    listarCaracteristicasProyectos()
      .then(setCaracteristicas)
      .catch(() => setError('No se pudo cargar el listado de características de proyectos.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setCaracteristicaEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(caracteristica) {
    setCaracteristicaEnEdicion(caracteristica);
    setDatos({ nombre: caracteristica.nombre });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (caracteristicaEnEdicion) {
        await actualizarCaracteristicaProyecto(caracteristicaEnEdicion.id, datos);
        mostrarToastActualizado(`"${datos.nombre}" se actualizó correctamente.`);
      } else {
        await crearCaracteristicaProyecto(datos);
        mostrarToastCreado(`"${datos.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarCaracteristicas();
    } catch {
      setError('No se pudo guardar la característica. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(caracteristica) {
    const activar = caracteristica.estado === -1;
    const confirmado = await confirmarEliminacion(
      activar
        ? `"${caracteristica.nombre}" volverá a estar disponible para asignar.`
        : `"${caracteristica.nombre}" dejará de estar disponible para asignar hasta que la reactives.`,
      activar ? '¿Reactivar característica?' : '¿Dar de baja esta característica?',
      activar ? 'Reactivar' : 'Dar de baja',
    );
    if (!confirmado) return;
    await actualizarCaracteristicaProyecto(caracteristica.id, { estado: activar ? 1 : -1 });
    cargarCaracteristicas();
    mostrarExito(activar ? '¡Reactivada!' : '¡Dada de baja!', `"${caracteristica.nombre}" se actualizó correctamente.`);
  }

  async function manejarEliminar(caracteristica) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente la característica "${caracteristica.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarCaracteristicaProyecto(caracteristica.id);
    cargarCaracteristicas();
    mostrarExito('¡Eliminada!', `"${caracteristica.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="tag"
        titulo="Características de proyectos"
        descripcion="Configuración — catálogo de características disponibles para los proyectos (ej. luminaria, cierre perimetral)."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nueva característica
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : caracteristicas.length === 0 ? (
        <p className="text-secondary">Todavía no hay características. Crea la primera.</p>
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
              {caracteristicas.map((caracteristica) => (
                <tr className="proj-row" key={caracteristica.id}>
                  <td>
                    <div className="proj-name">{caracteristica.nombre}</div>
                  </td>
                  <td>
                    <span className={`pill ${caracteristica.estado === 1 ? 'ok' : 'crit'}`}>
                      {caracteristica.estado === 1 ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td className="mono">
                    {new Date(caracteristica.fechaModificacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(caracteristica)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={caracteristica.estado === 1 ? 'outline-danger' : 'outline-secondary'}
                      className="me-2"
                      onClick={() => manejarCambioEstado(caracteristica)}
                    >
                      {caracteristica.estado === 1 ? 'Dar de baja' : 'Reactivar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(caracteristica)}>
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
              {caracteristicaEnEdicion ? 'Editar característica' : 'Nueva característica'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => setDatos({ ...datos, nombre: evento.target.value })}
                placeholder="Ej. Luminaria, Cierre perimetral"
                maxLength={100}
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

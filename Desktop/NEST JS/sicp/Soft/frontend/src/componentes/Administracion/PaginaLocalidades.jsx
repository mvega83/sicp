import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearLocalidad,
  actualizarLocalidad,
  eliminarLocalidad,
  listarLocalidades,
} from '../../servicios/serviciosLocalidades';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

// Se usa string vacío (no número) para que el <Form.Select> controlado muestre
// la opción "Seleccione..." hasta que el usuario elija algo. Recién al enviar el
// formulario se convierte a número, porque el backend espera enteros.
const VALORES_INICIALES = { nombre: '', zona: '', sector: '' };

// Mapeos locales número -> texto legible, para mostrar en la tabla.
const ETIQUETAS_ZONA = { 1: 'Urbana', 2: 'Rural' };
const ETIQUETAS_SECTOR = {
  1: 'Céntrico',
  2: 'Parte alta',
  3: 'El Portal',
  4: 'Fray Jorge',
  5: 'Puertas del Sol',
  6: 'Sector Limarí',
  7: 'Sector El Romeral',
  8: 'Sector fuera de Ovalle',
};

export default function PaginaLocalidades() {
  const [localidades, setLocalidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [localidadEnEdicion, setLocalidadEnEdicion] = useState(null); // null = creando una nueva
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarLocalidades();
  }, []);

  function cargarLocalidades() {
    setCargando(true);
    listarLocalidades()
      .then(setLocalidades)
      .catch(() => setError('No se pudo cargar el listado de localidades.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setLocalidadEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(localidad) {
    setLocalidadEnEdicion(localidad);
    // Los selects trabajan con strings; los valores que llegan del backend son números.
    setDatos({
      nombre: localidad.nombre,
      zona: String(localidad.zona),
      sector: String(localidad.sector),
    });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const payload = {
        nombre: datos.nombre,
        zona: Number(datos.zona),
        sector: Number(datos.sector),
      };
      if (localidadEnEdicion) {
        await actualizarLocalidad(localidadEnEdicion.id, payload);
        mostrarToastActualizado(`"${datos.nombre}" se actualizó correctamente.`);
      } else {
        await crearLocalidad(payload);
        mostrarToastCreado(`"${datos.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarLocalidades();
    } catch {
      setError('No se pudo guardar la localidad. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(localidad) {
    const activar = localidad.estado === -1;
    const confirmado = await confirmarEliminacion(
      activar
        ? `"${localidad.nombre}" volverá a estar disponible para asignar.`
        : `"${localidad.nombre}" dejará de estar disponible para asignar hasta que la reactives.`,
      activar ? '¿Reactivar localidad?' : '¿Dar de baja esta localidad?',
      activar ? 'Reactivar' : 'Dar de baja',
    );
    if (!confirmado) return;
    await actualizarLocalidad(localidad.id, { estado: activar ? 1 : -1 });
    cargarLocalidades();
    mostrarExito(activar ? '¡Reactivada!' : '¡Dada de baja!', `"${localidad.nombre}" se actualizó correctamente.`);
  }

  async function manejarEliminar(localidad) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente la localidad "${localidad.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarLocalidad(localidad.id);
    cargarLocalidades();
    mostrarExito('¡Eliminada!', `"${localidad.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="locationDot"
        titulo="Localidades"
        descripcion="Configuración — catálogo de localidades y sectores de la comuna usados en los proyectos."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nueva localidad
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : localidades.length === 0 ? (
        <p className="text-secondary">Todavía no hay localidades. Crea la primera.</p>
      ) : (
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Zona</th>
                <th>Sector</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {localidades.map((localidad) => (
                <tr className="proj-row" key={localidad.id}>
                  <td>
                    <div className="proj-name">{localidad.nombre}</div>
                  </td>
                  <td>{ETIQUETAS_ZONA[localidad.zona]}</td>
                  <td>{ETIQUETAS_SECTOR[localidad.sector]}</td>
                  <td>
                    <span className={`pill ${localidad.estado === 1 ? 'ok' : 'crit'}`}>
                      {localidad.estado === 1 ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td className="mono">
                    {new Date(localidad.fechaModificacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(localidad)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={localidad.estado === 1 ? 'outline-danger' : 'outline-secondary'}
                      className="me-2"
                      onClick={() => manejarCambioEstado(localidad)}
                    >
                      {localidad.estado === 1 ? 'Dar de baja' : 'Reactivar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(localidad)}>
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
              {localidadEnEdicion ? 'Editar localidad' : 'Nueva localidad'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => setDatos({ ...datos, nombre: evento.target.value })}
                placeholder="Ej. Villa Ovalle, El Palqui"
                maxLength={150}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Zona</Form.Label>
              <Form.Select
                value={datos.zona}
                onChange={(evento) => setDatos({ ...datos, zona: evento.target.value })}
                required
              >
                <option value="" disabled>
                  Seleccione una zona...
                </option>
                <option value="1">Urbana</option>
                <option value="2">Rural</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Sector</Form.Label>
              <Form.Select
                value={datos.sector}
                onChange={(evento) => setDatos({ ...datos, sector: evento.target.value })}
                required
              >
                <option value="" disabled>
                  Seleccione un sector...
                </option>
                <option value="1">Céntrico</option>
                <option value="2">Parte alta</option>
                <option value="3">El Portal</option>
                <option value="4">Fray Jorge</option>
                <option value="5">Puertas del Sol</option>
                <option value="6">Sector Limarí</option>
                <option value="7">Sector El Romeral</option>
                <option value="8">Sector fuera de Ovalle</option>
              </Form.Select>
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

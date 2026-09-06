import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
  crearTipoUsuario,
  actualizarTipoUsuario,
  eliminarTipoUsuario,
  listarTiposUsuario,
} from '../../servicios/serviciosTipoUsuario';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = { codigo: '', nombre: '' };

export default function PaginaTiposUsuario() {
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEnEdicion, setTipoEnEdicion] = useState(null); // null = creando uno nuevo
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTiposUsuario();
  }, []);

  function cargarTiposUsuario() {
    setCargando(true);
    listarTiposUsuario()
      .then(setTiposUsuario)
      .catch(() => setError('No se pudo cargar el listado de tipos de usuario.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setTipoEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(tipoUsuario) {
    setTipoEnEdicion(tipoUsuario);
    setDatos({ codigo: tipoUsuario.codigo, nombre: tipoUsuario.nombre });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const cuerpo = { codigo: parseInt(datos.codigo, 10), nombre: datos.nombre };
      if (tipoEnEdicion) {
        await actualizarTipoUsuario(tipoEnEdicion.id, cuerpo);
        mostrarToastActualizado(`"${cuerpo.nombre}" se actualizó correctamente.`);
      } else {
        await crearTipoUsuario(cuerpo);
        mostrarToastCreado(`"${cuerpo.nombre}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarTiposUsuario();
    } catch {
      setError('No se pudo guardar el tipo de usuario. Revisa los datos (el código debe ser de 0 a 99).');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(tipoUsuario) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará el tipo de usuario "${tipoUsuario.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    await eliminarTipoUsuario(tipoUsuario.id);
    cargarTiposUsuario();
    mostrarExito('¡Eliminado!', `"${tipoUsuario.nombre}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="users"
        titulo="Tipos de usuario"
        descripcion="Administración — catálogo de tipos de usuario del sistema."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nuevo tipo de usuario
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : tiposUsuario.length === 0 ? (
        <p className="text-secondary">Todavía no hay tipos de usuario. Crea el primero.</p>
      ) : (
        // Mismo formato que la tabla "Proyectos" del artefacto de referencia
        // (design/ui-general.html): contenedor .table-wrap + tabla .projects, en
        // vez del <Table> genérico de react-bootstrap.
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tiposUsuario.map((tipoUsuario) => (
                <tr className="proj-row" key={tipoUsuario.id}>
                  <td>
                    <span className="pill info mono">{String(tipoUsuario.codigo).padStart(2, '0')}</span>
                  </td>
                  <td>
                    <div className="proj-name">{tipoUsuario.nombre}</div>
                  </td>
                  <td className="mono">
                    {new Date(tipoUsuario.fechaActualizacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(tipoUsuario)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(tipoUsuario)}>
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
              {tipoEnEdicion ? 'Editar tipo de usuario' : 'Nuevo tipo de usuario'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Código (hasta 2 dígitos)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={99}
                value={datos.codigo}
                onChange={(evento) => setDatos({ ...datos, codigo: evento.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => setDatos({ ...datos, nombre: evento.target.value })}
                placeholder="Ej. Administrador, Funcionario, ITO"
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

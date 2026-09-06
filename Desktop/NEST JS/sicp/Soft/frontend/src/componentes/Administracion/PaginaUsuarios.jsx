import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { crearUsuario, actualizarUsuario, eliminarUsuario, listarUsuarios } from '../../servicios/serviciosUsuarios';
import { listarTiposUsuario } from '../../servicios/serviciosTipoUsuario';
import { listarUnidades } from '../../servicios/serviciosUnidades';
import { confirmarEliminacion, mostrarExito } from '../../utilidades/alertas';
import { mostrarToastActualizado, mostrarToastCreado } from '../../utilidades/toast';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = {
  nombres: '',
  apellidos: '',
  correo: '',
  contrasena: '',
  run: '',
  idTipoUsuario: '',
  idUnidad: '',
  direccion: '',
  telefono: '',
};

// El backend devuelve los errores de validación como un arreglo de mensajes
// (class-validator); acá se normaliza a un solo texto para mostrarlo en el Alert.
function extraerMensajeError(error, mensajePorDefecto) {
  const mensaje = error?.response?.data?.message;
  if (Array.isArray(mensaje)) return mensaje.join(' ');
  return mensaje ?? mensajePorDefecto;
}

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null); // null = creando uno nuevo
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  function cargarDatos() {
    setCargando(true);
    Promise.all([listarUsuarios(), listarTiposUsuario(), listarUnidades()])
      .then(([listaUsuarios, listaTipos, listaUnidades]) => {
        setUsuarios(listaUsuarios);
        setTiposUsuario(listaTipos);
        setUnidades(listaUnidades);
      })
      .catch(() => setError('No se pudo cargar el listado de usuarios.'))
      .finally(() => setCargando(false));
  }

  function abrirModalCrear() {
    setUsuarioEnEdicion(null);
    setDatos(VALORES_INICIALES);
    setModalAbierto(true);
  }

  function abrirModalEditar(usuario) {
    setUsuarioEnEdicion(usuario);
    setDatos({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      contrasena: '', // en blanco = no cambiarla (ver manejarEnvioFormulario)
      run: usuario.run ?? '',
      idTipoUsuario: usuario.idTipoUsuario ?? '',
      idUnidad: usuario.idUnidad ?? '',
      direccion: usuario.direccion ?? '',
      telefono: usuario.telefono ?? '',
    });
    setModalAbierto(true);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const cuerpo = { ...datos };
      // Al editar, si se deja la contraseña en blanco, no se manda el campo — así el
      // service del backend conserva el hash actual en vez de reemplazarlo.
      if (usuarioEnEdicion && !cuerpo.contrasena) {
        delete cuerpo.contrasena;
      }
      if (usuarioEnEdicion) {
        await actualizarUsuario(usuarioEnEdicion.id, cuerpo);
        mostrarToastActualizado(`"${cuerpo.nombres} ${cuerpo.apellidos}" se actualizó correctamente.`);
      } else {
        await crearUsuario(cuerpo);
        mostrarToastCreado(`"${cuerpo.nombres} ${cuerpo.apellidos}" se creó correctamente.`);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      setError(extraerMensajeError(error, 'No se pudo guardar el usuario. Revisa los datos.'));
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(usuario) {
    const activar = usuario.estado === -1;
    const confirmado = await confirmarEliminacion(
      activar
        ? `"${usuario.nombres} ${usuario.apellidos}" volverá a poder iniciar sesión.`
        : `"${usuario.nombres} ${usuario.apellidos}" no podrá iniciar sesión hasta que lo reactives.`,
      activar ? '¿Reactivar usuario?' : '¿Dar de baja este usuario?',
      activar ? 'Reactivar' : 'Dar de baja',
    );
    if (!confirmado) return;
    await actualizarUsuario(usuario.id, { estado: activar ? 1 : -1 });
    cargarDatos();
    mostrarExito(activar ? '¡Reactivado!' : '¡Dado de baja!', `"${usuario.nombres} ${usuario.apellidos}" se actualizó correctamente.`);
  }

  // A diferencia de "Dar de baja" (reversible, bloquea el login sin perder el
  // registro), esto borra la fila para siempre — la bitácora sigue mostrando su
  // nombre igual (queda guardado como texto, no como referencia al usuario).
  async function manejarEliminar(usuario) {
    const confirmado = await confirmarEliminacion(
      `Se eliminará permanentemente a "${usuario.nombres} ${usuario.apellidos}". Esta acción no se puede deshacer — si solo quieres bloquearle el acceso, usa "Dar de baja" en vez de esto.`,
    );
    if (!confirmado) return;
    await eliminarUsuario(usuario.id);
    cargarDatos();
    mostrarExito('¡Eliminado!', `"${usuario.nombres} ${usuario.apellidos}" se eliminó correctamente.`);
  }

  return (
    <div>
      <EncabezadoPagina
        icono="idCard"
        titulo="Usuarios"
        descripcion="Administración — funcionarios con acceso al sistema."
        accion={
          <Button variant="primary" onClick={abrirModalCrear}>
            + Nuevo usuario
          </Button>
        }
      />

      {error && !modalAbierto && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : usuarios.length === 0 ? (
        <p className="text-secondary">Todavía no hay usuarios. Crea el primero.</p>
      ) : (
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>RUN</th>
                <th>Unidad</th>
                <th>Tipo de usuario</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr className="proj-row" key={usuario.id}>
                  <td>
                    <div className="proj-name">{usuario.nombres} {usuario.apellidos}</div>
                  </td>
                  <td>{usuario.correo}</td>
                  <td className="mono">{usuario.run ?? '—'}</td>
                  <td>{usuario.unidad?.nombre ?? '—'}</td>
                  <td>{usuario.tipoUsuario?.nombre ?? '—'}</td>
                  <td>
                    <span className={`pill ${usuario.estado === 1 ? 'ok' : 'crit'}`}>
                      {usuario.estado === 1 ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => abrirModalEditar(usuario)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={usuario.estado === 1 ? 'outline-warning' : 'outline-success'}
                      className="me-2"
                      onClick={() => manejarCambioEstado(usuario)}
                    >
                      {usuario.estado === 1 ? 'Dar de baja' : 'Reactivar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => manejarEliminar(usuario)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={modalAbierto} onHide={() => setModalAbierto(false)} centered size="lg">
        <Form onSubmit={manejarEnvioFormulario}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">
              {usuarioEnEdicion ? 'Editar usuario' : 'Nuevo usuario'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small">Nombres</Form.Label>
                <Form.Control
                  value={datos.nombres}
                  onChange={(e) => setDatos({ ...datos, nombres: e.target.value })}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Apellidos</Form.Label>
                <Form.Control
                  value={datos.apellidos}
                  onChange={(e) => setDatos({ ...datos, apellidos: e.target.value })}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={datos.correo}
                  onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">RUN</Form.Label>
                <Form.Control
                  value={datos.run}
                  onChange={(e) => setDatos({ ...datos, run: e.target.value })}
                  placeholder="12345678-9"
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">
                  {usuarioEnEdicion ? 'Nueva contraseña (dejar en blanco para no cambiarla)' : 'Contraseña'}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={datos.contrasena}
                  onChange={(e) => setDatos({ ...datos, contrasena: e.target.value })}
                  minLength={8}
                  required={!usuarioEnEdicion}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Tipo de usuario</Form.Label>
                <Form.Select
                  value={datos.idTipoUsuario}
                  onChange={(e) => setDatos({ ...datos, idTipoUsuario: e.target.value })}
                  required
                >
                  <option value="" disabled>Selecciona uno…</option>
                  {tiposUsuario.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small">Unidad</Form.Label>
                <Form.Select
                  value={datos.idUnidad}
                  onChange={(e) => setDatos({ ...datos, idUnidad: e.target.value })}
                  required
                >
                  <option value="" disabled>Selecciona una…</option>
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small">Teléfono</Form.Label>
                <Form.Control
                  value={datos.telefono}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Dirección</Form.Label>
                <Form.Control
                  value={datos.direccion}
                  onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
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

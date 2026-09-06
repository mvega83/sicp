import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { actualizarProyecto, crearProyecto, obtenerProyecto } from '../../servicios/serviciosProyectos';
import { listarTiposProyecto } from '../../servicios/serviciosTiposProyecto';
import { listarLocalidades } from '../../servicios/serviciosLocalidades';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

const VALORES_INICIALES = {
  nombre: '',
  idTipoProyecto: '',
  idLocalidad: '',
  comuna: '',
  direccion: '',
  latitud: '',
  longitud: '',
};

export default function FormularioProyecto() {
  const navegar = useNavigate();
  // Si la ruta trae :id (/proyectos/:id/editar) estamos editando; si no, es alta nueva.
  const { id } = useParams();
  const modoEdicion = Boolean(id);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  // En modo edición hay que traer los datos actuales del proyecto antes de mostrar
  // el formulario; en modo creación no hay nada que cargar.
  const [cargando, setCargando] = useState(modoEdicion);
  // Catálogos para los selects de tipo de proyecto y localidad. Se cargan aparte
  // y sin bloquear el spinner de edición: si demoran un instante, los selects
  // simplemente aparecen vacíos hasta que lleguen.
  const [tiposProyecto, setTiposProyecto] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    if (!modoEdicion) return;
    obtenerProyecto(id).then((proyecto) => {
      setDatos({
        nombre: proyecto.nombre,
        idTipoProyecto: proyecto.idTipoProyecto,
        idLocalidad: proyecto.idLocalidad,
        comuna: proyecto.comuna,
        direccion: proyecto.direccion,
        latitud: proyecto.latitud,
        longitud: proyecto.longitud,
      });
      setCaracteristicas(proyecto.caracteristicas ?? []);
      setCargando(false);
    });
  }, [id, modoEdicion]);

  // Carga los catálogos de tipo de proyecto y localidad siempre al montar,
  // tanto en modo creación como en modo edición.
  useEffect(() => {
    Promise.all([listarTiposProyecto(), listarLocalidades()]).then(([tipos, locs]) => {
      setTiposProyecto(tipos);
      setLocalidades(locs);
    });
  }, []);

  function actualizarCampo(campo, valor) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function agregarCaracteristica() {
    const texto = nuevaCaracteristica.trim();
    if (!texto) return;
    setCaracteristicas((anteriores) => [...anteriores, texto]);
    setNuevaCaracteristica('');
  }

  function quitarCaracteristica(indice) {
    setCaracteristicas((anteriores) => anteriores.filter((_, i) => i !== indice));
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    const payload = {
      ...datos,
      latitud: parseFloat(datos.latitud),
      longitud: parseFloat(datos.longitud),
      caracteristicas,
    };
    try {
      if (modoEdicion) {
        // Ya se conoce el id por la URL, no hace falta esperar el id de la respuesta.
        await actualizarProyecto(id, payload);
        navegar(`/proyectos/${id}`);
      } else {
        const proyecto = await crearProyecto(payload);
        navegar(`/proyectos/${proyecto.id}`);
      }
    } catch {
      setError(
        modoEdicion
          ? 'No se pudo actualizar el proyecto. Revisa los datos e intenta de nuevo.'
          : 'No se pudo crear el proyecto. Revisa los datos e intenta de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <Spinner animation="border" role="status" />;

  return (
    <div>
      <EncabezadoPagina
        icono={modoEdicion ? 'pen' : 'plus'}
        titulo={modoEdicion ? 'Editar idea' : 'Nueva idea'}
        descripcion={
          modoEdicion
            ? 'Actualiza los datos generales del proyecto en banco de ideas.'
            : 'Registra un proyecto nuevo en el banco de ideas, con su ubicación y características.'
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={manejarEnvioFormulario} className="bg-white p-4 rounded border">
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Nombre del proyecto</Form.Label>
              <Form.Control
                value={datos.nombre}
                onChange={(evento) => actualizarCampo('nombre', evento.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Tipo de proyecto</Form.Label>
              <Form.Select
                value={datos.idTipoProyecto}
                onChange={(evento) => actualizarCampo('idTipoProyecto', evento.target.value)}
                required
              >
                <option value="" disabled>Selecciona uno…</option>
                {tiposProyecto.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Comuna</Form.Label>
              <Form.Control
                value={datos.comuna}
                onChange={(evento) => actualizarCampo('comuna', evento.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Localidad</Form.Label>
              <Form.Select
                value={datos.idLocalidad}
                onChange={(evento) => actualizarCampo('idLocalidad', evento.target.value)}
                required
              >
                <option value="" disabled>Selecciona una…</option>
                {localidades.map((localidad) => (
                  <option key={localidad.id} value={localidad.id}>{localidad.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                value={datos.direccion}
                onChange={(evento) => actualizarCampo('direccion', evento.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Latitud</Form.Label>
              <Form.Control
                type="number"
                step="0.000001"
                value={datos.latitud}
                onChange={(evento) => actualizarCampo('latitud', evento.target.value)}
                placeholder="-30.126840"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Longitud</Form.Label>
              <Form.Control
                type="number"
                step="0.000001"
                value={datos.longitud}
                onChange={(evento) => actualizarCampo('longitud', evento.target.value)}
                placeholder="-70.499120"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Características del proyecto</Form.Label>
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              value={nuevaCaracteristica}
              onChange={(evento) => setNuevaCaracteristica(evento.target.value)}
              placeholder="Ej. Luminaria perimetral"
              onKeyDown={(evento) => {
                if (evento.key === 'Enter') {
                  evento.preventDefault();
                  agregarCaracteristica();
                }
              }}
            />
            <Button variant="outline-secondary" onClick={agregarCaracteristica} type="button">
              Agregar
            </Button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {caracteristicas.map((caracteristica, indice) => (
              <span key={indice} className="badge bg-light text-dark border d-flex align-items-center gap-2">
                {caracteristica}
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => quitarCaracteristica(indice)}
                  aria-label="Quitar"
                />
              </span>
            ))}
          </div>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={enviando}>
          {enviando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Guardar proyecto'}
        </Button>
      </Form>
    </div>
  );
}

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
import { listarCaracteristicasProyectos } from '../../servicios/serviciosCaracteristicasProyectos';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import MapaProyecto from '../comunes/MapaProyecto';

// Por ahora todos los proyectos son de la comuna de Ovalle, así que el campo no se
// muestra en el formulario y se envía siempre con este valor fijo.
const COMUNA_FIJA = 'Ovalle';

const VALORES_INICIALES = {
  nombre: '',
  idTipoProyecto: '',
  idLocalidad: '',
  comuna: COMUNA_FIJA,
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
  // Las características ahora vienen de un catálogo (no texto libre), así que el
  // formulario solo guarda los ids seleccionados.
  const [idsCaracteristicas, setIdsCaracteristicas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  // En modo edición hay que traer los datos actuales del proyecto antes de mostrar
  // el formulario; en modo creación no hay nada que cargar.
  const [cargando, setCargando] = useState(modoEdicion);
  // Catálogos para los selects de tipo de proyecto y localidad, y para las
  // características. Se cargan aparte y sin bloquear el spinner de edición: si
  // demoran un instante, aparecen vacíos hasta que lleguen.
  const [tiposProyecto, setTiposProyecto] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [catalogoCaracteristicas, setCatalogoCaracteristicas] = useState([]);

  useEffect(() => {
    if (!modoEdicion) return;
    obtenerProyecto(id).then((proyecto) => {
      setDatos({
        nombre: proyecto.nombre,
        idTipoProyecto: proyecto.idTipoProyecto,
        idLocalidad: proyecto.idLocalidad,
        comuna: COMUNA_FIJA,
        direccion: proyecto.direccion,
        latitud: proyecto.latitud,
        longitud: proyecto.longitud,
      });
      // El backend entrega las características como objetos del catálogo; el
      // formulario solo necesita sus ids para marcar los checkboxes correspondientes.
      setIdsCaracteristicas((proyecto.caracteristicas ?? []).map((c) => c.id));
      setCargando(false);
    });
  }, [id, modoEdicion]);

  // Carga los catálogos de tipo de proyecto, localidad y características siempre
  // al montar, tanto en modo creación como en modo edición.
  useEffect(() => {
    Promise.all([listarTiposProyecto(), listarLocalidades(), listarCaracteristicasProyectos()]).then(
      ([tipos, locs, caracteristicas]) => {
        setTiposProyecto(tipos);
        setLocalidades(locs);
        setCatalogoCaracteristicas(caracteristicas);
      },
    );
  }, []);

  function actualizarCampo(campo, valor) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // Marca/desmarca una característica del catálogo agregando o quitando su id
  // del arreglo de seleccionadas.
  function alternarCaracteristica(idCaracteristica, marcada) {
    setIdsCaracteristicas((anteriores) =>
      marcada
        ? [...anteriores, idCaracteristica]
        : anteriores.filter((id) => id !== idCaracteristica),
    );
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    const payload = {
      ...datos,
      latitud: parseFloat(datos.latitud),
      longitud: parseFloat(datos.longitud),
      idsCaracteristicas,
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
          <Col md={4}>
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
          <Col md={8}>
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
                placeholder="-30.600600"
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
                placeholder="-71.199700"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Ubicación en el mapa</Form.Label>
          <p className="text-secondary small mb-2">
            Haz clic en el mapa para fijar la ubicación; también puedes escribir las
            coordenadas manualmente en los campos de arriba.
          </p>
          <MapaProyecto
            latitud={datos.latitud}
            longitud={datos.longitud}
            onCambiarUbicacion={(lat, lng) => {
              actualizarCampo('latitud', lat);
              actualizarCampo('longitud', lng);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Características del proyecto</Form.Label>
          {catalogoCaracteristicas.length ? (
            <Row>
              {catalogoCaracteristicas.map((caracteristica) => (
                <Col key={caracteristica.id} md={4} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`caracteristica-${caracteristica.id}`}
                    label={caracteristica.nombre}
                    checked={idsCaracteristicas.includes(caracteristica.id)}
                    onChange={(evento) =>
                      alternarCaracteristica(caracteristica.id, evento.target.checked)
                    }
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-secondary small mb-0">No hay características configuradas todavía.</p>
          )}
        </Form.Group>

        <Button type="submit" variant="primary" disabled={enviando}>
          {enviando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Guardar proyecto'}
        </Button>
      </Form>
    </div>
  );
}

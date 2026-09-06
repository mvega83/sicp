import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../../contexto/ContextoAuth';
import { obtenerProveedoresDisponibles, urlLoginGoogle, urlLoginMicrosoft } from '../../servicios/serviciosAuth';

export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [proveedores, setProveedores] = useState({ desarrollo: false, google: false, microsoft: false });

  useEffect(() => {
    // El backend decide qué botones de login mostrar, según qué credenciales OAuth
    // tenga configuradas — así nunca se muestra un botón que en realidad no funciona.
    obtenerProveedoresDisponibles()
      .then(setProveedores)
      .catch(() => {
        setError('No se pudo conectar con el backend. ¿Está corriendo en ' + import.meta.env.VITE_API_URL + '?');
      });
  }, []);

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(nombres, apellidos, correo);
      navegar('/');
    } catch {
      setError('No se pudo iniciar sesión. Revisa los datos e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-login">
      <Card className="pagina-login__tarjeta">
        <Card.Body>
          <h1 className="h4 fw-bold mb-1">SICP</h1>
          <p className="text-secondary mb-4">Sistema Gestión de Proyectos</p>

          {error && <Alert variant="danger">{error}</Alert>}

          {proveedores.google && (
            <Button href={urlLoginGoogle()} variant="outline-dark" className="w-100 mb-2">
              Iniciar sesión con Google
            </Button>
          )}
          {proveedores.microsoft && (
            <Button href={urlLoginMicrosoft()} variant="outline-dark" className="w-100 mb-2">
              Iniciar sesión con Microsoft
            </Button>
          )}
          {(proveedores.google || proveedores.microsoft) && proveedores.desarrollo && (
            <div className="text-center text-secondary small my-3">o, para pruebas</div>
          )}

          {proveedores.desarrollo && (
            <Form onSubmit={manejarEnvioFormulario}>
              <Form.Group className="mb-3">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  value={nombres}
                  onChange={(evento) => setNombres(evento.target.value)}
                  placeholder="Marco"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  value={apellidos}
                  onChange={(evento) => setApellidos(evento.target.value)}
                  placeholder="Vega"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                  placeholder="nombre@municipalidad.cl"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" disabled={enviando}>
                {enviando ? 'Ingresando…' : 'Ingresar (login de desarrollo)'}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

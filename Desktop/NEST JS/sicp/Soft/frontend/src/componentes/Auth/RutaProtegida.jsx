import { Navigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from '../../contexto/ContextoAuth';

// Envuelve las rutas que solo puede ver alguien con sesión iniciada. Si todavía se
// está confirmando si el token guardado es válido, muestra un spinner en vez de
// mandar al login de inmediato (evita un parpadeo hacia /login en cada recarga).
export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../contexto/ContextoAuth';
import Icono from '../comunes/Icono';

// Ej: "Marco Vega" -> "MV". Se usa para el círculo del avatar cuando el usuario no
// tiene una foto de perfil (ninguno la tiene todavía, por eso siempre se muestran
// las iniciales).
function obtenerIniciales(nombre) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
}

export default function BarraSuperior({ onAbrirMenu }) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <Navbar bg="white" className="barra-superior border-bottom" expand="md">
      <Container fluid>
        <div className="d-flex align-items-center gap-2">
          {/* Solo visible bajo el breakpoint md — en escritorio el menú lateral ya
              está siempre visible, así que este botón no tiene nada que hacer ahí. */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-md-none barra-superior__boton-menu"
            onClick={onAbrirMenu}
            aria-label="Abrir menú"
          >
            <Icono nombre="bars" tamano={15} />
          </Button>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold mb-0">
            <span className="barra-superior__escudo">
              <Icono nombre="landmark" tamano={15} />
            </span>
            SICP
          </Navbar.Brand>
        </div>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {usuario && (
            <>
              <span className="barra-superior__avatar">
                {obtenerIniciales(`${usuario.nombres} ${usuario.apellidos}`)}
              </span>
              <span className="text-secondary small d-none d-sm-inline">
                {usuario.nombres} {usuario.apellidos}
              </span>
              <Button variant="outline-secondary" size="sm" onClick={cerrarSesion} className="d-flex align-items-center gap-2">
                <Icono nombre="rightFromBracket" tamano={13} />
                <span className="d-none d-sm-inline">Cerrar sesión</span>
              </Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

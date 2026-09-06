import { Link, NavLink } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Icono from '../comunes/Icono';

// Cada etapa del ciclo de vida del proyecto, en el mismo orden que design/ui-general.html.
const ETAPAS = [
  { ruta: '/proyectos', etiqueta: 'Banco de ideas', icono: 'lightbulb' },
  { ruta: '/financiamiento', etiqueta: 'Financiamiento', icono: 'sackDollar' },
  { ruta: '/licitacion', etiqueta: 'Licitación', icono: 'folderOpen' },
  { ruta: '/proveedor', etiqueta: 'Proveedor', icono: 'handshake' },
  { ruta: '/obra', etiqueta: 'Desarrollo de obra', icono: 'helmetSafety' },
  { ruta: '/finalizacion', etiqueta: 'Finalización', icono: 'circleCheck' },
];

// Sección aparte del ciclo del proyecto: gestión de las personas con acceso al
// sistema. Se puede seguir agregando ítems acá (permisos, roles, etc.) sin tocar el
// resto del menú.
const ITEMS_ADMINISTRACION = [
  { ruta: '/administracion/usuarios', etiqueta: 'Usuarios', icono: 'idCard' },
];

// Catálogos base que alimentan a los formularios del sistema (a diferencia de
// Administración, acá no hay personas, solo listas de valores reutilizables).
const ITEMS_CONFIGURACION = [
  { ruta: '/administracion/tipos-usuario', etiqueta: 'Tipos de usuario', icono: 'users' },
  { ruta: '/administracion/unidades', etiqueta: 'Unidades', icono: 'building' },
  { ruta: '/administracion/fuentes-financiamiento', etiqueta: 'Fuentes de financiamiento', icono: 'coins' },
  { ruta: '/administracion/caracteristicas-proyectos', etiqueta: 'Características de proyectos', icono: 'tag' },
  { ruta: '/administracion/tipos-proyecto', etiqueta: 'Tipos de proyecto', icono: 'landmark' },
  { ruta: '/administracion/localidades', etiqueta: 'Localidades', icono: 'locationDot' },
];

/**
 * `abierto`/`onCerrar` solo importan en pantallas angostas: ahí el menú es un panel
 * que se desliza desde la izquierda (ver .barra-lateral en index.css). En escritorio
 * el CSS ignora estas props y el menú queda siempre visible, como antes.
 */
export default function BarraLateral({ abierto = false, onCerrar = () => {} }) {
  return (
    <>
      {/* Fondo oscuro detrás del panel móvil — al tocarlo se cierra el menú. El CSS
          lo oculta por completo en escritorio, sin importar el valor de "abierto". */}
      {abierto && <div className="barra-lateral__fondo" onClick={onCerrar} />}

      <nav className={'barra-lateral' + (abierto ? ' barra-lateral--abierta' : '')}>
        <div className="barra-lateral__cierre d-md-none">
          <Button variant="outline-secondary" size="sm" onClick={onCerrar} aria-label="Cerrar menú">
            <Icono nombre="xmark" tamano={14} />
          </Button>
        </div>

        <Button
          as={Link}
          to="/proyectos/nuevo"
          className="barra-lateral__boton-nuevo d-flex align-items-center justify-content-center gap-2"
        >
          <Icono nombre="plus" tamano={13} />
          Nuevo proyecto
        </Button>

        <Nav className="flex-column mb-3" variant="pills">
          <Nav.Item>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                'nav-link barra-lateral__enlace' + (isActive ? ' active' : '')
              }
            >
              <Icono nombre="tableCells" tamano={15} className="barra-lateral__icono" />
              Inicio
            </NavLink>
          </Nav.Item>
        </Nav>

        <div className="barra-lateral__grupo-titulo">Ciclo del proyecto</div>
        <Nav className="flex-column" variant="pills">
          {ETAPAS.map((etapa) => (
            <Nav.Item key={etapa.ruta}>
              <NavLink
                to={etapa.ruta}
                className={({ isActive }) =>
                  'nav-link barra-lateral__enlace' + (isActive ? ' active' : '')
                }
              >
                <Icono nombre={etapa.icono} tamano={15} className="barra-lateral__icono" />
                {etapa.etiqueta}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>

        <div className="barra-lateral__grupo-titulo barra-lateral__grupo-titulo--separado">
          Administración
        </div>
        <Nav className="flex-column" variant="pills">
          {ITEMS_ADMINISTRACION.map((item) => (
            <Nav.Item key={item.ruta}>
              <NavLink
                to={item.ruta}
                className={({ isActive }) =>
                  'nav-link barra-lateral__enlace' + (isActive ? ' active' : '')
                }
              >
                <Icono nombre={item.icono} tamano={15} className="barra-lateral__icono" />
                {item.etiqueta}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>

        <div className="barra-lateral__grupo-titulo barra-lateral__grupo-titulo--separado">
          Configuración
        </div>
        <Nav className="flex-column" variant="pills">
          {ITEMS_CONFIGURACION.map((item) => (
            <Nav.Item key={item.ruta}>
              <NavLink
                to={item.ruta}
                className={({ isActive }) =>
                  'nav-link barra-lateral__enlace' + (isActive ? ' active' : '')
                }
              >
                <Icono nombre={item.icono} tamano={15} className="barra-lateral__icono" />
                {item.etiqueta}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </nav>
    </>
  );
}

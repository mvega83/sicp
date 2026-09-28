import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { listarProyectos } from '../../servicios/serviciosProyectos';
import { listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { useAuth } from '../../contexto/ContextoAuth';
import Icono from '../comunes/Icono';
import { ORDEN_ETAPAS, obtenerEstadoEtapa } from '../../utilidades/etapas';

function calcularResumen(proyectos) {
  return {
    total: proyectos.length,
    activos: proyectos.filter((p) => p.etapaActual !== 'finalizacion').length,
    bancoIdeas: proyectos.filter((p) => p.etapaActual === 'banco_ideas').length,
    licitacion: proyectos.filter((p) => p.etapaActual === 'licitacion').length,
    obra: proyectos.filter((p) => p.etapaActual === 'obra').length,
    finalizados: proyectos.filter((p) => p.etapaActual === 'finalizacion').length,
  };
}

// Suma el financiamiento real de todos los proyectos. Se pide en paralelo
// (Promise.all) para no ir proyecto por proyecto en serie.
async function calcularMontoComprometido(proyectos) {
  const listas = await Promise.all(proyectos.map((p) => listarFinanciamiento(p.id)));
  return listas.flat().reduce((total, fuente) => total + Number(fuente.monto), 0);
}

function formatearCLP(monto) {
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`;
  if (monto >= 1_000) return `$${(monto / 1_000).toFixed(0)}K`;
  return `$${monto}`;
}

export default function PaginaInicio() {
  const { usuario } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [montoComprometido, setMontoComprometido] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarProyectos()
      .then(async (lista) => {
        setProyectos(lista);
        if (lista.length > 0) {
          setMontoComprometido(await calcularMontoComprometido(lista));
        }
      })
      .finally(() => setCargando(false));
  }, []);

  const resumen = calcularResumen(proyectos);

  if (cargando) {
    return <Spinner animation="border" role="status" />;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Icono nombre="tableCells" tamano={22} />
            <h1 className="mb-0">Bienvenido, {usuario?.nombres}</h1>
          </div>
          <p className="page-sub">
            Este es el resumen de los proyectos municipales — desde el banco de ideas hasta la finalización de la obra.
          </p>
        </div>
        <div className="date-chip">
          <Icono nombre="calendarDays" tamano={14} />
          Hoy · {new Date().toLocaleDateString('es-CL')}
        </div>
      </div>

      <section className="block">
        <div className="block-head">
          <h2>Resumen</h2>
          <span className="hint">Actualizado {new Date().toLocaleString('es-CL')}</span>
        </div>

        <div className="hero-row">
          <div className="hero-card">
            <div className="hero-widget">
              <span className="hw-icon">
                <Icono nombre="locationDot" tamano={16} />
              </span>
              <div>
                <div className="hw-value">{resumen.activos}</div>
                <div className="hw-label">Proyectos activos</div>
              </div>
            </div>
            <svg className="hero-illustration" viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
              <circle cx="335" cy="45" r="26" fill="rgba(255,214,120,0.75)" />
              <g stroke="rgba(255,214,120,0.75)" strokeWidth="3" strokeLinecap="round">
                <path d="M335 5v10" /><path d="M335 75v10" /><path d="M295 45h10" /><path d="M365 45h10" />
                <path d="M307 17l7 7" /><path d="M356 66l7 7" /><path d="M363 17l-7 7" /><path d="M314 66l-7 7" />
              </g>
              <path d="M0 220V150c30-14 60-14 90 0v70Z" fill="rgba(255,255,255,0.30)" />
              <path d="M70 220V110c34-16 68-16 102 0v110Z" fill="rgba(255,255,255,0.6)" />
              <g fill="rgba(75,73,172,0.3)">
                <rect x="88" y="128" width="14" height="14" rx="2" /><rect x="112" y="128" width="14" height="14" rx="2" />
                <rect x="88" y="154" width="14" height="14" rx="2" />
                <rect x="88" y="180" width="14" height="14" rx="2" /><rect x="112" y="180" width="14" height="14" rx="2" />
              </g>
              <g fill="rgba(255,214,120,0.85)">
                <rect x="112" y="154" width="14" height="14" rx="2" />
              </g>
              <path d="M160 220V95c40-18 80-18 120 0v125Z" fill="rgba(255,255,255,0.9)" />
              <g fill="rgba(75,73,172,0.24)">
                <rect x="182" y="112" width="16" height="16" rx="2" /><rect x="238" y="112" width="16" height="16" rx="2" />
                <rect x="182" y="140" width="16" height="16" rx="2" /><rect x="210" y="140" width="16" height="16" rx="2" />
                <rect x="210" y="168" width="16" height="16" rx="2" /><rect x="238" y="168" width="16" height="16" rx="2" />
              </g>
              <g fill="rgba(255,214,120,0.85)">
                <rect x="210" y="112" width="16" height="16" rx="2" /><rect x="238" y="140" width="16" height="16" rx="2" /><rect x="182" y="168" width="16" height="16" rx="2" />
              </g>
              <path d="M264 220V130c30-14 60-14 90 0v90Z" fill="rgba(255,255,255,0.45)" />
              <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M300 220V70" />
                <path d="M300 70h85" />
                <path d="M300 96l-22 14" />
                <path d="M385 70v14" />
              </g>
              <path d="M385 84c9 0 9 14 0 14s-9-14 0-14Z" fill="#F3797E" />
              <ellipse cx="18" cy="200" rx="20" ry="17" fill="rgba(167,222,168,0.8)" />
              <ellipse cx="2" cy="209" rx="15" ry="13" fill="rgba(167,222,168,0.65)" />
              <rect x="14" y="209" width="7" height="10" fill="rgba(255,255,255,0.55)" />
              <g stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round">
                <path d="M120 205c8-10 16-10 24 0" /><path d="M120 205v15" />
              </g>
            </svg>
          </div>

          <div className="hero-stats">
            <div className="stat-tile solid c1">
              <Icono nombre="tableCells" tamano={46} className="card-icon" />
              <span className="label">Proyectos activos</span>
              <span className="value">{resumen.activos}</span>
              <span className="delta ok">
                <Icono nombre="arrowUp" tamano={12} />
                de {resumen.total} en total
              </span>
            </div>
            <div className="stat-tile solid c2">
              <Icono nombre="lightbulb" tamano={46} className="card-icon" />
              <span className="label">En banco de ideas</span>
              <span className="value">{resumen.bancoIdeas}</span>
              <span className="delta">sin financiamiento</span>
            </div>
            <div className="stat-tile solid c3">
              <Icono nombre="folderOpen" tamano={46} className="card-icon" />
              <span className="label">En licitación</span>
              <span className="value">{resumen.licitacion}</span>
              <span className="delta warn">
                <Icono nombre="triangleExclamation" tamano={12} />
                revisar plazos
              </span>
            </div>
            <div className="stat-tile solid c4">
              <Icono nombre="helmetSafety" tamano={46} className="card-icon" />
              <span className="label">En ejecución de obra</span>
              <span className="value">{resumen.obra}</span>
              <span className="delta">con avance registrado</span>
            </div>
          </div>
        </div>

        <div className="stat-row-secundaria">
          <div className="stat-tile solid c2">
            <Icono nombre="circleCheck" tamano={46} className="card-icon" />
            <span className="label">Finalizados</span>
            <span className="value">{resumen.finalizados}</span>
            <span className="delta ok">de {resumen.total} proyectos</span>
          </div>
          <div className="stat-tile solid c1">
            <Icono nombre="sackDollar" tamano={46} className="card-icon" />
            <span className="label">Monto comprometido</span>
            <span className="value mono">{formatearCLP(montoComprometido)}</span>
            <span className="delta">CLP, acumulado</span>
          </div>
        </div>
      </section>

      <section className="block" id="tabla-inicio">
        <div className="block-head">
          <h2>Proyectos</h2>
          <span className="hint">Cada punto representa una etapa — el punto lleno marca dónde está el proyecto hoy</span>
        </div>

        {proyectos.length === 0 ? (
          <p className="text-secondary">Todavía no hay proyectos. Crea el primero con "Nuevo proyecto".</p>
        ) : (
          <div className="table-wrap">
            <table className="projects">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Tipo y localidad</th>
                  <th>Etapa</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => {
                  const indiceEtapa = ORDEN_ETAPAS.indexOf(proyecto.etapaActual);
                  const estado = obtenerEstadoEtapa(proyecto.etapaActual);
                  return (
                    <tr className="proj-row" key={proyecto.id}>
                      <td>
                        <Link to={`/proyectos/${proyecto.id}`} className="text-decoration-none">
                          <div className="proj-name">{proyecto.nombre}</div>
                        </Link>
                        {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {proyecto.tipoProyecto?.nombre && (
                            <span className="pill tipo">{proyecto.tipoProyecto.nombre}</span>
                          )}
                          {proyecto.localidad?.nombre && (
                            <span className="pill localidad">{proyecto.localidad.nombre}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="stepper-cell">
                          <div className="stepper-mini">
                            {ORDEN_ETAPAS.map((etapa, indice) => (
                              <span
                                key={etapa}
                                className={
                                  'dot' +
                                  (indice < indiceEtapa ? ' done' : '') +
                                  (indice === indiceEtapa ? ' current' : '')
                                }
                              />
                            ))}
                          </div>
                          <span className="stepper-frac">{indiceEtapa + 1}/{ORDEN_ETAPAS.length}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${estado.tipo}`}>{estado.texto}</span>
                      </td>
                      <td className="mono">{new Date(proyecto.fechaActualizacion).toLocaleDateString('es-CL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

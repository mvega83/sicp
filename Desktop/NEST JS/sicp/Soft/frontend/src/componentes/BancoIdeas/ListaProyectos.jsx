import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { listarProyectos } from '../../servicios/serviciosProyectos';
import { obtenerEstadoEtapa } from '../../utilidades/etapas';
import EncabezadoPagina from '../comunes/EncabezadoPagina';

export default function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProyectos();
  }, []);

  function cargarProyectos() {
    setCargando(true);
    listarProyectos()
      .then(setProyectos)
      .finally(() => setCargando(false));
  }

  return (
    <div>
      <EncabezadoPagina
        icono="lightbulb"
        titulo="Banco de ideas"
        descripcion="Proyectos municipales, desde la idea hasta la ejecución."
        accion={
          <Button as={Link} to="/proyectos/nuevo" variant="primary">
            + Nueva idea
          </Button>
        }
      />

      {cargando ? (
        <Spinner animation="border" role="status" />
      ) : proyectos.length === 0 ? (
        <p className="text-secondary">Todavía no hay proyectos. Crea el primero con "Nueva idea".</p>
      ) : (
        // Mismo formato que la tabla "Proyectos" del artefacto de referencia
        // (design/ui-general.html): contenedor .table-wrap + tabla .projects.
        <div className="table-wrap">
          <table className="projects">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Tipo y localidad</th>
                <th>Etapa</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => {
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
    </div>
  );
}

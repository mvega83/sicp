import { useEffect, useState } from 'react';
import { listarBitacora } from '../../servicios/serviciosBitacora';

// Componente reutilizable: cualquier pantalla de cualquier etapa puede mostrar la
// bitácora de un proyecto pasando su id (y, opcionalmente, filtrando por etapa).
export default function ListaBitacora({ idProyecto, etapa }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!idProyecto) return;
    setCargando(true);
    listarBitacora(idProyecto, etapa)
      .then(setEventos)
      .finally(() => setCargando(false));
  }, [idProyecto, etapa]);

  if (cargando) return <p className="text-secondary small">Cargando bitácora…</p>;
  if (eventos.length === 0) return <p className="text-secondary small">Todavía no hay eventos registrados.</p>;

  return (
    <ul className="list-unstyled m-0">
      {eventos.map((evento) => (
        <li key={evento.id} className="mb-3 border-start border-2 ps-3">
          <div className="text-secondary small">
            {new Date(evento.fecha).toLocaleString('es-CL')} · {evento.usuario}
          </div>
          <div>{evento.descripcion}</div>
        </li>
      ))}
    </ul>
  );
}

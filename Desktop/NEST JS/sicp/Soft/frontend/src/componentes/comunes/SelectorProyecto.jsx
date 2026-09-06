import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { listarProyectos } from '../../servicios/serviciosProyectos';

// Las etapas 2 a 6 no tienen una pantalla por proyecto todavía (ver README de
// próximos pasos) — en vez de eso, cada pantalla de etapa empieza eligiendo a qué
// proyecto se le va a agregar el registro, con este selector reutilizable.
export default function SelectorProyecto({ idProyectoSeleccionado, onSeleccionar }) {
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    listarProyectos().then(setProyectos);
  }, []);

  return (
    <Form.Group className="selector-proyecto mb-4">
      <Form.Label>Proyecto</Form.Label>
      <Form.Select
        value={idProyectoSeleccionado ?? ''}
        onChange={(evento) => onSeleccionar(evento.target.value || null)}
      >
        <option value="">Selecciona un proyecto…</option>
        {proyectos.map((proyecto) => (
          <option key={proyecto.id} value={proyecto.id}>
            {proyecto.nombre} — {proyecto.comuna}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}

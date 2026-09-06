import Icono from './Icono';

/**
 * Encabezado reutilizable de pantalla: ícono representativo del mismo tamaño que
 * el título, seguido del título, y siempre con una descripción corta debajo. Se
 * usa en todas las pantallas para no repetir esta estructura en cada una.
 *
 * `accion` es opcional: un botón o chip que se muestra a la derecha (ej. el botón
 * "+ Nueva idea" en Banco de ideas, o el chip de fecha en Inicio).
 */
export default function EncabezadoPagina({ icono, titulo, descripcion, accion }) {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
      <div>
        <div className="d-flex align-items-center gap-2">
          <Icono nombre={icono} tamano={24} />
          <h1 className="h4 fw-bold mb-0">{titulo}</h1>
        </div>
        {descripcion && <p className="text-secondary mb-0 mt-1">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}

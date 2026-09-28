import Icono from './Icono';

/**
 * Encabezado reutilizable de pantalla: ícono representativo del mismo tamaño que
 * el título, seguido del título, y siempre con una descripción corta debajo. Se
 * usa en todas las pantallas para no repetir esta estructura en cada una.
 *
 * `accion` es opcional: un botón o chip que se muestra a la derecha (ej. el botón
 * "+ Nueva idea" en Banco de ideas, o el chip de fecha en Inicio).
 *
 * `etiquetas` es opcional: una fila de "pills" (ej. tipo/localidad/comuna del
 * proyecto seleccionado) debajo de la descripción — para no repetir el nombre del
 * proyecto ni sus etiquetas más abajo en la pantalla, ya que el título ya lo
 * incluye ("Etapa: Nombre del proyecto").
 */
export default function EncabezadoPagina({ icono, titulo, descripcion, etiquetas, accion }) {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
      <div>
        <div className="d-flex align-items-center gap-2">
          <Icono nombre={icono} tamano={24} />
          <h1 className="h4 fw-bold mb-0">{titulo}</h1>
        </div>
        {descripcion && <p className="text-secondary mb-0 mt-1">{descripcion}</p>}
        {etiquetas && <div className="d-flex flex-wrap gap-1 mt-2">{etiquetas}</div>}
      </div>
      {accion}
    </div>
  );
}

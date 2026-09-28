/**
 * Pills de tipo/localidad/comuna de un proyecto (ej. "Sede Social", "El Portal",
 * "Ovalle"), reutilizables como `etiquetas` de EncabezadoPagina en cada pantalla
 * de etapa — así no hace falta repetir el nombre del proyecto ni sus etiquetas más
 * abajo en la pantalla, ya que el título ya dice "Etapa: Nombre del proyecto".
 */
export default function EtiquetasProyecto({ proyecto }) {
  if (!proyecto) return null;
  return (
    <>
      {proyecto.tipoProyecto?.nombre && <span className="pill tipo">{proyecto.tipoProyecto.nombre}</span>}
      {proyecto.localidad?.nombre && <span className="pill localidad">{proyecto.localidad.nombre}</span>}
      {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
    </>
  );
}

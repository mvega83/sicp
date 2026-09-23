import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Icono from './Icono';
import MapaProyecto from './MapaProyecto';
import { construirUrlArchivo } from '../../utilidades/archivos';

/**
 * Vista de solo lectura del detalle de un proyecto (datos generales + mapa,
 * características e imágenes), para que las etapas 2 a 6 puedan mostrar con qué
 * proyecto están trabajando sin duplicar la ficha editable de Banco de Ideas
 * (esa vive en BancoIdeas/FichaProyecto.jsx y sí permite editar/subir archivos).
 */
export default function DetalleProyecto({ proyecto }) {
  if (!proyecto) return null;

  return (
    <div className="mb-3">
      <h2 className="h6 mb-2">{proyecto.nombre}</h2>
      <div className="d-flex flex-wrap gap-1 mb-3">
        {proyecto.tipoProyecto?.nombre && <span className="pill tipo">{proyecto.tipoProyecto.nombre}</span>}
        {proyecto.localidad?.nombre && <span className="pill localidad">{proyecto.localidad.nombre}</span>}
        {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="h6">Datos generales</Card.Title>
          <Row className="g-3 small">
            <Col md={6}>
              <div className="text-secondary">Dirección</div>
              <div>{proyecto.direccion}</div>
            </Col>
            <Col md={6}>
              <div className="text-secondary">Localidad</div>
              <div>{proyecto.localidad?.nombre}</div>
            </Col>
            <Col md={3}>
              <div className="text-secondary">Latitud</div>
              <div>{proyecto.latitud}</div>
            </Col>
            <Col md={3}>
              <div className="text-secondary">Longitud</div>
              <div>{proyecto.longitud}</div>
            </Col>
          </Row>
          <div className="mt-3">
            <MapaProyecto latitud={proyecto.latitud} longitud={proyecto.longitud} soloLectura />
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="h6">Características</Card.Title>
          {proyecto.caracteristicas?.length ? (
            <div className="d-flex flex-wrap gap-2">
              {proyecto.caracteristicas.map((caracteristica) => (
                <span key={caracteristica.id} className="badge bg-light text-dark border">
                  {caracteristica.nombre}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-secondary small mb-0">Sin características registradas.</p>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title className="h6 mb-2">Imágenes y documentos</Card.Title>
          {proyecto.imagenes?.length ? (
            <div className="d-flex flex-wrap gap-2">
              {proyecto.imagenes.map((url) => {
                const esPdf = url.toLowerCase().endsWith('.pdf');
                return (
                  // Se abre en una pestaña nueva (sin visor con zoom ni botón de
                  // borrar, a diferencia de la ficha editable): acá solo es consulta.
                  <a
                    key={url}
                    href={construirUrlArchivo(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex flex-column align-items-center justify-content-center text-decoration-none"
                    style={{
                      width: 96,
                      height: 72,
                      borderRadius: 8,
                      background: 'var(--sicp-fondo)',
                      border: '1px solid var(--sicp-borde)',
                      overflow: 'hidden',
                    }}
                  >
                    {esPdf ? (
                      <>
                        <Icono nombre="filePdf" tamano={22} className="text-danger" />
                        <span className="text-secondary" style={{ fontSize: 10, marginTop: 4 }}>PDF</span>
                      </>
                    ) : (
                      <img
                        src={construirUrlArchivo(url)}
                        alt="Imagen del proyecto"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-secondary small mb-0">Todavía no hay imágenes ni documentos.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

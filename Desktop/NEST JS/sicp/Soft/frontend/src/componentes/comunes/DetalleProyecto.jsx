import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Icono from './Icono';
import MapaProyecto from './MapaProyecto';
import TituloTarjeta from './TituloTarjeta';
import { listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { construirUrlArchivo } from '../../utilidades/archivos';

/**
 * Piezas de solo lectura del detalle de un proyecto, exportadas por separado (no
 * solo como el bloque completo `DetalleProyecto`) para poder recomponerlas en
 * layouts propios de cada etapa — ej. Financiamiento reutiliza el encabezado y
 * "Datos generales"/"Características" en su columna izquierda, con el modelo de
 * 2 columnas de la ficha de Banco de Ideas (BancoIdeas/FichaProyecto.jsx), pero
 * reemplaza "Imágenes y documentos" por su propio contenido en la derecha.
 */

export function EncabezadoProyecto({ proyecto }) {
  return (
    <div className="mb-3">
      <h2 className="h6 mb-2">{proyecto.nombre}</h2>
      <div className="d-flex flex-wrap gap-1">
        {proyecto.tipoProyecto?.nombre && <span className="pill tipo">{proyecto.tipoProyecto.nombre}</span>}
        {proyecto.localidad?.nombre && <span className="pill localidad">{proyecto.localidad.nombre}</span>}
        {proyecto.comuna && <span className="pill comuna">{proyecto.comuna}</span>}
      </div>
    </div>
  );
}

export function DatosGeneralesProyecto({ proyecto }) {
  // "Valor del proyecto" = suma de todos los montos de fuentes de financiamiento
  // ya registradas. null mientras carga; se calcula acá (no llega como prop) para
  // que la tarjeta lo muestre en cualquier pantalla que la use, sin que cada
  // página padre tenga que cargar las fuentes por su cuenta.
  const [valorProyecto, setValorProyecto] = useState(null);

  useEffect(() => {
    listarFinanciamiento(proyecto.id).then((fuentes) => {
      const total = fuentes.reduce((suma, fuente) => suma + Number(fuente.monto), 0);
      setValorProyecto(total);
    });
  }, [proyecto.id]);

  return (
    <Card className="mb-3">
      <Card.Body>
        <TituloTarjeta icono="locationDot" className="mb-2">Datos generales</TituloTarjeta>
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
          <Col md={6}>
            <div className="text-secondary">Valor del proyecto</div>
            <div className="fw-bold mono" style={{ color: 'var(--sicp-acento)' }}>
              {valorProyecto === null ? '—' : `$${valorProyecto.toLocaleString('es-CL')}`}
            </div>
          </Col>
        </Row>
        <div className="mt-3">
          <MapaProyecto latitud={proyecto.latitud} longitud={proyecto.longitud} soloLectura />
        </div>
      </Card.Body>
    </Card>
  );
}

export function CaracteristicasProyecto({ proyecto }) {
  return (
    <Card>
      <Card.Body>
        <TituloTarjeta icono="tag" className="mb-2">Características</TituloTarjeta>
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
  );
}

/** `sinTarjeta`: omite el borde/fondo de Card — para usarlo dentro de un modal, que ya trae su propio marco. */
export function ImagenesProyecto({ proyecto, titulo = 'Imágenes y documentos', sinTarjeta = false }) {
  const contenido = (
    <>
      {titulo && <TituloTarjeta icono="image" className="mb-2">{titulo}</TituloTarjeta>}
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
    </>
  );

  if (sinTarjeta) return contenido;

  return (
    <Card>
      <Card.Body>{contenido}</Card.Body>
    </Card>
  );
}

/** Bloque completo (encabezado + datos generales + características + imágenes) en una sola columna. */
export default function DetalleProyecto({ proyecto }) {
  if (!proyecto) return null;

  return (
    <div className="mb-3">
      <EncabezadoProyecto proyecto={proyecto} />
      <DatosGeneralesProyecto proyecto={proyecto} />
      <div className="mb-3">
        <CaracteristicasProyecto proyecto={proyecto} />
      </div>
      <ImagenesProyecto proyecto={proyecto} />
    </div>
  );
}

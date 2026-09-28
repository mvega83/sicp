import { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Icono from './Icono';
import TituloTarjeta from './TituloTarjeta';
import { listarDecretosFinanciamiento, listarFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { construirUrlArchivo } from '../../utilidades/archivos';

/**
 * Grilla de solo lectura de las fuentes de financiamiento de un proyecto, visible
 * directamente en la pantalla (no dentro de un modal) — a diferencia del modal
 * "Archivo Financiamiento", que solo muestra los documentos generales de esa
 * etapa. Una tarjeta por fuente (monto destacado + nombre debajo); al presionarla
 * se abre el modal con los decretos/archivos de esa fuente.
 */
export default function TablaFuentesFinanciamiento({ idProyecto }) {
  const [fuentes, setFuentes] = useState([]);
  const [fuenteDecretos, setFuenteDecretos] = useState(null);
  const [decretos, setDecretos] = useState([]);

  useEffect(() => {
    if (!idProyecto) return;
    listarFinanciamiento(idProyecto).then(setFuentes);
  }, [idProyecto]);

  function abrirDecretos(fuente) {
    setFuenteDecretos(fuente);
    listarDecretosFinanciamiento(fuente.id).then(setDecretos);
  }

  if (!idProyecto) return null;

  return (
    <div className="mb-3">
      <TituloTarjeta icono="sackDollar" className="mb-2">Fuentes de financiamiento</TituloTarjeta>

      {fuentes.length ? (
        <Row className="g-2">
          {fuentes.map((fuente) => (
            <Col xs={6} key={fuente.id}>
              <button
                type="button"
                onClick={() => abrirDecretos(fuente)}
                className="text-start w-100 h-100 card-fuente"
                style={{ cursor: 'pointer' }}
              >
                <div className="proj-name mb-1">{fuente.tipoFuenteFinanciamiento?.nombre}</div>

                <div className="h4 fw-bold mono mb-0" style={{ color: 'var(--sicp-acento)' }}>
                  ${Number(fuente.monto).toLocaleString('es-CL')}
                </div>

                {fuente.tipoFuenteFinanciamiento?.procedencia && (
                  <div className="text-secondary small mt-1">{fuente.tipoFuenteFinanciamiento.procedencia}</div>
                )}
                {fuente.observaciones && (
                  <div className="text-secondary small mt-1">{fuente.observaciones}</div>
                )}

                <div className="card-fuente__pie d-flex align-items-center gap-2 text-secondary small">
                  <Icono nombre="fileLines" tamano={13} />
                  Ver decretos
                </div>
              </button>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-secondary small mb-0">No se registraron fuentes de financiamiento.</p>
      )}

      <Modal show={Boolean(fuenteDecretos)} onHide={() => setFuenteDecretos(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="div">
            <TituloTarjeta icono="fileLines" as="span">
              Decretos — {fuenteDecretos?.tipoFuenteFinanciamiento?.nombre}
            </TituloTarjeta>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {decretos.length ? (
            <ul className="list-unstyled m-0">
              {decretos.map((decreto) => (
                <li key={decreto.id} className="border-top pt-2 mt-2">
                  <a href={construirUrlArchivo(decreto.urlDecreto)} target="_blank" rel="noreferrer">
                    <Icono nombre="filePdf" tamano={14} className="me-2 text-danger" />
                    {new Date(`${decreto.fechaDecreto}T00:00:00`).toLocaleDateString('es-CL')}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary small mb-0">Todavía no hay decretos para esta fuente.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

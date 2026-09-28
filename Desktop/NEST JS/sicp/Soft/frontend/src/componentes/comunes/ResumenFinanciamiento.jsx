import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Icono from './Icono';
import TituloTarjeta from './TituloTarjeta';
import { listarDocumentosFinanciamiento } from '../../servicios/serviciosFinanciamiento';
import { construirUrlArchivo } from '../../utilidades/archivos';

/**
 * Modal de solo lectura con los documentos generales de la etapa de Financiamiento
 * (no las fuentes ni sus decretos — esas se muestran aparte, siempre visibles en
 * la pantalla, ver TablaFuentesFinanciamiento.jsx). Se carga solo mientras el
 * modal está abierto (`show`), no apenas se selecciona el proyecto.
 */
export default function ResumenFinanciamiento({ idProyecto, show, onHide }) {
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    if (!idProyecto || !show) return;
    listarDocumentosFinanciamiento(idProyecto).then(setDocumentos);
  }, [idProyecto, show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title as="div">
          <TituloTarjeta icono="sackDollar" as="span">Archivo Financiamiento</TituloTarjeta>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {documentos.length ? (
          <div className="d-flex flex-wrap gap-2">
            {documentos.map((documento) => {
              const esPdf = documento.url.toLowerCase().endsWith('.pdf');
              return (
                <a
                  key={documento.id}
                  href={construirUrlArchivo(documento.url)}
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
                      src={construirUrlArchivo(documento.url)}
                      alt="Documento de financiamiento"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-secondary small mb-0">No hay documentos de financiamiento.</p>
        )}
      </Modal.Body>
    </Modal>
  );
}

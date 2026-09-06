import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SelectorProyecto from '../comunes/SelectorProyecto';
import ListaBitacora from '../Bitacora/ListaBitacora';
import { adjuntarBoletaGarantia, crearProveedor, listarProveedores } from '../../servicios/serviciosProveedor';
import EncabezadoPagina from '../comunes/EncabezadoPagina';
import { construirUrlArchivo } from '../../utilidades/archivos';

const VALORES_INICIALES = {
  nombreEmpresa: '',
  rutEmpresa: '',
  banco: '',
  tipoCuenta: '',
  numeroCuentaBancaria: '',
};

export default function PaginaProveedor() {
  const [idProyecto, setIdProyecto] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [datos, setDatos] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (idProyecto) cargarProveedores();
    else setProveedores([]);
  }, [idProyecto]);

  function cargarProveedores() {
    listarProveedores(idProyecto).then(setProveedores);
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await crearProveedor({ idProyecto, ...datos });
      setDatos(VALORES_INICIALES);
      cargarProveedores();
    } finally {
      setEnviando(false);
    }
  }

  async function manejarAdjuntarBoleta(idProveedor, evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await adjuntarBoletaGarantia(idProveedor, archivo);
    cargarProveedores();
  }

  return (
    <div>
      <EncabezadoPagina
        icono="handshake"
        titulo="Proveedor"
        descripcion="Etapa 4 — empresa adjudicada, boleta de garantía y datos de pago."
      />

      <SelectorProyecto idProyectoSeleccionado={idProyecto} onSeleccionar={setIdProyecto} />

      {idProyecto && (
        <Row className="g-3">
          <Col lg={7}>
            <Form onSubmit={manejarEnvioFormulario} className="bg-white p-3 rounded border mb-3">
              <Row className="g-2">
                <Col md={8}>
                  <Form.Label className="small">Nombre de la empresa</Form.Label>
                  <Form.Control
                    value={datos.nombreEmpresa}
                    onChange={(e) => setDatos({ ...datos, nombreEmpresa: e.target.value })}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small">RUT</Form.Label>
                  <Form.Control
                    value={datos.rutEmpresa}
                    onChange={(e) => setDatos({ ...datos, rutEmpresa: e.target.value })}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small">Banco</Form.Label>
                  <Form.Control
                    value={datos.banco}
                    onChange={(e) => setDatos({ ...datos, banco: e.target.value })}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small">Tipo de cuenta</Form.Label>
                  <Form.Control
                    value={datos.tipoCuenta}
                    onChange={(e) => setDatos({ ...datos, tipoCuenta: e.target.value })}
                    placeholder="Ej. Cuenta corriente"
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small">N° de cuenta</Form.Label>
                  <Form.Control
                    value={datos.numeroCuentaBancaria}
                    onChange={(e) => setDatos({ ...datos, numeroCuentaBancaria: e.target.value })}
                    required
                  />
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3" disabled={enviando}>
                Guardar proveedor
              </Button>
            </Form>

            <div className="table-wrap">
              <table className="projects">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>RUT</th>
                    <th>Boleta de garantía</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((proveedor) => (
                    <tr className="proj-row" key={proveedor.id}>
                      <td>
                        <div className="proj-name">{proveedor.nombreEmpresa}</div>
                      </td>
                      <td className="mono">{proveedor.rutEmpresa}</td>
                      <td>
                        {proveedor.boletaGarantia ? (
                          <a href={construirUrlArchivo(proveedor.boletaGarantia)} target="_blank" rel="noreferrer">
                            Ver archivo
                          </a>
                        ) : (
                          <Form.Control
                            type="file"
                            size="sm"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(evento) => manejarAdjuntarBoleta(proveedor.id, evento)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={5}>
            <div className="bg-white p-3 rounded border">
              <h2 className="h6">Bitácora</h2>
              <ListaBitacora idProyecto={idProyecto} etapa="proveedor" />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Icono from '../comunes/Icono';
import { actualizarEventoBitacora, agregarEventoBitacora, listarBitacora } from '../../servicios/serviciosBitacora';
import { mostrarToastCreado } from '../../utilidades/toast';

/**
 * Botón flotante (abajo a la derecha, mismo lugar donde suelen vivir los widgets
 * de chat) que despliega el historial de bitácora de un proyecto en un panel, en
 * vez de ocupar siempre una tarjeta fija en la pantalla. Reutilizable desde
 * cualquier etapa.
 *
 * Regla de negocio (igual en todas las etapas): el panel siempre muestra TODO el
 * historial del proyecto (incluidas las etapas anteriores); se puede agregar un
 * comentario nuevo en cualquier momento (el backend lo etiqueta con la etapa
 * actual del proyecto); pero solo son editables los comentarios de la etapa
 * actual — los de etapas ya cerradas quedan congelados como registro histórico.
 *
 * `etapaActual` es la etapa actual del proyecto (`proyecto.etapaActual`): se usa
 * únicamente para decidir, evento por evento, si el botón de editar aparece o no
 * (comparando contra `evento.etapa`) — el backend es quien de verdad aplica esta
 * regla, esto solo evita mostrar una acción que igual sería rechazada.
 */
export default function BitacoraFlotante({ idProyecto, etapaActual }) {
  const [abierto, setAbierto] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [textoObservacion, setTextoObservacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Evento que se está editando (null = ninguno). Se guarda el id acá y el texto
  // en edición aparte, en vez de mutar el arreglo "eventos" directamente.
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  function cargarEventos() {
    if (!idProyecto) return;
    setCargando(true);
    // Sin filtro de etapa: siempre se ve el historial completo del proyecto, tal
    // como se puede consultar aunque ya no se puedan editar los eventos viejos.
    listarBitacora(idProyecto)
      .then(setEventos)
      .finally(() => setCargando(false));
  }

  // Se recarga cada vez que se abre el panel (no en cada tecla ni en segundo
  // plano): es un historial de consulta puntual, no necesita estar siempre al día.
  useEffect(() => {
    if (abierto) cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, idProyecto]);

  async function manejarEnvioObservacion(evento) {
    evento.preventDefault();
    const descripcion = textoObservacion.trim();
    if (!descripcion) return;
    setEnviando(true);
    try {
      await agregarEventoBitacora({ idProyecto, descripcion });
      setTextoObservacion('');
      cargarEventos();
      mostrarToastCreado('La observación se agregó a la bitácora.');
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicion(evento) {
    setIdEnEdicion(evento.id);
    setTextoEdicion(evento.descripcion);
  }

  function cancelarEdicion() {
    setIdEnEdicion(null);
    setTextoEdicion('');
  }

  async function guardarEdicion(id) {
    const descripcion = textoEdicion.trim();
    if (!descripcion) return;
    setGuardandoEdicion(true);
    try {
      await actualizarEventoBitacora(id, descripcion);
      cancelarEdicion();
      cargarEventos();
    } finally {
      setGuardandoEdicion(false);
    }
  }

  if (!idProyecto) return null;

  return (
    <>
      {abierto && (
        <div className="bitacora-flotante__panel">
          <div className="bitacora-flotante__cabecera">
            <div className="d-flex align-items-center gap-2">
              <Icono nombre="clipboardList" tamano={16} />
              <strong className="small">Bitácora</strong>
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-secondary"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar bitácora"
            >
              <Icono nombre="xmark" tamano={14} />
            </Button>
          </div>

          <div className="bitacora-flotante__cuerpo">
            <Form onSubmit={manejarEnvioObservacion} className="mb-3">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={2}
                  maxLength={1000}
                  placeholder="Agregar una observación…"
                  value={textoObservacion}
                  onChange={(evento) => setTextoObservacion(evento.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline-secondary"
                  disabled={enviando || !textoObservacion.trim()}
                >
                  {enviando ? 'Guardando…' : 'Agregar observación'}
                </Button>
              </div>
            </Form>

            {cargando ? (
              <p className="text-secondary small mb-0">Cargando bitácora…</p>
            ) : eventos.length === 0 ? (
              <p className="text-secondary small mb-0">Todavía no hay eventos registrados.</p>
            ) : (
              <ul className="list-unstyled m-0">
                {eventos.map((evento) => {
                  // Solo se puede editar un comentario mientras el proyecto sigue en
                  // la misma etapa en la que se escribió — el backend aplica la
                  // misma regla, esto solo evita ofrecer una acción que rebotaría.
                  const esEditable = evento.etapa === etapaActual;
                  return (
                    <li key={evento.id} className="mb-3 border-start border-2 ps-3">
                      <div className="text-secondary small">
                        {new Date(evento.fecha).toLocaleString('es-CL')} · {evento.usuario}
                      </div>
                      {idEnEdicion === evento.id ? (
                        <div className="mt-1">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            maxLength={1000}
                            value={textoEdicion}
                            onChange={(e) => setTextoEdicion(e.target.value)}
                            autoFocus
                          />
                          <div className="d-flex justify-content-end gap-2 mt-1">
                            <Button variant="link" size="sm" className="p-0" onClick={cancelarEdicion}>
                              Cancelar
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              disabled={guardandoEdicion || !textoEdicion.trim()}
                              onClick={() => guardarEdicion(evento.id)}
                            >
                              {guardandoEdicion ? 'Guardando…' : 'Guardar'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>{evento.descripcion}</div>
                          {esEditable && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-secondary flex-shrink-0"
                              aria-label="Editar observación"
                              title="Editar"
                              onClick={() => iniciarEdicion(evento)}
                            >
                              <Icono nombre="pen" tamano={12} />
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="bitacora-flotante__boton"
        onClick={() => setAbierto((anterior) => !anterior)}
        aria-label={abierto ? 'Cerrar bitácora' : 'Abrir bitácora'}
        title="Bitácora"
      >
        <Icono nombre={abierto ? 'xmark' : 'clipboardList'} tamano={20} />
      </button>
    </>
  );
}

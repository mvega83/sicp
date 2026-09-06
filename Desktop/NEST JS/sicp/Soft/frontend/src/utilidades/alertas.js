import swal from 'sweetalert';

/**
 * Confirmación antes de una acción irreversible (ej. eliminar un registro), con el
 * mismo modelo "Are you sure?" de la página de Alerts Popups de Skydash: ícono de
 * advertencia + dos botones, en vez del confirm() feo del navegador.
 *
 * Diferencia a propósito frente al demo original: ahí el botón que sí ejecuta la
 * acción queda pintado en azul y "Cancelar" en rojo — al revés de lo que conviene
 * para un caso real de "eliminar". Acá "Eliminar" es el botón rojo (la acción
 * destructiva) y "Cancelar" es el botón neutro.
 *
 * Uso: if (await confirmarEliminacion('¿Eliminar este proyecto?')) { ...borrar... }
 *
 * El texto del botón de confirmación es configurable (ej. "Dar de baja" en vez de
 * "Eliminar") para reusar el mismo diálogo en acciones destructivas que no son un
 * borrado literal, como desactivar un usuario.
 */
export async function confirmarEliminacion(mensaje, titulo = '¿Estás seguro?', textoBoton = 'Eliminar') {
  const confirmado = await swal({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    dangerMode: true,
    buttons: {
      cancel: {
        text: 'Cancelar',
        value: null,
        visible: true,
        className: 'btn btn-outline-secondary',
        closeModal: true,
      },
      confirm: {
        text: textoBoton,
        value: true,
        visible: true,
        className: 'btn btn-danger',
        closeModal: true,
      },
    },
  });
  return Boolean(confirmado);
}

/**
 * Mensaje de éxito después de completar una acción, con el mismo modelo "A success
 * message!" de la misma página de referencia.
 */
export function mostrarExito(titulo, mensaje) {
  return swal({
    title: titulo,
    text: mensaje,
    icon: 'success',
    button: {
      text: 'Listo',
      value: true,
      visible: true,
      className: 'btn btn-primary',
    },
  });
}

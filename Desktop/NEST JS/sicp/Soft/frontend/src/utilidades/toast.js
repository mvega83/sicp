// Notificación tipo "toast": un mensaje corto que aparece arriba a la derecha y se
// cierra solo, para avisar el resultado de crear/editar sin interrumpir al usuario
// con un modal — a diferencia de confirmarEliminacion/mostrarExito (alertas.js), que
// sí bloquean la pantalla porque piden una decisión o confirman algo importante.
//
// Estructura tomada de la sección "Jquery-toast styles" de la página de
// notificaciones de Skydash (apiladas arriba a la derecha, entran deslizando, se
// cierran solas con una barra de progreso). Colores adaptados: el demo usa fondos
// sólidos verde/azul genéricos de Bootstrap 3 — acá se usa una tarjeta blanca con un
// ícono de color, reutilizando los mismos tokens que .pill.ok/.pill.info, en vez de
// inventar una paleta nueva.

const DURACION_MS = 4000;

const ICONOS = {
  success:
    '<svg viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>',
  info:
    '<svg viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
};

function obtenerContenedor() {
  let contenedor = document.querySelector('.toast-wrap');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'toast-wrap';
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

/** Uso: mostrarToast('success', 'Título', 'Texto del mensaje'). */
export function mostrarToast(tipo, titulo, mensaje) {
  const contenedor = obtenerContenedor();
  const item = document.createElement('div');
  item.className = `toast-item toast-item--${tipo}`;
  item.innerHTML = `
    <div class="toast-item__fila">
      <span class="toast-item__icono">${ICONOS[tipo] ?? ICONOS.info}</span>
      <div class="toast-item__cuerpo">
        <div class="toast-item__titulo"></div>
        <div class="toast-item__texto"></div>
      </div>
      <button type="button" class="toast-item__cerrar" aria-label="Cerrar">&times;</button>
    </div>
    <div class="toast-item__barra" style="animation-duration:${DURACION_MS}ms"></div>
  `;
  // textContent en vez de armar el título/mensaje dentro del innerHTML de arriba,
  // para no interpretar como HTML nada de lo que venga de datos reales (ej. un
  // nombre con "<" o "&" en el medio).
  item.querySelector('.toast-item__titulo').textContent = titulo;
  item.querySelector('.toast-item__texto').textContent = mensaje;
  contenedor.appendChild(item);

  function cerrar() {
    item.classList.add('toast-item--saliendo');
    item.addEventListener('animationend', () => item.remove(), { once: true });
  }
  item.querySelector('.toast-item__cerrar').addEventListener('click', cerrar);
  setTimeout(cerrar, DURACION_MS);
}

export function mostrarToastCreado(mensaje) {
  mostrarToast('success', '¡Creado!', mensaje);
}

export function mostrarToastActualizado(mensaje) {
  mostrarToast('info', 'Actualizado', mensaje);
}

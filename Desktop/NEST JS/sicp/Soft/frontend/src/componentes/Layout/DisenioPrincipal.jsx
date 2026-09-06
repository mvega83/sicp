import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BarraSuperior from './BarraSuperior';
import BarraLateral from './BarraLateral';

// Envuelve todas las pantallas privadas (después del login) con la misma barra
// superior y menú lateral. <Outlet /> es donde React Router dibuja la pantalla de
// la ruta activa (ver App.jsx).
export default function DisenioPrincipal() {
  // En pantallas angostas el menú lateral es un panel que se abre/cierra (ver
  // BarraLateral.jsx + index.css); en escritorio esta variable no tiene efecto
  // visual porque el CSS solo aplica la animación bajo el breakpoint móvil.
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ubicacion = useLocation();

  // Si el usuario cambia de pantalla con el menú móvil abierto (ej. tocando el
  // botón "atrás" del navegador), se cierra solo — evita que quede tapando la
  // pantalla nueva.
  useEffect(() => {
    setMenuAbierto(false);
  }, [ubicacion.pathname]);

  return (
    <div className="disenio-principal">
      <BarraSuperior onAbrirMenu={() => setMenuAbierto(true)} />
      <div className="disenio-principal__cuerpo">
        <BarraLateral abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
        <main className="disenio-principal__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

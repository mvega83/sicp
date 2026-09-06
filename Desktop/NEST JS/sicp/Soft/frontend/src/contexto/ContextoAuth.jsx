import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesionDev, iniciarSesionLocal, obtenerPerfil } from '../servicios/serviciosAuth';

const ContextoAuth = createContext(null);

/**
 * Guarda quién es el usuario que tiene la sesión iniciada (o null si nadie la
 * tiene) y lo deja disponible para toda la app mediante el hook useAuth().
 * También se encarga de guardar/leer el token en localStorage.
 */
export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  // "cargando" evita que la app decida "no hay sesión, mándalo al login" antes de
  // haber terminado de revisar si el token guardado en localStorage sigue siendo válido.
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function revisarSesionGuardada() {
      const token = localStorage.getItem('sicp_token');
      if (!token) {
        setCargando(false);
        return;
      }
      try {
        const perfil = await obtenerPerfil();
        setUsuario(perfil);
      } catch {
        // El token guardado ya no es válido (venció o el backend cambió de clave).
        localStorage.removeItem('sicp_token');
        localStorage.removeItem('sicp_usuario');
      } finally {
        setCargando(false);
      }
    }
    revisarSesionGuardada();
  }, []);

  async function iniciarSesion(nombres, apellidos, correo) {
    const { token, usuario: usuarioNuevo } = await iniciarSesionDev(nombres, apellidos, correo);
    localStorage.setItem('sicp_token', token);
    setUsuario(usuarioNuevo);
  }

  async function iniciarSesionConCredenciales(correo, contrasena) {
    const { token, usuario: usuarioNuevo } = await iniciarSesionLocal(correo, contrasena);
    localStorage.setItem('sicp_token', token);
    setUsuario(usuarioNuevo);
  }

  function guardarSesionDesdeToken(token, usuarioNuevo) {
    localStorage.setItem('sicp_token', token);
    setUsuario(usuarioNuevo);
  }

  function cerrarSesion() {
    localStorage.removeItem('sicp_token');
    localStorage.removeItem('sicp_usuario');
    setUsuario(null);
  }

  return (
    <ContextoAuth.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        iniciarSesionConCredenciales,
        guardarSesionDesdeToken,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <ProveedorAuth>');
  }
  return contexto;
}

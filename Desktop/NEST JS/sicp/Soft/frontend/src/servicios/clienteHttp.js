import axios from 'axios';

// Instancia única de axios para todo el frontend. La URL del backend sale de una
// variable de entorno (VITE_API_URL) — así, para apuntar a otro backend (de
// desarrollo local a un servidor de pruebas, por ejemplo) basta con cambiar el
// archivo .env, sin tocar ningún componente ni servicio.
const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Antes de cada request, si hay un token guardado (usuario con sesión iniciada), se
// agrega automáticamente al header Authorization. Así ningún servicio individual
// tiene que preocuparse de adjuntar el token a mano.
clienteHttp.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem('sicp_token');
  if (token) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }
  return configuracion;
});

// Si el backend responde 401 (token vencido o inválido), se limpia la sesión
// guardada. El componente RutaProtegida se encarga de mandar al login cuando ya no
// hay usuario en el contexto.
clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sicp_token');
      localStorage.removeItem('sicp_usuario');
    }
    return Promise.reject(error);
  },
);

export default clienteHttp;

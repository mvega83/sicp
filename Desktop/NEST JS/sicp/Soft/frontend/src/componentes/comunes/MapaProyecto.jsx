import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import iconoMarcador from 'leaflet/dist/images/marker-icon.png';
import iconoMarcador2x from 'leaflet/dist/images/marker-icon-2x.png';
import sombraMarcador from 'leaflet/dist/images/marker-shadow.png';

// Los bundlers (Vite incluido) no resuelven las rutas relativas que Leaflet usa
// internamente para el ícono por defecto del marcador, así que el ícono queda roto
// si no se pisa manualmente con las imágenes ya importadas (URLs que sí resuelve Vite).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: iconoMarcador,
  iconRetinaUrl: iconoMarcador2x,
  shadowUrl: sombraMarcador,
});

// Centro por defecto cuando todavía no hay coordenadas cargadas: Plaza de Armas de
// Ovalle, Chile — todos los proyectos son de esa comuna, así que arrancar el mapa
// ahí (en vez de un punto arbitrario) permite ubicarse más rápido al elegir el punto.
const CENTRO_OVALLE = [-30.6006, -71.1997];

// Escucha los clics sobre el mapa y avisa al componente padre con la coordenada
// elegida. Va aparte porque useMapEvents solo funciona dentro de un MapContainer.
function ManejadorClicMapa({ onCambiarUbicacion }) {
  useMapEvents({
    click(evento) {
      const { lat, lng } = evento.latlng;
      // Se redondea a 6 decimales para combinar con el step="0.000001" de los
      // inputs numéricos de latitud/longitud del formulario.
      onCambiarUbicacion(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    },
  });
  return null;
}

/**
 * Mapa reutilizable para mostrar/elegir la ubicación de un proyecto.
 * - soloLectura (o sin onCambiarUbicacion): solo muestra el marcador, sin permitir moverlo.
 * - con onCambiarUbicacion: al hacer clic en el mapa, mueve el marcador y notifica la
 *   nueva coordenada al componente padre (que decide qué hacer con ella).
 */
export default function MapaProyecto({ latitud, longitud, onCambiarUbicacion, soloLectura }) {
  const lat = Number(latitud);
  const lng = Number(longitud);
  // Ojo: Number('') da 0 (no NaN), así que hay que descartar explícitamente los
  // valores vacíos/nulos del formulario antes de confiar en Number.isFinite — si no,
  // un formulario recién abierto (latitud/longitud en '') se toma como "coordenada
  // (0,0) válida" y el mapa termina en el golfo de Guinea en vez de en Ovalle.
  const hayCoordenadas =
    latitud !== '' &&
    latitud != null &&
    longitud !== '' &&
    longitud != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  const centro = hayCoordenadas ? [lat, lng] : CENTRO_OVALLE;
  const esInteractivo = Boolean(onCambiarUbicacion) && !soloLectura;
  // Sin un punto propio todavía, conviene ver la comuna completa (zoom más abierto)
  // para ubicarse rápido; con un punto ya elegido, se acerca a nivel de calle.
  const zoom = hayCoordenadas ? 15 : 13;

  return (
    // key con el centro fuerza a Leaflet a recentrar cuando cambian las coordenadas
    // desde afuera (ej. el usuario edita los inputs a mano), sin manejar la
    // recentralización manualmente con la API imperativa del mapa.
    <MapContainer
      key={centro.join(',')}
      center={centro}
      zoom={zoom}
      style={{ height: 320, width: '100%', borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hayCoordenadas && <Marker position={centro} />}
      {esInteractivo && <ManejadorClicMapa onCambiarUbicacion={onCambiarUbicacion} />}
    </MapContainer>
  );
}

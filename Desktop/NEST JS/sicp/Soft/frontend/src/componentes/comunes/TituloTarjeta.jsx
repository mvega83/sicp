import Icono from './Icono';

/**
 * Título de tarjeta reutilizable: ícono representativo + texto, con el estilo
 * (color de acento, negrita, tamaño) definido en la clase ".card-title" de
 * index.css. Reemplaza tanto a `Card.Title` de react-bootstrap como a los títulos
 * sueltos (`<h2>`) de las tarjetas que no usan el componente `Card`, para que
 * todos luzcan igual en toda la app.
 *
 * Uso: <TituloTarjeta icono="tag">Características</TituloTarjeta>
 * El `className` es libre (ej. "mb-0" cuando el título va en una fila junto a un
 * botón que ya trae su propio margen) — no hay un margen por defecto implícito.
 */
export default function TituloTarjeta({ icono, children, className = '', as: Elemento = 'h2' }) {
  return (
    <Elemento className={`card-title ${className}`.trim()}>
      <Icono nombre={icono} tamano={18} />
      <span>{children}</span>
    </Elemento>
  );
}

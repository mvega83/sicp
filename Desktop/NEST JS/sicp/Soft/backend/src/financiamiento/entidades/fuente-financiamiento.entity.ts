import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TipoFuenteFinanciamiento } from '../../tipo-fuente-financiamiento/entidades/tipo-fuente-financiamiento.entity';

// Igual que en Proyecto: MySQL devuelve "decimal" como texto, así que se convierte
// a number para que el frontend no tenga que preocuparse de eso.
const transformadorDecimal = {
  to: (valor: number) => valor,
  from: (valor: string) => parseFloat(valor),
};

/**
 * Etapa 2: un proyecto puede tener una o varias fuentes de financiamiento, por eso
 * es una tabla aparte y no columnas sueltas dentro de Proyecto.
 *
 * `idProyecto` es un id simple (no una relación @ManyToOne formal), igual que en
 * Bitacora: mantiene este módulo independiente de ProyectosModule, más simple de
 * leer para alguien recién aprendiendo TypeORM.
 *
 * La combinación (idProyecto, idTipoFuenteFinanciamiento) es única: no tiene
 * sentido agregar la misma fuente dos veces al mismo proyecto (ej. "FNDR" por
 * duplicado) — si aporta más dinero, se edita el monto de la fila existente.
 */
@Entity('fuentes_financiamiento')
@Unique(['idProyecto', 'idTipoFuenteFinanciamiento'])
export class FuenteFinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  // Relación real (no el patrón de "idProyecto suelto" de arriba) porque
  // tipo_fuente_financiamiento es un catálogo fijo de Configuración, sin riesgo de
  // dependencia circular: TipoFuenteFinanciamientoModule no depende de este módulo.
  @Column()
  idTipoFuenteFinanciamiento: string;

  @ManyToOne(() => TipoFuenteFinanciamiento)
  @JoinColumn({ name: 'idTipoFuenteFinanciamiento' })
  tipoFuenteFinanciamiento: TipoFuenteFinanciamiento;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: transformadorDecimal })
  monto: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

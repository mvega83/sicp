import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
 */
@Entity('fuentes_financiamiento')
export class FuenteFinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  // Ej: "FNDR", "Fondos municipales propios", "Subvención regional".
  @Column()
  nombreFuente: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: transformadorDecimal })
  monto: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

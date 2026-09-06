import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Sección Configuración: catálogo de fuentes de financiamiento disponibles (ej.
 * "FNDR", "Fondos municipales propios", "Subvención regional"), reutilizable al
 * completar la Etapa 2 (Financiamiento) de un proyecto.
 *
 * OJO: no confundir con `FuenteFinanciamiento` (src/financiamiento/), que es el
 * registro real de financiamiento de un proyecto puntual (con monto e idProyecto).
 * Esta entidad es solo el catálogo de nombres/procedencias disponibles para elegir.
 */
@Entity('tipo_fuente_financiamiento')
export class TipoFuenteFinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // De dónde viene el financiamiento. Ej: "GORE", "Ministerios", "Fondos propios".
  @Column({ type: 'varchar', length: 150 })
  procedencia: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}

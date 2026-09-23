import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FuenteFinanciamiento } from './fuente-financiamiento.entity';

/**
 * Decreto que respalda una fuente de financiamiento puntual (ej. el decreto que
 * aprueba los fondos FNDR de un proyecto). A diferencia de DocumentoFinanciamiento
 * (documentos generales de la etapa, sin fuente asociada), acá cada decreto queda
 * ligado a una fuente concreta vía idFuenteFinanciamiento.
 */
@Entity('decretos_financiamiento')
export class DecretoFinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'url_decreto' })
  urlDecreto: string;

  @Column({ type: 'date', name: 'fecha_decreto' })
  fechaDecreto: string;

  // Relación real porque fuentes_financiamiento vive en este mismo módulo (sin
  // riesgo de dependencia circular), a diferencia de idProyecto/idTipoUsuario etc.
  // que sí cruzan módulos.
  @Column({ name: 'id_fuente_financiamiento' })
  idFuenteFinanciamiento: string;

  @ManyToOne(() => FuenteFinanciamiento)
  @JoinColumn({ name: 'id_fuente_financiamiento' })
  fuenteFinanciamiento: FuenteFinanciamiento;

  @CreateDateColumn()
  fechaCreacion: Date;
}

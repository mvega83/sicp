import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Documentos/fotografías de la etapa de Aprobación de un proyecto. Mismo criterio
 * que DocumentoFinanciamiento: se pueden seguir agregando sin perder los
 * anteriores. Esta etapa todavía no tiene datos de negocio propios (ver
 * AprobacionService), solo estos archivos generales.
 *
 * `idProyecto` es un id simple (no @ManyToOne), igual que en el resto de
 * entidades de etapa, para no generar dependencias circulares con ProyectosModule.
 */
@Entity('documentos_aprobacion')
export class DocumentoAprobacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column()
  url: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}

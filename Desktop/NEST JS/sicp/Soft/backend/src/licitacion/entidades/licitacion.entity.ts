import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Etapa 3: el proyecto sale a licitación. `idProyecto` es un id simple, igual que
 * en los otros módulos de etapa (ver comentario en FuenteFinanciamiento).
 */
@Entity('licitaciones')
export class Licitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  // Id de la licitación en el sistema externo (ej. Mercado Público), no el id interno.
  @Column()
  idLicitacionExterna: string;

  @Column()
  responsable: string;

  @Column({ type: 'date' })
  fechaLicitacion: string;

  @Column({ type: 'date', nullable: true })
  fechaRespuesta: string | null;

  @Column({ type: 'date', nullable: true })
  fechaFinalizacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaAdjudicacion: string | null;

  // URL del documento de la REX de licitación (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  archivoRex: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

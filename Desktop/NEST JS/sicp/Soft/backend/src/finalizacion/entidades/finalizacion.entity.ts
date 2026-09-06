import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Etapa 6: cierre del proyecto. Se espera un solo registro de finalización por
 * proyecto (aunque, igual que en los otros módulos de etapa, no hay una restricción
 * formal en la base de datos que lo impida — se mantiene simple para el alcance de
 * este primer esqueleto).
 */
@Entity('finalizaciones')
export class Finalizacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column({ type: 'date' })
  fechaCierre: string;

  @Column({ type: 'text', nullable: true })
  observacionesFinales: string | null;

  // URL del documento de cierre (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  documentoCierre: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

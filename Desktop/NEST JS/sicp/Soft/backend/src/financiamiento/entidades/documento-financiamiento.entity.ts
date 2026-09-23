import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Documentos generales de la etapa de Financiamiento de un proyecto (ej.
 * resoluciones, respaldos), no ligados a una fuente de financiamiento puntual —
 * a diferencia de FuenteFinanciamiento, acá solo se acumulan archivos sin montos.
 * Mismo criterio que `Proyecto.imagenes` en Banco de Ideas: se puede seguir
 * agregando sin perder los anteriores.
 *
 * `idProyecto` es un id simple (no @ManyToOne), igual que en FuenteFinanciamiento.
 */
@Entity('documentos_financiamiento')
export class DocumentoFinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column()
  url: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}

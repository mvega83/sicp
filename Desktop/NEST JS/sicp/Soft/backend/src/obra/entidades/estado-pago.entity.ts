import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const transformadorDecimal = {
  to: (valor: number) => valor,
  from: (valor: string) => parseFloat(valor),
};

/**
 * Etapa 5 (Desarrollo de obra): cada fila es un estado de pago dentro de la
 * ejecución de la obra. El ITO (Inspector Técnico de Obra) se guarda como texto en
 * cada estado de pago porque puede cambiar de una obra a otra, o incluso durante la
 * misma obra.
 */
@Entity('estados_pago')
export class EstadoPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column()
  ito: string;

  @Column({ type: 'int' })
  numeroEstadoPago: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: transformadorDecimal })
  monto: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // URL del documento adjunto de avance/pago (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  documentoAdjunto: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

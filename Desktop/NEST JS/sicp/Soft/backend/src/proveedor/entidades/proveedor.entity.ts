import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Etapa 4: la empresa adjudicada y sus datos de pago.
 *
 * OJO — dato sensible: `numeroCuentaBancaria` no debería mostrarse completo salvo
 * que el usuario tenga el rol adecuado, y nunca debería aparecer en logs. Este es
 * justo el tipo de campo que `subagente_segurito_back` debería revisar antes de
 * pasar este módulo a producción (ver .claude/agents/subagente_segurito_back.md).
 */
@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column()
  nombreEmpresa: string;

  @Column()
  rutEmpresa: string;

  @Column({ type: 'text', nullable: true })
  datosGenerales: string | null;

  // URL del documento de la boleta de garantía (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  boletaGarantia: string | null;

  @Column()
  banco: string;

  @Column()
  tipoCuenta: string;

  @Column()
  numeroCuentaBancaria: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}

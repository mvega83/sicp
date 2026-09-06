import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Catálogo de tipos de proyecto (ej. Plaza, Sede social, Multicancha) usado
// en la etapa de Banco de Ideas para definir qué características aplican.
@Entity('tipos_proyecto')
export class TipoProyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // 1 = activo, -1 = inactivo.
  @Column({ type: 'int', default: 1 })
  estado: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Catálogo de características que puede tener un proyecto del banco de ideas
 * (ej. "Luminaria", "Cierre perimetral"). Mismo criterio de estado que Unidad y
 * Usuario: en vez de borrar una característica ya usada por algún proyecto, se
 * marca como inactiva para no perder las referencias existentes.
 */
@Entity('caracteristicas_proyectos')
export class CaracteristicaProyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // 1 = activo, -1 = inactivo.
  @Column({ type: 'int', default: 1 })
  estado: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;
}

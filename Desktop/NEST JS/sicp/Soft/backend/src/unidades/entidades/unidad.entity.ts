import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Sección Administración: catálogo de unidades municipales (ej. "SECPLAN", "Dirección
 * de Obras", "Tránsito"). Mismo criterio de estado que Usuario: en vez de borrar una
 * unidad en uso, se marca como "de baja" para no perder las referencias existentes.
 */
@Entity('unidades')
export class Unidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 250 })
  nombre: string;

  // 1 = activo, -1 = de baja.
  @Column({ type: 'int', default: 1 })
  estado: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;
}

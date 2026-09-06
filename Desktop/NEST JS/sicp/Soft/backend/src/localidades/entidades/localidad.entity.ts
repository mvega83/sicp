import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Catálogo de localidades/sectores usados para ubicar los proyectos
// (ej. al cargar un proyecto en el Banco de Ideas se elige una localidad).
@Entity('localidades')
export class Localidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // 1 = Urbana, 2 = Rural.
  @Column({ type: 'int' })
  zona: number;

  // 1 = Céntrico, 2 = Parte alta, 3 = El Portal, 4 = Fray Jorge, 5 = Puertas del Sol,
  // 6 = Sector Limarí, 7 = Sector El Romeral, 8 = Sector fuera de Ovalle.
  @Column({ type: 'int' })
  sector: number;

  // 1 = activo, -1 = de baja.
  @Column({ type: 'int', default: 1 })
  estado: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;
}

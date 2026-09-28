import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Etapas del ciclo de vida de un proyecto. Se usa acá y en el resto del sistema
// para filtrar la bitácora por etapa.
export enum EtapaProyecto {
  BANCO_IDEAS = 'banco_ideas',
  FINANCIAMIENTO = 'financiamiento',
  APROBACION = 'aprobacion',
  LICITACION = 'licitacion',
  PROVEEDOR = 'proveedor',
  OBRA = 'obra',
  FINALIZACION = 'finalizacion',
}

/**
 * Registro histórico de eventos de un proyecto. En vez de tener una tabla de
 * bitácora separada por cada una de las 6 etapas (mucha duplicación para el mismo
 * propósito), se usa una sola tabla con la columna "etapa" para poder filtrar por
 * cada una cuando se necesite.
 *
 * No tiene una relación formal (@ManyToOne) hacia Proyecto a propósito: así el
 * módulo de bitácora no depende del módulo de proyectos ni de ningún módulo de
 * etapa, y cualquiera de ellos puede usarlo sin generar dependencias circulares.
 */
@Entity('bitacora')
export class Bitacora {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  @Column({ type: 'enum', enum: EtapaProyecto })
  etapa: EtapaProyecto;

  @Column({ type: 'text' })
  descripcion: string;

  // Nombre de quien generó el evento, guardado como texto plano (no como relación)
  // para que la bitácora se siga leyendo bien aunque ese usuario se borre después.
  @Column()
  usuario: string;

  @CreateDateColumn()
  fecha: Date;
}

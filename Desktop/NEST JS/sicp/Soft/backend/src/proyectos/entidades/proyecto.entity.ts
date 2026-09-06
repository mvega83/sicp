import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EtapaProyecto } from '../../bitacora/entidades/bitacora.entity';
import { TipoProyecto } from '../../tipos-proyecto/entidades/tipo-proyecto.entity';
import { Localidad } from '../../localidades/entidades/localidad.entity';

// MySQL devuelve las columnas "decimal" como texto (para no perder precisión), pero
// para el frontend es más cómodo trabajar con un number normal en coordenadas. Este
// transformador convierte automáticamente en ambas direcciones.
const transformadorDecimal = {
  to: (valor: number) => valor,
  from: (valor: string) => parseFloat(valor),
};

/**
 * Etapa 1 (Banco de Ideas): el punto de partida de cualquier proyecto municipal.
 * Las etapas 2 a 6 (financiamiento, licitación, proveedor, obra, finalización) se
 * relacionan con un Proyecto mediante su `id`.
 */
@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  // Relación real (no el patrón de "idProyecto suelto" que usan las entidades de
  // etapa) porque tipos_proyecto es un catálogo fijo de Configuración, sin riesgo de
  // dependencia circular entre módulos.
  @Column({ type: 'varchar' })
  idTipoProyecto: string;

  @ManyToOne(() => TipoProyecto)
  @JoinColumn({ name: 'idTipoProyecto' })
  tipoProyecto: TipoProyecto;

  @Column()
  comuna: string;

  @Column()
  direccion: string;

  // Mismo criterio que idTipoProyecto: relación real porque localidades es un
  // catálogo fijo de Configuración, sin riesgo de dependencia circular.
  @Column({ type: 'varchar' })
  idLocalidad: string;

  @ManyToOne(() => Localidad)
  @JoinColumn({ name: 'idLocalidad' })
  localidad: Localidad;

  // decimal (no float) para no perder precisión en las coordenadas.
  @Column({ type: 'decimal', precision: 10, scale: 6, transformer: transformadorDecimal })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, transformer: transformadorDecimal })
  longitud: number;

  // Lista libre de características (ej. "Luminaria perimetral", "Cierre
  // perimetral"): cada tipo de proyecto puede tener características distintas, así
  // que se guardan como texto libre en vez de una tabla de opciones fijas.
  @Column({ type: 'json', nullable: true })
  caracteristicas: string[];

  // URLs de las imágenes subidas (ver ArchivosModule / ProyectosController).
  @Column({ type: 'json', nullable: true })
  imagenes: string[];

  // En qué etapa del ciclo de vida está el proyecto ahora mismo. Se actualiza desde
  // los módulos de las otras etapas (ej. al crear un registro de Financiamiento
  // para este proyecto, se avanza a EtapaProyecto.FINANCIAMIENTO).
  @Column({
    type: 'enum',
    enum: EtapaProyecto,
    default: EtapaProyecto.BANCO_IDEAS,
  })
  etapaActual: EtapaProyecto;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}

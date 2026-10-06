import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Unidad } from '../../unidades/entidades/unidad.entity';

// Igual que en Proyecto/FuenteFinanciamiento: MySQL devuelve "decimal" como
// texto, así que se convierte a number para que el frontend no tenga que
// preocuparse de eso. A diferencia de esos otros (donde el decimal es
// obligatorio), acá la columna es nullable — hay que dejar pasar null tal
// cual, porque parseFloat(null) da NaN (y un NaN en una columna numérica hace
// fallar cualquier guardado posterior de la fila, no solo el de este campo).
const transformadorDecimal = {
  to: (valor: number | null) => valor,
  from: (valor: string | null) => (valor === null ? null : parseFloat(valor)),
};

export enum ResultadoAdjudicacion {
  ADJUDICADO = 'adjudicado',
  DESIERTA = 'desierta',
}

/**
 * Etapa 4: el proyecto sale a licitación. `idProyecto` es un id simple, igual que
 * en los otros módulos de etapa (ver comentario en FuenteFinanciamiento).
 *
 * El registro se completa en 6 pasos secuenciales desde el frontend:
 *  1) Solicitante: idUnidad + fechaSolicitud + documentoBasesTecnicas. Esto es lo
 *     mínimo para dejar "iniciada" una licitación.
 *  2) Resolución: numeroResolucion + fechaResolucion + documentoResolucion.
 *  3) Datos de la licitación: idLicitacionExterna, responsable, fechas, comisión
 *     evaluadora, preguntas y respuestas.
 *  4) Adjudicación: resultadoAdjudicacion ("adjudicado" o "desierta") + los datos
 *     del proveedor adjudicado (si corresponde) o la fecha/acta de la licitación
 *     desierta (si corresponde).
 *  5) REX de adjudicación: numeroRexAdjudicacion + fechaRexAdjudicacion +
 *     documentoRexAdjudicacion. Aplica igual para ambos resultados del paso 4 —
 *     en Chile, tanto adjudicar como declarar desierta se formaliza con una REX.
 *  6) ITO: idUnidadIto + nombreIto. Es el último paso — una vez completo, la
 *     licitación se considera terminada y pasa al historial.
 * Todos los campos de los pasos 2 a 6 son nullable porque se completan en
 * guardados sucesivos (pueden pasar días/semanas entre un paso y el otro).
 */
@Entity('licitaciones')
export class Licitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idProyecto: string;

  // --- Etapa 1: Solicitante (obligatoria para crear el registro) ---

  // Unidad solicitante, viene del catálogo de Configuración (mismo patrón que
  // Usuario.idUnidad en backend/src/auth/entidades/usuario.entity.ts: columna FK
  // explícita + relación @ManyToOne, sin que UnidadesModule dependa de este módulo).
  @Column({ type: 'varchar' })
  idUnidad: string;

  @ManyToOne(() => Unidad)
  @JoinColumn({ name: 'idUnidad' })
  unidad: Unidad;

  @Column({ type: 'date' })
  fechaSolicitud: string;

  // URL del documento de bases técnicas (ver ArchivosModule).
  @Column({ type: 'varchar' })
  documentoBasesTecnicas: string;

  // --- Etapa 2: Resolución (se completa en un segundo guardado) ---

  @Column({ type: 'varchar', nullable: true })
  numeroResolucion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaResolucion: string | null;

  // URL de la resolución exenta que da inicio a la licitación (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  documentoResolucion: string | null;

  // --- Etapa 3: Datos de la licitación (se completan en un tercer guardado) ---

  // Id de la licitación en el sistema externo (ej. Mercado Público), no el id interno.
  @Column({ type: 'varchar', nullable: true })
  idLicitacionExterna: string | null;

  // En la UI se muestra como "Funcionario(a) de compras".
  @Column({ type: 'varchar', nullable: true })
  responsable: string | null;

  @Column({ type: 'date', nullable: true })
  fechaLicitacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaRespuestaDesde: string | null;

  @Column({ type: 'date', nullable: true })
  fechaRespuestaHasta: string | null;

  // Fecha de cierre de la licitación.
  @Column({ type: 'date', nullable: true })
  fechaFinalizacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaAdjudicacion: string | null;

  // Exactamente 3 nombres cuando se completa. Mismo patrón que "imagenes" en
  // Proyecto: un arreglo simple de texto, sin tabla propia, porque no se necesita
  // consultarlos individualmente ni relacionarlos con otra entidad.
  @Column({ type: 'json', nullable: true })
  comisionTitulares: string[] | null;

  @Column({ type: 'json', nullable: true })
  comisionSuplentes: string[] | null;

  // URL del documento de preguntas y respuestas del proceso (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  documentoPreguntasRespuestas: string | null;

  // URL de la REX (resolución exenta) que aprueba las respuestas del proceso —
  // opcional, a diferencia del documento de preguntas y respuestas de arriba.
  @Column({ type: 'varchar', nullable: true })
  documentoRexRespuestas: string | null;

  // --- Etapa 4: Adjudicación (se completa en un cuarto guardado) ---

  @Column({ type: 'enum', enum: ResultadoAdjudicacion, nullable: true })
  resultadoAdjudicacion: ResultadoAdjudicacion | null;

  // Datos del proveedor adjudicado — solo aplican si resultadoAdjudicacion es
  // "adjudicado". Es un registro propio de esta etapa, independiente del módulo
  // Proveedor (etapa 5 del ciclo del proyecto): acá se deja constancia de quién
  // se adjudicó al cerrar la licitación; el módulo Proveedor junta después los
  // datos de pago/garantía para avanzar la obra.
  @Column({ type: 'varchar', nullable: true })
  nombreProveedor: string | null;

  @Column({ type: 'varchar', nullable: true })
  rutProveedor: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefonoProveedor: string | null;

  @Column({ type: 'varchar', nullable: true })
  correoProveedor: string | null;

  @Column({ type: 'varchar', nullable: true })
  nombreEncargadoProveedor: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: transformadorDecimal })
  montoAdjudicacion: number | null;

  // URL del acta de evaluación (ver ArchivosModule) — caso "adjudicado".
  @Column({ type: 'varchar', nullable: true })
  documentoActaEvaluacion: string | null;

  // Fecha en que se declaró desierta — caso "desierta".
  @Column({ type: 'date', nullable: true })
  fechaDesierta: string | null;

  // URL del acta de la licitación desierta (ver ArchivosModule) — caso "desierta".
  @Column({ type: 'varchar', nullable: true })
  documentoActaDesierta: string | null;

  // --- Etapa 5: REX de adjudicación (se completa en un quinto guardado) ---

  @Column({ type: 'varchar', nullable: true })
  numeroRexAdjudicacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaRexAdjudicacion: string | null;

  // URL del documento de la REX de adjudicación (ver ArchivosModule).
  @Column({ type: 'varchar', nullable: true })
  documentoRexAdjudicacion: string | null;

  // --- Etapa 6: ITO (se completa en un sexto guardado — cierra la licitación) ---

  // Unidad del ITO (Inspector Técnico de Obra), mismo catálogo y mismo patrón
  // de relación que idUnidad/unidad del Solicitante (etapa 1).
  @Column({ type: 'varchar', nullable: true })
  idUnidadIto: string | null;

  @ManyToOne(() => Unidad, { nullable: true })
  @JoinColumn({ name: 'idUnidadIto' })
  unidadIto: Unidad | null;

  @Column({ type: 'varchar', nullable: true })
  nombreIto: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;
}

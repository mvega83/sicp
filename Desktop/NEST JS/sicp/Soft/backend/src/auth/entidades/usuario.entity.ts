import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TipoUsuario } from '../../tipo-usuario/entidades/tipo-usuario.entity';
import { Unidad } from '../../unidades/entidades/unidad.entity';

export enum ProveedorAutenticacion {
  DESARROLLO = 'desarrollo',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  // Usuario creado desde la sección Administración, con correo + contraseña propios
  // (no depende de una cuenta de Google/Microsoft).
  LOCAL = 'local',
}

/**
 * Representa a cualquier persona que inicia sesión en el sistema, sin importar si
 * entró con el login de desarrollo, con Google/Microsoft, o con correo y contraseña
 * (login local). Se usa, por ejemplo, para mostrar quién es el "responsable" de una
 * licitación o el "ITO" de una obra.
 */
@Entity('usuarios')
@Unique(['correo'])
@Unique(['run'])
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column()
  correo: string;

  // Nulos porque un usuario que recién inició sesión con Google/Microsoft todavía no
  // completó su ficha (dirección, teléfono, RUN, tipo de usuario) — esos datos los
  // termina de cargar un administrador desde la sección Administración > Usuarios.
  @Column({ type: 'varchar', nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  // RUN chileno, guardado sin puntos y con guion (ej. "12345678-9"). Ver
  // src/comun/validadores/run.validador.ts para el chequeo del dígito verificador.
  @Column({ type: 'varchar', nullable: true })
  run: string | null;

  // Nunca se guarda la contraseña en texto plano: acá va el resultado de
  // bcrypt.hash(...). Queda nula para usuarios que solo inician sesión por
  // Google/Microsoft/login-dev, ya que esos no tienen contraseña propia.
  @Column({ type: 'varchar', nullable: true })
  contrasenaHash: string | null;

  @Column({ type: 'enum', enum: ProveedorAutenticacion })
  proveedorAutenticacion: ProveedorAutenticacion;

  // id que entrega Google/Microsoft para este usuario (el "sub" del token OAuth).
  // Queda vacío para usuarios que entraron por el login de desarrollo o local.
  // OJO: se declara el "type" a mano porque TypeScript reduce el tipo union
  // "string | null" a "Object" al reflejarlo, y TypeORM no sabe mapear "Object" a
  // una columna MySQL si no se lo decimos explícitamente.
  @Column({ type: 'varchar', nullable: true })
  idProveedorExterno: string | null;

  // Relación real (no el patrón de "idProyecto suelto" que usan las entidades de
  // etapa) porque tipo_usuario es un catálogo fijo de Administración, sin riesgo de
  // dependencia circular entre módulos: TipoUsuarioModule no depende de AuthModule.
  @Column({ type: 'varchar', nullable: true })
  idTipoUsuario: string | null;

  @ManyToOne(() => TipoUsuario, { nullable: true })
  @JoinColumn({ name: 'idTipoUsuario' })
  tipoUsuario: TipoUsuario | null;

  // Mismo criterio que idTipoUsuario: relación real porque unidades es un catálogo
  // fijo de Configuración, sin riesgo de dependencia circular (UnidadesModule no
  // depende de AuthModule).
  @Column({ type: 'varchar', nullable: true })
  idUnidad: string | null;

  @ManyToOne(() => Unidad, { nullable: true })
  @JoinColumn({ name: 'idUnidad' })
  unidad: Unidad | null;

  // 1 = activo, -1 = de baja. Se usa "de baja" en vez de borrar la fila para no
  // perder la referencia en licitaciones/obras donde este usuario aparece como
  // responsable o ITO, y para poder reactivarlo más adelante si corresponde.
  @Column({ type: 'int', default: 1 })
  estado: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;
}

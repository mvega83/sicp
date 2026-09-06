import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Sección Administración: catálogo de tipos de usuario del sistema (ej. "Funcionario
 * municipal", "ITO", "Administrador"). `id` es un UUID (igual criterio que el resto
 * de las entidades del sistema, ej. Usuario, Proyecto) y `codigo` es un número corto
 * (hasta 2 dígitos) que sirve como identificador legible aparte del id interno.
 */
@Entity('tipo_usuario')
export class TipoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Código corto de hasta 2 dígitos (0 a 99). MySQL ya no valida el "ancho" de un
  // int, así que la validación real de "máximo 2 dígitos" vive en el DTO (ver
  // dto/crear-tipo-usuario.dto.ts), no en la base de datos.
  @Column({ type: 'int' })
  codigo: number;

  @Column()
  nombre: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}

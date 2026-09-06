import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, ProveedorAutenticacion } from '../auth/entidades/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

// El service siempre trabaja con el Usuario completo (incluyendo contrasenaHash) —
// es el controller quien se encarga de nunca dejarlo salir en una respuesta HTTP
// (ver omitirContrasena en comun/utilidades). Mantener el hash acá es necesario,
// por ejemplo, para que `actualizar` pueda conservarlo cuando no se manda una
// contraseña nueva.

// Costo del hash de bcrypt: a mayor número, más lento (y más seguro) es calcular el
// hash. 10 es el valor por defecto recomendado por la librería para este tipo de uso.
const COSTO_HASH = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioUsuarios: Repository<Usuario>,
  ) {}

  async crear(datos: CrearUsuarioDto): Promise<Usuario> {
    await this.verificarCorreoYRunDisponibles(datos.correo, datos.run);

    const usuario = this.repositorioUsuarios.create({
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      correo: datos.correo,
      contrasenaHash: await bcrypt.hash(datos.contrasena, COSTO_HASH),
      run: datos.run,
      idTipoUsuario: datos.idTipoUsuario,
      idUnidad: datos.idUnidad,
      direccion: datos.direccion ?? null,
      telefono: datos.telefono ?? null,
      proveedorAutenticacion: ProveedorAutenticacion.LOCAL,
    });
    return this.repositorioUsuarios.save(usuario);
  }

  async listar(): Promise<Usuario[]> {
    return this.repositorioUsuarios.find({
      relations: { tipoUsuario: true, unidad: true },
      order: { nombres: 'ASC' },
    });
  }

  async obtenerPorId(id: string): Promise<Usuario> {
    const usuario = await this.repositorioUsuarios.findOne({
      where: { id },
      relations: { tipoUsuario: true, unidad: true },
    });
    if (!usuario) {
      throw new NotFoundException(`No existe un usuario con id "${id}"`);
    }
    return usuario;
  }

  async actualizar(id: string, datos: ActualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);
    await this.verificarCorreoYRunDisponibles(datos.correo, datos.run, id);

    const { contrasena, ...resto } = datos;
    Object.assign(usuario, resto);
    if (contrasena) {
      usuario.contrasenaHash = await bcrypt.hash(contrasena, COSTO_HASH);
    }
    return this.repositorioUsuarios.save(usuario);
  }

  async eliminar(id: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);
    await this.repositorioUsuarios.remove(usuario);
  }

  private async verificarCorreoYRunDisponibles(
    correo?: string,
    run?: string,
    idAIgnorar?: string,
  ): Promise<void> {
    if (correo) {
      const existente = await this.repositorioUsuarios.findOne({ where: { correo } });
      if (existente && existente.id !== idAIgnorar) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
    }
    if (run) {
      const existente = await this.repositorioUsuarios.findOne({ where: { run } });
      if (existente && existente.id !== idAIgnorar) {
        throw new ConflictException('Ya existe un usuario con ese RUN');
      }
    }
  }
}

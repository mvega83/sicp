import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoUsuario } from './entidades/tipo-usuario.entity';
import { CrearTipoUsuarioDto } from './dto/crear-tipo-usuario.dto';
import { ActualizarTipoUsuarioDto } from './dto/actualizar-tipo-usuario.dto';

@Injectable()
export class TipoUsuarioService {
  constructor(
    @InjectRepository(TipoUsuario)
    private readonly repositorioTipoUsuario: Repository<TipoUsuario>,
  ) {}

  async crear(datos: CrearTipoUsuarioDto): Promise<TipoUsuario> {
    const tipoUsuario = this.repositorioTipoUsuario.create(datos);
    return this.repositorioTipoUsuario.save(tipoUsuario);
  }

  async listar(): Promise<TipoUsuario[]> {
    return this.repositorioTipoUsuario.find({ order: { codigo: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<TipoUsuario> {
    const tipoUsuario = await this.repositorioTipoUsuario.findOne({ where: { id } });
    if (!tipoUsuario) {
      throw new NotFoundException(`No existe un tipo de usuario con id "${id}"`);
    }
    return tipoUsuario;
  }

  async actualizar(id: string, datos: ActualizarTipoUsuarioDto): Promise<TipoUsuario> {
    const tipoUsuario = await this.obtenerPorId(id);
    Object.assign(tipoUsuario, datos);
    return this.repositorioTipoUsuario.save(tipoUsuario);
  }

  async eliminar(id: string): Promise<void> {
    const tipoUsuario = await this.obtenerPorId(id);
    await this.repositorioTipoUsuario.remove(tipoUsuario);
  }
}

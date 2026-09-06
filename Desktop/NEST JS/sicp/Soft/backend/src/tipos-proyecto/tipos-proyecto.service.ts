import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoProyecto } from './entidades/tipo-proyecto.entity';
import { CrearTipoProyectoDto } from './dto/crear-tipo-proyecto.dto';
import { ActualizarTipoProyectoDto } from './dto/actualizar-tipo-proyecto.dto';

@Injectable()
export class TiposProyectoService {
  constructor(
    @InjectRepository(TipoProyecto)
    private readonly repositorioTiposProyecto: Repository<TipoProyecto>,
  ) {}

  async crear(datos: CrearTipoProyectoDto): Promise<TipoProyecto> {
    const tipoProyecto = this.repositorioTiposProyecto.create(datos);
    return this.repositorioTiposProyecto.save(tipoProyecto);
  }

  async listar(): Promise<TipoProyecto[]> {
    return this.repositorioTiposProyecto.find({ order: { nombre: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<TipoProyecto> {
    const tipoProyecto = await this.repositorioTiposProyecto.findOne({ where: { id } });
    if (!tipoProyecto) {
      throw new NotFoundException(`No existe un tipo de proyecto con id "${id}"`);
    }
    return tipoProyecto;
  }

  async actualizar(
    id: string,
    datos: ActualizarTipoProyectoDto,
  ): Promise<TipoProyecto> {
    const tipoProyecto = await this.obtenerPorId(id);
    Object.assign(tipoProyecto, datos);
    return this.repositorioTiposProyecto.save(tipoProyecto);
  }

  async eliminar(id: string): Promise<void> {
    const tipoProyecto = await this.obtenerPorId(id);
    await this.repositorioTiposProyecto.remove(tipoProyecto);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidad } from './entidades/unidad.entity';
import { CrearUnidadDto } from './dto/crear-unidad.dto';
import { ActualizarUnidadDto } from './dto/actualizar-unidad.dto';

@Injectable()
export class UnidadesService {
  constructor(
    @InjectRepository(Unidad)
    private readonly repositorioUnidades: Repository<Unidad>,
  ) {}

  async crear(datos: CrearUnidadDto): Promise<Unidad> {
    const unidad = this.repositorioUnidades.create(datos);
    return this.repositorioUnidades.save(unidad);
  }

  async listar(): Promise<Unidad[]> {
    return this.repositorioUnidades.find({ order: { nombre: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<Unidad> {
    const unidad = await this.repositorioUnidades.findOne({ where: { id } });
    if (!unidad) {
      throw new NotFoundException(`No existe una unidad con id "${id}"`);
    }
    return unidad;
  }

  async actualizar(id: string, datos: ActualizarUnidadDto): Promise<Unidad> {
    const unidad = await this.obtenerPorId(id);
    Object.assign(unidad, datos);
    return this.repositorioUnidades.save(unidad);
  }

  async eliminar(id: string): Promise<void> {
    const unidad = await this.obtenerPorId(id);
    await this.repositorioUnidades.remove(unidad);
  }
}

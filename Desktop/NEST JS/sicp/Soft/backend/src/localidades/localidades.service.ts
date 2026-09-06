import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localidad } from './entidades/localidad.entity';
import { CrearLocalidadDto } from './dto/crear-localidad.dto';
import { ActualizarLocalidadDto } from './dto/actualizar-localidad.dto';

@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Localidad)
    private readonly repositorioLocalidades: Repository<Localidad>,
  ) {}

  async crear(datos: CrearLocalidadDto): Promise<Localidad> {
    const localidad = this.repositorioLocalidades.create(datos);
    return this.repositorioLocalidades.save(localidad);
  }

  async listar(): Promise<Localidad[]> {
    return this.repositorioLocalidades.find({ order: { nombre: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<Localidad> {
    const localidad = await this.repositorioLocalidades.findOne({ where: { id } });
    if (!localidad) {
      throw new NotFoundException(`No existe una localidad con id "${id}"`);
    }
    return localidad;
  }

  async actualizar(id: string, datos: ActualizarLocalidadDto): Promise<Localidad> {
    const localidad = await this.obtenerPorId(id);
    Object.assign(localidad, datos);
    return this.repositorioLocalidades.save(localidad);
  }

  async eliminar(id: string): Promise<void> {
    const localidad = await this.obtenerPorId(id);
    await this.repositorioLocalidades.remove(localidad);
  }
}

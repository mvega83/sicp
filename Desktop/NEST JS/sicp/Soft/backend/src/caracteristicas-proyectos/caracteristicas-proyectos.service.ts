import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaracteristicaProyecto } from './entidades/caracteristica-proyecto.entity';
import { CrearCaracteristicaProyectoDto } from './dto/crear-caracteristica-proyecto.dto';
import { ActualizarCaracteristicaProyectoDto } from './dto/actualizar-caracteristica-proyecto.dto';

@Injectable()
export class CaracteristicasProyectosService {
  constructor(
    @InjectRepository(CaracteristicaProyecto)
    private readonly repositorioCaracteristicas: Repository<CaracteristicaProyecto>,
  ) {}

  async crear(datos: CrearCaracteristicaProyectoDto): Promise<CaracteristicaProyecto> {
    const caracteristica = this.repositorioCaracteristicas.create(datos);
    return this.repositorioCaracteristicas.save(caracteristica);
  }

  async listar(): Promise<CaracteristicaProyecto[]> {
    return this.repositorioCaracteristicas.find({ order: { nombre: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<CaracteristicaProyecto> {
    const caracteristica = await this.repositorioCaracteristicas.findOne({ where: { id } });
    if (!caracteristica) {
      throw new NotFoundException(`No existe una característica con id "${id}"`);
    }
    return caracteristica;
  }

  async actualizar(
    id: string,
    datos: ActualizarCaracteristicaProyectoDto,
  ): Promise<CaracteristicaProyecto> {
    const caracteristica = await this.obtenerPorId(id);
    Object.assign(caracteristica, datos);
    return this.repositorioCaracteristicas.save(caracteristica);
  }

  async eliminar(id: string): Promise<void> {
    const caracteristica = await this.obtenerPorId(id);
    await this.repositorioCaracteristicas.remove(caracteristica);
  }
}

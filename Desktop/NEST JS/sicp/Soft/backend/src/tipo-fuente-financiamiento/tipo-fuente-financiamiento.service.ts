import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoFuenteFinanciamiento } from './entidades/tipo-fuente-financiamiento.entity';
import { CrearTipoFuenteFinanciamientoDto } from './dto/crear-tipo-fuente-financiamiento.dto';
import { ActualizarTipoFuenteFinanciamientoDto } from './dto/actualizar-tipo-fuente-financiamiento.dto';

@Injectable()
export class TipoFuenteFinanciamientoService {
  constructor(
    @InjectRepository(TipoFuenteFinanciamiento)
    private readonly repositorio: Repository<TipoFuenteFinanciamiento>,
  ) {}

  async crear(datos: CrearTipoFuenteFinanciamientoDto): Promise<TipoFuenteFinanciamiento> {
    const tipoFuente = this.repositorio.create(datos);
    return this.repositorio.save(tipoFuente);
  }

  async listar(): Promise<TipoFuenteFinanciamiento[]> {
    return this.repositorio.find({ order: { nombre: 'ASC' } });
  }

  async obtenerPorId(id: string): Promise<TipoFuenteFinanciamiento> {
    const tipoFuente = await this.repositorio.findOne({ where: { id } });
    if (!tipoFuente) {
      throw new NotFoundException(`No existe una fuente de financiamiento con id "${id}"`);
    }
    return tipoFuente;
  }

  async actualizar(
    id: string,
    datos: ActualizarTipoFuenteFinanciamientoDto,
  ): Promise<TipoFuenteFinanciamiento> {
    const tipoFuente = await this.obtenerPorId(id);
    Object.assign(tipoFuente, datos);
    return this.repositorio.save(tipoFuente);
  }

  async eliminar(id: string): Promise<void> {
    const tipoFuente = await this.obtenerPorId(id);
    await this.repositorio.remove(tipoFuente);
  }
}

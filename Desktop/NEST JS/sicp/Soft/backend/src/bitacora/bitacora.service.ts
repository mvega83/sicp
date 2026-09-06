import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bitacora, EtapaProyecto } from './entidades/bitacora.entity';

interface NuevoEventoBitacora {
  idProyecto: string;
  etapa: EtapaProyecto;
  descripcion: string;
  usuario: string;
}

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bitacora)
    private readonly repositorioBitacora: Repository<Bitacora>,
  ) {}

  /** Cada módulo de etapa llama esto después de crear/editar algo, para dejar registro de qué pasó y quién lo hizo. */
  async registrarEvento(datos: NuevoEventoBitacora): Promise<Bitacora> {
    const evento = this.repositorioBitacora.create(datos);
    return this.repositorioBitacora.save(evento);
  }

  async listarPorProyecto(idProyecto: string, etapa?: EtapaProyecto): Promise<Bitacora[]> {
    return this.repositorioBitacora.find({
      where: etapa ? { idProyecto, etapa } : { idProyecto },
      order: { fecha: 'DESC' },
    });
  }
}

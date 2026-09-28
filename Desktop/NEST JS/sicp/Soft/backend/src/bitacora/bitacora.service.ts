import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bitacora, EtapaProyecto } from './entidades/bitacora.entity';
import { Proyecto } from '../proyectos/entidades/proyecto.entity';

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
    @InjectRepository(Proyecto)
    private readonly repositorioProyectos: Repository<Proyecto>,
  ) {}

  /** Cada módulo de etapa llama esto después de crear/editar algo, para dejar registro de qué pasó y quién lo hizo. */
  async registrarEvento(datos: NuevoEventoBitacora): Promise<Bitacora> {
    const evento = this.repositorioBitacora.create(datos);
    return this.repositorioBitacora.save(evento);
  }

  /**
   * Comentario manual que agrega el propio usuario (ej. desde el botón flotante de
   * bitácora). A diferencia de "registrarEvento" (usado internamente por los otros
   * módulos, que sí conocen y pasan su propia etapa), acá la etapa NO la decide el
   * cliente: siempre queda etiquetada con la etapa actual del proyecto, para que un
   * comentario nunca pueda registrarse "en el pasado" ni falsificar en qué etapa se
   * escribió.
   */
  async agregarComentario(idProyecto: string, descripcion: string, usuario: string): Promise<Bitacora> {
    const proyecto = await this.repositorioProyectos.findOne({ where: { id: idProyecto } });
    if (!proyecto) {
      throw new NotFoundException(`No existe un proyecto con id "${idProyecto}"`);
    }
    return this.registrarEvento({ idProyecto, etapa: proyecto.etapaActual, descripcion, usuario });
  }

  async listarPorProyecto(idProyecto: string, etapa?: EtapaProyecto): Promise<Bitacora[]> {
    return this.repositorioBitacora.find({
      where: etapa ? { idProyecto, etapa } : { idProyecto },
      order: { fecha: 'DESC' },
    });
  }

  /**
   * Permite corregir la descripción de un evento ya registrado (ej. un error de
   * tipeo en una observación manual) — pero solo mientras el proyecto sigue en la
   * misma etapa en la que se escribió el comentario. Una vez que el proyecto avanza
   * de etapa, los comentarios de etapas anteriores quedan congelados como registro
   * histórico: siguen siendo visibles, pero ya no editables. Misma regla para
   * cualquier etapa del ciclo de vida del proyecto.
   */
  async actualizarEvento(id: string, descripcion: string): Promise<Bitacora> {
    const evento = await this.repositorioBitacora.findOne({ where: { id } });
    if (!evento) {
      throw new NotFoundException(`No existe un evento de bitácora con id "${id}"`);
    }
    const proyecto = await this.repositorioProyectos.findOne({ where: { id: evento.idProyecto } });
    if (!proyecto || evento.etapa !== proyecto.etapaActual) {
      throw new ForbiddenException(
        'Solo se pueden editar observaciones registradas en la etapa actual del proyecto.',
      );
    }
    evento.descripcion = descripcion;
    return this.repositorioBitacora.save(evento);
  }
}

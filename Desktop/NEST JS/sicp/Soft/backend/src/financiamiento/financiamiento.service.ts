import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuenteFinanciamiento } from './entidades/fuente-financiamiento.entity';
import { CrearFinanciamientoDto } from './dto/crear-financiamiento.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class FinanciamientoService {
  constructor(
    @InjectRepository(FuenteFinanciamiento)
    private readonly repositorioFinanciamiento: Repository<FuenteFinanciamiento>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearFinanciamientoDto, nombreUsuario: string): Promise<FuenteFinanciamiento> {
    // Lanza NotFoundException si el proyecto no existe, antes de crear nada.
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const fuente = this.repositorioFinanciamiento.create(datos);
    const fuenteGuardada = await this.repositorioFinanciamiento.save(fuente);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.FINANCIAMIENTO,
      descripcion: `Se agregó la fuente de financiamiento "${datos.nombreFuente}" por $${datos.monto}.`,
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.FINANCIAMIENTO);

    return fuenteGuardada;
  }

  async listarPorProyecto(idProyecto: string): Promise<FuenteFinanciamiento[]> {
    return this.repositorioFinanciamiento.find({
      where: { idProyecto },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async eliminar(id: string): Promise<void> {
    const fuente = await this.repositorioFinanciamiento.findOne({ where: { id } });
    if (!fuente) {
      throw new NotFoundException(`No existe una fuente de financiamiento con id "${id}"`);
    }
    await this.repositorioFinanciamiento.remove(fuente);
  }
}

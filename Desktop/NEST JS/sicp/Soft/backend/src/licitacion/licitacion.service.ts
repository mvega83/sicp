import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licitacion } from './entidades/licitacion.entity';
import { CrearLicitacionDto } from './dto/crear-licitacion.dto';
import { ActualizarLicitacionDto } from './dto/actualizar-licitacion.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class LicitacionService {
  constructor(
    @InjectRepository(Licitacion)
    private readonly repositorioLicitacion: Repository<Licitacion>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearLicitacionDto, nombreUsuario: string): Promise<Licitacion> {
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const licitacion = this.repositorioLicitacion.create(datos);
    const licitacionGuardada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: `Se creó la licitación ${datos.idLicitacionExterna}, responsable ${datos.responsable}.`,
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.LICITACION);

    return licitacionGuardada;
  }

  async listarPorProyecto(idProyecto: string): Promise<Licitacion[]> {
    return this.repositorioLicitacion.find({
      where: { idProyecto },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerPorId(id: string): Promise<Licitacion> {
    const licitacion = await this.repositorioLicitacion.findOne({ where: { id } });
    if (!licitacion) {
      throw new NotFoundException(`No existe una licitación con id "${id}"`);
    }
    return licitacion;
  }

  async actualizar(
    id: string,
    datos: ActualizarLicitacionDto,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);
    Object.assign(licitacion, datos);
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: 'Se actualizaron los datos de la licitación.',
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }

  async adjuntarRex(id: string, urlArchivo: string, nombreUsuario: string): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);
    licitacion.archivoRex = urlArchivo;
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: 'Se adjuntó la REX de licitación.',
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }
}

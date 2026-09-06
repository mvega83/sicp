import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finalizacion } from './entidades/finalizacion.entity';
import { CrearFinalizacionDto } from './dto/crear-finalizacion.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class FinalizacionService {
  constructor(
    @InjectRepository(Finalizacion)
    private readonly repositorioFinalizacion: Repository<Finalizacion>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearFinalizacionDto, nombreUsuario: string): Promise<Finalizacion> {
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const finalizacion = this.repositorioFinalizacion.create(datos);
    const finalizacionGuardada = await this.repositorioFinalizacion.save(finalizacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.FINALIZACION,
      descripcion: 'Se cerró el proyecto.',
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.FINALIZACION);

    return finalizacionGuardada;
  }

  async obtenerPorProyecto(idProyecto: string): Promise<Finalizacion | null> {
    return this.repositorioFinalizacion.findOne({ where: { idProyecto } });
  }

  async adjuntarDocumentoCierre(
    id: string,
    urlArchivo: string,
    nombreUsuario: string,
  ): Promise<Finalizacion> {
    const finalizacion = await this.repositorioFinalizacion.findOne({ where: { id } });
    if (!finalizacion) {
      throw new NotFoundException(`No existe un registro de finalización con id "${id}"`);
    }
    finalizacion.documentoCierre = urlArchivo;
    const finalizacionActualizada = await this.repositorioFinalizacion.save(finalizacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: finalizacion.idProyecto,
      etapa: EtapaProyecto.FINALIZACION,
      descripcion: 'Se adjuntó el documento de cierre.',
      usuario: nombreUsuario,
    });

    return finalizacionActualizada;
  }
}

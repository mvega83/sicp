import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoAprobacion } from './entidades/documento-aprobacion.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class AprobacionService {
  constructor(
    @InjectRepository(DocumentoAprobacion)
    private readonly repositorioDocumentos: Repository<DocumentoAprobacion>,
    private readonly proyectosService: ProyectosService,
  ) {}

  async agregarDocumento(idProyecto: string, url: string): Promise<DocumentoAprobacion> {
    await this.proyectosService.obtenerPorId(idProyecto);
    const documento = this.repositorioDocumentos.create({ idProyecto, url });
    return this.repositorioDocumentos.save(documento);
  }

  async listarDocumentos(idProyecto: string): Promise<DocumentoAprobacion[]> {
    return this.repositorioDocumentos.find({
      where: { idProyecto },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerDocumento(id: string): Promise<DocumentoAprobacion> {
    const documento = await this.repositorioDocumentos.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`No existe un documento de aprobación con id "${id}"`);
    }
    return documento;
  }

  async eliminarDocumento(id: string): Promise<void> {
    const documento = await this.obtenerDocumento(id);
    await this.repositorioDocumentos.remove(documento);
  }
}

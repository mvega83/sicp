import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuenteFinanciamiento } from './entidades/fuente-financiamiento.entity';
import { DocumentoFinanciamiento } from './entidades/documento-financiamiento.entity';
import { DecretoFinanciamiento } from './entidades/decreto-financiamiento.entity';
import { TipoFuenteFinanciamiento } from '../tipo-fuente-financiamiento/entidades/tipo-fuente-financiamiento.entity';
import { CrearFinanciamientoDto } from './dto/crear-financiamiento.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class FinanciamientoService {
  constructor(
    @InjectRepository(FuenteFinanciamiento)
    private readonly repositorioFinanciamiento: Repository<FuenteFinanciamiento>,
    @InjectRepository(DocumentoFinanciamiento)
    private readonly repositorioDocumentos: Repository<DocumentoFinanciamiento>,
    @InjectRepository(DecretoFinanciamiento)
    private readonly repositorioDecretos: Repository<DecretoFinanciamiento>,
    @InjectRepository(TipoFuenteFinanciamiento)
    private readonly repositorioTiposFuente: Repository<TipoFuenteFinanciamiento>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearFinanciamientoDto, nombreUsuario: string): Promise<FuenteFinanciamiento> {
    // Lanza NotFoundException si el proyecto no existe, antes de crear nada.
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const tipoFuente = await this.repositorioTiposFuente.findOne({
      where: { id: datos.idTipoFuenteFinanciamiento },
    });
    if (!tipoFuente) {
      throw new NotFoundException(
        `No existe un tipo de fuente de financiamiento con id "${datos.idTipoFuenteFinanciamiento}"`,
      );
    }

    // Chequeo explícito además de la restricción @Unique de la entidad: así el
    // usuario recibe un mensaje claro en vez del error crudo de MySQL por
    // duplicado (ER_DUP_ENTRY).
    const yaExiste = await this.repositorioFinanciamiento.findOne({
      where: { idProyecto: datos.idProyecto, idTipoFuenteFinanciamiento: datos.idTipoFuenteFinanciamiento },
    });
    if (yaExiste) {
      throw new ConflictException(
        `El proyecto ya tiene agregada la fuente de financiamiento "${tipoFuente.nombre}".`,
      );
    }

    const fuente = this.repositorioFinanciamiento.create(datos);
    const fuenteGuardada = await this.repositorioFinanciamiento.save(fuente);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.FINANCIAMIENTO,
      descripcion: `Se agregó la fuente de financiamiento "${tipoFuente.nombre}" por $${datos.monto}.`,
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.FINANCIAMIENTO);

    return fuenteGuardada;
  }

  async listarPorProyecto(idProyecto: string): Promise<FuenteFinanciamiento[]> {
    return this.repositorioFinanciamiento.find({
      where: { idProyecto },
      relations: { tipoFuenteFinanciamiento: true },
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

  async agregarDocumento(idProyecto: string, url: string): Promise<DocumentoFinanciamiento> {
    await this.proyectosService.obtenerPorId(idProyecto);
    const documento = this.repositorioDocumentos.create({ idProyecto, url });
    return this.repositorioDocumentos.save(documento);
  }

  async listarDocumentos(idProyecto: string): Promise<DocumentoFinanciamiento[]> {
    return this.repositorioDocumentos.find({
      where: { idProyecto },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerDocumento(id: string): Promise<DocumentoFinanciamiento> {
    const documento = await this.repositorioDocumentos.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`No existe un documento de financiamiento con id "${id}"`);
    }
    return documento;
  }

  async eliminarDocumento(id: string): Promise<void> {
    const documento = await this.obtenerDocumento(id);
    await this.repositorioDocumentos.remove(documento);
  }

  async agregarDecreto(
    idFuenteFinanciamiento: string,
    fechaDecreto: string,
    urlDecreto: string,
  ): Promise<DecretoFinanciamiento> {
    const fuente = await this.repositorioFinanciamiento.findOne({ where: { id: idFuenteFinanciamiento } });
    if (!fuente) {
      throw new NotFoundException(
        `No existe una fuente de financiamiento con id "${idFuenteFinanciamiento}"`,
      );
    }
    const decreto = this.repositorioDecretos.create({ idFuenteFinanciamiento, fechaDecreto, urlDecreto });
    return this.repositorioDecretos.save(decreto);
  }

  async listarDecretosPorFuente(idFuenteFinanciamiento: string): Promise<DecretoFinanciamiento[]> {
    return this.repositorioDecretos.find({
      where: { idFuenteFinanciamiento },
      order: { fechaDecreto: 'DESC' },
    });
  }

  async obtenerDecreto(id: string): Promise<DecretoFinanciamiento> {
    const decreto = await this.repositorioDecretos.findOne({ where: { id } });
    if (!decreto) {
      throw new NotFoundException(`No existe un decreto de financiamiento con id "${id}"`);
    }
    return decreto;
  }

  async eliminarDecreto(id: string): Promise<void> {
    const decreto = await this.obtenerDecreto(id);
    await this.repositorioDecretos.remove(decreto);
  }
}

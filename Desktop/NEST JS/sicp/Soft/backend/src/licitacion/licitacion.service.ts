import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Licitacion, ResultadoAdjudicacion } from './entidades/licitacion.entity';
import { CrearLicitacionDto } from './dto/crear-licitacion.dto';
import { CompletarDatosLicitacionDto } from './dto/completar-datos-licitacion.dto';
import { EditarResolucionDto } from './dto/editar-resolucion.dto';
import { RegistrarAdjudicacionDto } from './dto/registrar-adjudicacion.dto';
import { RegistrarRexAdjudicacionDto } from './dto/registrar-rex-adjudicacion.dto';
import { RegistrarItoDto } from './dto/registrar-ito.dto';
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

  // Etapa 1: registra el Solicitante que da inicio a la licitación.
  async crear(
    datos: CrearLicitacionDto,
    urlDocumentoBasesTecnicas: string,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    // idUnidadIto null significa que esa licitación todavía no completó la
    // etapa 6 ("en progreso"). No tiene sentido abrir una segunda licitación
    // mientras la anterior no se cierra.
    const licitacionEnProgreso = await this.repositorioLicitacion.findOne({
      where: { idProyecto: datos.idProyecto, idUnidadIto: IsNull() },
    });
    if (licitacionEnProgreso) {
      throw new BadRequestException(
        'Ya hay una licitación en progreso para este proyecto; completa sus datos antes de iniciar una nueva.',
      );
    }

    const licitacion = this.repositorioLicitacion.create({
      idProyecto: datos.idProyecto,
      idUnidad: datos.idUnidad,
      fechaSolicitud: datos.fechaSolicitud,
      documentoBasesTecnicas: urlDocumentoBasesTecnicas,
    });
    const licitacionGuardada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: 'Se registró el solicitante de una nueva licitación.',
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.LICITACION);

    return licitacionGuardada;
  }

  async listarPorProyecto(idProyecto: string): Promise<Licitacion[]> {
    return this.repositorioLicitacion.find({
      where: { idProyecto },
      relations: { unidad: true, unidadIto: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerPorId(id: string): Promise<Licitacion> {
    const licitacion = await this.repositorioLicitacion.findOne({
      where: { id },
      relations: { unidad: true, unidadIto: true },
    });
    if (!licitacion) {
      throw new NotFoundException(`No existe una licitación con id "${id}"`);
    }
    return licitacion;
  }

  // Etapa 2: completa la Resolución (requiere que el Solicitante ya exista,
  // porque este método solo opera sobre un registro ya creado) y también sirve
  // para editarla después, mientras la licitación siga "en progreso"
  // (idLicitacionExterna null): una vez que se completan los Datos de la
  // licitación (etapa 3) y pasa al historial, la Resolución queda congelada
  // como registro. `urlNuevoDocumento` es obligatorio la primera vez (todavía
  // no hay ningún PDF guardado); en las ediciones siguientes es opcional — si
  // no se adjunta uno nuevo, se mantiene el que ya estaba guardado.
  async editarResolucion(
    id: string,
    datos: EditarResolucionDto,
    urlNuevoDocumento: string | null,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);

    if (licitacion.idLicitacionExterna) {
      throw new BadRequestException(
        'No se puede editar la resolución de una licitación cuyos datos ya están completos.',
      );
    }
    if (!urlNuevoDocumento && !licitacion.documentoResolucion) {
      throw new BadRequestException('Debes adjuntar el PDF de la resolución.');
    }

    licitacion.numeroResolucion = datos.numeroResolucion;
    licitacion.fechaResolucion = datos.fechaResolucion;
    if (urlNuevoDocumento) {
      licitacion.documentoResolucion = urlNuevoDocumento;
    }
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: `Se guardó la resolución N° ${datos.numeroResolucion}.`,
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }

  // Etapa 3: completa los datos de la licitación (requiere que la Resolución ya
  // esté completa).
  async completarDatosLicitacion(
    id: string,
    datos: CompletarDatosLicitacionDto,
    urlDocumentoPreguntasRespuestas: string,
    urlDocumentoRexRespuestas: string | null,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);

    if (!licitacion.numeroResolucion) {
      throw new BadRequestException('Debes completar la Resolución antes de los datos de la licitación.');
    }
    // Si ya tiene idLicitacionExterna, esta licitación ya cerró su etapa 3 antes;
    // no se debe poder sobreescribir desde este flujo.
    if (licitacion.idLicitacionExterna) {
      throw new BadRequestException('Esta licitación ya tiene sus datos completos.');
    }

    Object.assign(licitacion, datos, {
      documentoPreguntasRespuestas: urlDocumentoPreguntasRespuestas,
      documentoRexRespuestas: urlDocumentoRexRespuestas,
    });
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: `Se completaron los datos de la licitación ${datos.idLicitacionExterna}.`,
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }

  // Etapa 4: registra el resultado de la Adjudicación (requiere que los Datos
  // de la licitación ya estén completos). `urlActaEvaluacion`/`urlActaDesierta`
  // llegan nulos salvo el que corresponda según `datos.resultado` (el
  // controller solo sube el archivo del campo que se usó).
  async registrarAdjudicacion(
    id: string,
    datos: RegistrarAdjudicacionDto,
    urlActaEvaluacion: string | null,
    urlActaDesierta: string | null,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);

    if (!licitacion.idLicitacionExterna) {
      throw new BadRequestException('Debes completar los Datos de la licitación antes de registrar la Adjudicación.');
    }
    if (licitacion.resultadoAdjudicacion) {
      throw new BadRequestException('Esta licitación ya tiene un resultado de adjudicación registrado.');
    }

    if (datos.resultado === ResultadoAdjudicacion.ADJUDICADO) {
      if (!urlActaEvaluacion) {
        throw new BadRequestException('Debes adjuntar el acta de evaluación.');
      }
      licitacion.resultadoAdjudicacion = ResultadoAdjudicacion.ADJUDICADO;
      licitacion.nombreProveedor = datos.nombreProveedor ?? null;
      licitacion.rutProveedor = datos.rutProveedor ?? null;
      licitacion.telefonoProveedor = datos.telefonoProveedor ?? null;
      licitacion.correoProveedor = datos.correoProveedor ?? null;
      licitacion.nombreEncargadoProveedor = datos.nombreEncargadoProveedor ?? null;
      licitacion.montoAdjudicacion = datos.montoAdjudicacion ?? null;
      licitacion.documentoActaEvaluacion = urlActaEvaluacion;
    } else {
      if (!urlActaDesierta) {
        throw new BadRequestException('Debes adjuntar el acta de la licitación desierta.');
      }
      licitacion.resultadoAdjudicacion = ResultadoAdjudicacion.DESIERTA;
      licitacion.fechaDesierta = datos.fechaDesierta ?? null;
      licitacion.documentoActaDesierta = urlActaDesierta;
    }

    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion:
        datos.resultado === ResultadoAdjudicacion.ADJUDICADO
          ? `Se adjudicó la licitación a ${datos.nombreProveedor}.`
          : 'Se declaró desierta la licitación.',
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }

  // Etapa 5: registra la REX de adjudicación (requiere que la Adjudicación ya
  // esté completa). Aplica igual para ambos resultados de la etapa 4.
  async registrarRexAdjudicacion(
    id: string,
    datos: RegistrarRexAdjudicacionDto,
    urlDocumento: string,
    nombreUsuario: string,
  ): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);

    if (!licitacion.resultadoAdjudicacion) {
      throw new BadRequestException('Debes registrar la Adjudicación antes de la REX de adjudicación.');
    }
    if (licitacion.numeroRexAdjudicacion) {
      throw new BadRequestException('Esta licitación ya tiene una REX de adjudicación registrada.');
    }

    licitacion.numeroRexAdjudicacion = datos.numeroRexAdjudicacion;
    licitacion.fechaRexAdjudicacion = datos.fechaRexAdjudicacion;
    licitacion.documentoRexAdjudicacion = urlDocumento;
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: `Se registró la REX de adjudicación N° ${datos.numeroRexAdjudicacion}.`,
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }

  // Etapa 6: registra el ITO (requiere que la REX de adjudicación ya esté
  // completa). Es el último paso: al completarse, la licitación deja de estar
  // "en progreso" y pasa al historial.
  async registrarIto(id: string, datos: RegistrarItoDto, nombreUsuario: string): Promise<Licitacion> {
    const licitacion = await this.obtenerPorId(id);

    if (!licitacion.numeroRexAdjudicacion) {
      throw new BadRequestException('Debes registrar la REX de adjudicación antes del ITO.');
    }
    if (licitacion.nombreIto) {
      throw new BadRequestException('Esta licitación ya tiene un ITO registrado.');
    }

    licitacion.idUnidadIto = datos.idUnidadIto;
    licitacion.nombreIto = datos.nombreIto;
    const licitacionActualizada = await this.repositorioLicitacion.save(licitacion);

    await this.bitacoraService.registrarEvento({
      idProyecto: licitacion.idProyecto,
      etapa: EtapaProyecto.LICITACION,
      descripcion: `Se registró el ITO: ${datos.nombreIto}.`,
      usuario: nombreUsuario,
    });

    return licitacionActualizada;
  }
}

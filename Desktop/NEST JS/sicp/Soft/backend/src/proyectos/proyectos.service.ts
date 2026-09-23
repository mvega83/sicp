import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Proyecto } from './entidades/proyecto.entity';
import { CaracteristicaProyecto } from '../caracteristicas-proyectos/entidades/caracteristica-proyecto.entity';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repositorioProyectos: Repository<Proyecto>,
    @InjectRepository(CaracteristicaProyecto)
    private readonly repositorioCaracteristicas: Repository<CaracteristicaProyecto>,
    private readonly bitacoraService: BitacoraService,
  ) {}

  async crear(datos: CrearProyectoDto, nombreUsuario: string): Promise<Proyecto> {
    // idsCaracteristicas no existe en la entidad Proyecto (esta espera objetos
    // CaracteristicaProyecto, no ids sueltos), así que se separa del resto de los
    // datos y se resuelve a entidades antes de guardar.
    const { idsCaracteristicas, ...datosProyecto } = datos;
    const proyecto = this.repositorioProyectos.create({
      ...datosProyecto,
      etapaActual: EtapaProyecto.BANCO_IDEAS,
    });
    if (idsCaracteristicas && idsCaracteristicas.length > 0) {
      proyecto.caracteristicas = await this.repositorioCaracteristicas.findBy({
        id: In(idsCaracteristicas),
      });
    }
    const proyectoGuardado = await this.repositorioProyectos.save(proyecto);

    await this.bitacoraService.registrarEvento({
      idProyecto: proyectoGuardado.id,
      etapa: EtapaProyecto.BANCO_IDEAS,
      descripcion: `Se ingresó la idea "${proyectoGuardado.nombre}" al banco de ideas.`,
      usuario: nombreUsuario,
    });

    return proyectoGuardado;
  }

  async listar(etapa?: EtapaProyecto): Promise<Proyecto[]> {
    return this.repositorioProyectos.find({
      where: etapa ? { etapaActual: etapa } : {},
      relations: { tipoProyecto: true, localidad: true, caracteristicas: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerPorId(id: string): Promise<Proyecto> {
    const proyecto = await this.repositorioProyectos.findOne({
      where: { id },
      relations: { tipoProyecto: true, localidad: true, caracteristicas: true },
    });
    if (!proyecto) {
      throw new NotFoundException(`No existe un proyecto con id "${id}"`);
    }
    return proyecto;
  }

  async actualizar(
    id: string,
    datos: ActualizarProyectoDto,
    nombreUsuario: string,
  ): Promise<Proyecto> {
    const proyecto = await this.obtenerPorId(id);
    this.validarQueSigaEnBancoIdeas(proyecto);

    // idsCaracteristicas no es una propiedad de la entidad: si se dejara dentro de
    // "datos", Object.assign la copiaría igual como propiedad suelta sin sentido.
    // Se comprueba "!== undefined" (y no solo el arreglo) para permitir que un
    // arreglo vacío signifique explícitamente "quitar todas las características".
    const { idsCaracteristicas, ...datosProyecto } = datos;
    if (idsCaracteristicas !== undefined) {
      proyecto.caracteristicas =
        idsCaracteristicas.length > 0
          ? await this.repositorioCaracteristicas.findBy({ id: In(idsCaracteristicas) })
          : [];
    }

    Object.assign(proyecto, datosProyecto);
    const proyectoActualizado = await this.repositorioProyectos.save(proyecto);

    await this.bitacoraService.registrarEvento({
      idProyecto: id,
      etapa: EtapaProyecto.BANCO_IDEAS,
      descripcion: 'Se actualizaron los datos generales del proyecto.',
      usuario: nombreUsuario,
    });

    return proyectoActualizado;
  }

  async agregarImagen(
    id: string,
    urlImagen: string,
    nombreUsuario: string,
  ): Promise<Proyecto> {
    const proyecto = await this.obtenerPorId(id);
    this.validarQueSigaEnBancoIdeas(proyecto);
    proyecto.imagenes = [...(proyecto.imagenes ?? []), urlImagen];
    const proyectoActualizado = await this.repositorioProyectos.save(proyecto);

    await this.bitacoraService.registrarEvento({
      idProyecto: id,
      etapa: EtapaProyecto.BANCO_IDEAS,
      descripcion: 'Se agregó una imagen al proyecto.',
      usuario: nombreUsuario,
    });

    return proyectoActualizado;
  }

  /**
   * "nombreArchivo" es solo el nombre (ej. "abc123.pdf"), no la URL completa — se
   * compara con url.endsWith(...) para que funcione sin importar si la URL guardada
   * quedó en el formato viejo ("/archivos-subidos/proyectos/...") o el nuevo
   * ("/visor/..."). El archivo físico se borra aparte, en el controller (ver
   * ArchivosService.eliminarArchivoFisico), antes de llamar a este método.
   */
  async eliminarImagen(
    id: string,
    nombreArchivo: string,
    nombreUsuario: string,
  ): Promise<Proyecto> {
    const proyecto = await this.obtenerPorId(id);
    this.validarQueSigaEnBancoIdeas(proyecto);
    proyecto.imagenes = (proyecto.imagenes ?? []).filter((url) => !url.endsWith(nombreArchivo));
    const proyectoActualizado = await this.repositorioProyectos.save(proyecto);

    await this.bitacoraService.registrarEvento({
      idProyecto: id,
      etapa: EtapaProyecto.BANCO_IDEAS,
      descripcion: 'Se eliminó un archivo adjunto del proyecto.',
      usuario: nombreUsuario,
    });

    return proyectoActualizado;
  }

  /**
   * Los datos, imágenes y archivos adjuntos del banco de ideas solo tienen sentido
   * mientras el proyecto sigue en esa etapa: una vez que avanzó (financiamiento,
   * licitación, etc.) esa información pasa a ser un registro histórico y no debería
   * poder cambiarse. Se centraliza acá la validación en vez de repetirla en cada
   * método para que la regla quede en un solo lugar y aplique por igual a
   * "actualizar", "agregarImagen" y "eliminarImagen": los tres modifican contenido
   * de banco de ideas y sería inconsistente congelar los datos generales pero seguir
   * permitiendo subir o borrar imágenes.
   */
  private validarQueSigaEnBancoIdeas(proyecto: Proyecto): void {
    if (proyecto.etapaActual !== EtapaProyecto.BANCO_IDEAS) {
      throw new ForbiddenException('No se puede editar un proyecto que ya avanzó de etapa.');
    }
  }

  async eliminar(id: string): Promise<void> {
    const proyecto = await this.obtenerPorId(id);
    await this.repositorioProyectos.remove(proyecto);
  }

  /**
   * Los módulos de las etapas 2 a 6 llaman esto al crear su primer registro para un
   * proyecto, para que el proyecto "avance" de etapa. No lanza error si el proyecto
   * no existe — simplemente no hace nada — para no romper el flujo de la etapa que
   * está creando su propio registro.
   */
  async avanzarEtapa(id: string, nuevaEtapa: EtapaProyecto): Promise<void> {
    await this.repositorioProyectos.update({ id }, { etapaActual: nuevaEtapa });
  }

  /**
   * A diferencia de "avanzarEtapa" (uso interno de otros módulos al crear su propio
   * registro), esto lo dispara el usuario a propósito desde Banco de Ideas con el
   * botón "Enviar a Financiamiento", así que sí valida la etapa actual y deja
   * registro explícito en la bitácora del cambio.
   */
  async enviarAFinanciamiento(id: string, nombreUsuario: string): Promise<Proyecto> {
    const proyecto = await this.obtenerPorId(id);
    this.validarQueSigaEnBancoIdeas(proyecto);

    await this.avanzarEtapa(id, EtapaProyecto.FINANCIAMIENTO);
    await this.bitacoraService.registrarEvento({
      idProyecto: id,
      etapa: EtapaProyecto.FINANCIAMIENTO,
      descripcion: 'El proyecto se envió desde banco de ideas a la etapa de Financiamiento.',
      usuario: nombreUsuario,
    });

    return this.obtenerPorId(id);
  }
}

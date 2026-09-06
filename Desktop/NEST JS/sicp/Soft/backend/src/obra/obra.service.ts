import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoPago } from './entidades/estado-pago.entity';
import { CrearEstadoPagoDto } from './dto/crear-estado-pago.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class ObraService {
  constructor(
    @InjectRepository(EstadoPago)
    private readonly repositorioEstadoPago: Repository<EstadoPago>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearEstadoPagoDto, nombreUsuario: string): Promise<EstadoPago> {
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const estadoPago = this.repositorioEstadoPago.create(datos);
    const estadoPagoGuardado = await this.repositorioEstadoPago.save(estadoPago);

    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.OBRA,
      descripcion: `Se registró el estado de pago N°${datos.numeroEstadoPago} por $${datos.monto} (ITO: ${datos.ito}).`,
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.OBRA);

    return estadoPagoGuardado;
  }

  async listarPorProyecto(idProyecto: string): Promise<EstadoPago[]> {
    return this.repositorioEstadoPago.find({
      where: { idProyecto },
      order: { numeroEstadoPago: 'ASC' },
    });
  }

  async obtenerPorId(id: string): Promise<EstadoPago> {
    const estadoPago = await this.repositorioEstadoPago.findOne({ where: { id } });
    if (!estadoPago) {
      throw new NotFoundException(`No existe un estado de pago con id "${id}"`);
    }
    return estadoPago;
  }

  async adjuntarDocumento(
    id: string,
    urlArchivo: string,
    nombreUsuario: string,
  ): Promise<EstadoPago> {
    const estadoPago = await this.obtenerPorId(id);
    estadoPago.documentoAdjunto = urlArchivo;
    const estadoPagoActualizado = await this.repositorioEstadoPago.save(estadoPago);

    await this.bitacoraService.registrarEvento({
      idProyecto: estadoPago.idProyecto,
      etapa: EtapaProyecto.OBRA,
      descripcion: `Se adjuntó un documento al estado de pago N°${estadoPago.numeroEstadoPago}.`,
      usuario: nombreUsuario,
    });

    return estadoPagoActualizado;
  }
}

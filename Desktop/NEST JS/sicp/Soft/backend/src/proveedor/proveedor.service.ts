import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entidades/proveedor.entity';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import { EtapaProyecto } from '../bitacora/entidades/bitacora.entity';
import { ProyectosService } from '../proyectos/proyectos.service';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repositorioProveedor: Repository<Proveedor>,
    private readonly bitacoraService: BitacoraService,
    private readonly proyectosService: ProyectosService,
  ) {}

  async crear(datos: CrearProveedorDto, nombreUsuario: string): Promise<Proveedor> {
    await this.proyectosService.obtenerPorId(datos.idProyecto);

    const proveedor = this.repositorioProveedor.create(datos);
    const proveedorGuardado = await this.repositorioProveedor.save(proveedor);

    // No se incluyen los datos bancarios en la descripción de la bitácora: es un
    // registro que puede quedar visible para más personas de las que deberían ver
    // esos datos.
    await this.bitacoraService.registrarEvento({
      idProyecto: datos.idProyecto,
      etapa: EtapaProyecto.PROVEEDOR,
      descripcion: `Se registró al proveedor "${datos.nombreEmpresa}".`,
      usuario: nombreUsuario,
    });
    await this.proyectosService.avanzarEtapa(datos.idProyecto, EtapaProyecto.PROVEEDOR);

    return proveedorGuardado;
  }

  async listarPorProyecto(idProyecto: string): Promise<Proveedor[]> {
    return this.repositorioProveedor.find({
      where: { idProyecto },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerPorId(id: string): Promise<Proveedor> {
    const proveedor = await this.repositorioProveedor.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`No existe un proveedor con id "${id}"`);
    }
    return proveedor;
  }

  async adjuntarBoletaGarantia(
    id: string,
    urlArchivo: string,
    nombreUsuario: string,
  ): Promise<Proveedor> {
    const proveedor = await this.obtenerPorId(id);
    proveedor.boletaGarantia = urlArchivo;
    const proveedorActualizado = await this.repositorioProveedor.save(proveedor);

    await this.bitacoraService.registrarEvento({
      idProyecto: proveedor.idProyecto,
      etapa: EtapaProyecto.PROVEEDOR,
      descripcion: 'Se adjuntó la boleta de garantía.',
      usuario: nombreUsuario,
    });

    return proveedorActualizado;
  }
}

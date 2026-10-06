import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado';
import { LicitacionService } from './licitacion.service';
import { CrearLicitacionDto } from './dto/crear-licitacion.dto';
import { CompletarDatosLicitacionDto } from './dto/completar-datos-licitacion.dto';
import { EditarResolucionDto } from './dto/editar-resolucion.dto';
import { RegistrarAdjudicacionDto } from './dto/registrar-adjudicacion.dto';
import { RegistrarRexAdjudicacionDto } from './dto/registrar-rex-adjudicacion.dto';
import { RegistrarItoDto } from './dto/registrar-ito.dto';
import { ResultadoAdjudicacion } from './entidades/licitacion.entity';
import { ArchivosService } from '../archivos/archivos.service';
import { opcionesMulter } from '../archivos/opciones-multer';

@Controller('licitacion')
@UseGuards(JwtAuthGuard)
export class LicitacionController {
  constructor(
    private readonly licitacionService: LicitacionService,
    private readonly archivosService: ArchivosService,
  ) {}

  // Etapa 1: Solicitante. Multipart porque va junto con el PDF de bases técnicas.
  @Post()
  @UseInterceptors(FileInterceptor('archivo', opcionesMulter('licitaciones', ['.pdf'])))
  async crear(
    @Body() datos: CrearLicitacionDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    if (!archivo) {
      throw new BadRequestException('Debes adjuntar el PDF de bases técnicas');
    }
    const urlDocumento = await this.archivosService.guardarArchivo(archivo);
    return this.licitacionService.crear(
      datos,
      urlDocumento,
      `${req.user.nombres} ${req.user.apellidos}`,
    );
  }

  @Get()
  listar(@Query('idProyecto') idProyecto: string) {
    return this.licitacionService.listarPorProyecto(idProyecto);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.licitacionService.obtenerPorId(id);
  }

  // Etapa 2: completa o edita la Resolución de una licitación "en progreso". El
  // PDF es opcional en este endpoint: el service exige uno solo la primera vez
  // (cuando todavía no hay ninguno guardado); en ediciones posteriores, si no se
  // adjunta uno nuevo, se mantiene el actual. Si se adjunta uno nuevo y el
  // guardado funciona, se borra el archivo físico anterior (mismo patrón que
  // AprobacionController.eliminarDocumento).
  @Patch(':id/resolucion')
  @UseInterceptors(FileInterceptor('archivo', opcionesMulter('licitaciones', ['.pdf'])))
  async editarResolucion(
    @Param('id') id: string,
    @Body() datos: EditarResolucionDto,
    @UploadedFile() archivo: Express.Multer.File | undefined,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const licitacionAnterior = await this.licitacionService.obtenerPorId(id);
    const urlNuevoDocumento = archivo ? await this.archivosService.guardarArchivo(archivo) : null;

    const licitacionActualizada = await this.licitacionService.editarResolucion(
      id,
      datos,
      urlNuevoDocumento,
      `${req.user.nombres} ${req.user.apellidos}`,
    );

    if (urlNuevoDocumento && licitacionAnterior.documentoResolucion) {
      const nombreArchivoAnterior = licitacionAnterior.documentoResolucion.split('/').pop()
        ?? licitacionAnterior.documentoResolucion;
      await this.archivosService.eliminarArchivoFisico(nombreArchivoAnterior);
    }

    return licitacionActualizada;
  }

  // Etapa 3: Datos de la licitación. Multipart con 2 archivos posibles: el PDF
  // de preguntas y respuestas (obligatorio, campo "archivo") y la REX con
  // respuestas (opcional, campo "archivoRex"). Requiere que la Resolución ya
  // esté completa (ver service).
  @Patch(':id/datos-licitacion')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'archivo', maxCount: 1 },
        { name: 'archivoRex', maxCount: 1 },
      ],
      opcionesMulter('licitaciones', ['.pdf']),
    ),
  )
  async completarDatosLicitacion(
    @Param('id') id: string,
    @Body() datos: CompletarDatosLicitacionDto,
    @UploadedFiles() archivos: { archivo?: Express.Multer.File[]; archivoRex?: Express.Multer.File[] },
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const archivo = archivos?.archivo?.[0];
    const archivoRex = archivos?.archivoRex?.[0];
    if (!archivo) {
      throw new BadRequestException('Debes adjuntar el PDF de preguntas y respuestas');
    }
    const urlDocumento = await this.archivosService.guardarArchivo(archivo);
    const urlRex = archivoRex ? await this.archivosService.guardarArchivo(archivoRex) : null;
    return this.licitacionService.completarDatosLicitacion(
      id,
      datos,
      urlDocumento,
      urlRex,
      `${req.user.nombres} ${req.user.apellidos}`,
    );
  }

  // Etapa 4: Adjudicación. Multipart con 2 archivos posibles, pero solo se exige
  // el que corresponde según "resultado": el acta de evaluación (campo
  // "archivoActaEvaluacion") si es "adjudicado", o el acta de licitación
  // desierta (campo "archivoActaDesierta") si es "desierta". Requiere que los
  // Datos de la licitación ya estén completos (ver service).
  @Patch(':id/adjudicacion')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'archivoActaEvaluacion', maxCount: 1 },
        { name: 'archivoActaDesierta', maxCount: 1 },
      ],
      opcionesMulter('licitaciones', ['.pdf']),
    ),
  )
  async registrarAdjudicacion(
    @Param('id') id: string,
    @Body() datos: RegistrarAdjudicacionDto,
    @UploadedFiles()
    archivos: { archivoActaEvaluacion?: Express.Multer.File[]; archivoActaDesierta?: Express.Multer.File[] },
    @Req() req: { user: UsuarioAutenticado },
  ) {
    const archivoActaEvaluacion = archivos?.archivoActaEvaluacion?.[0];
    const archivoActaDesierta = archivos?.archivoActaDesierta?.[0];

    if (datos.resultado === ResultadoAdjudicacion.ADJUDICADO && !archivoActaEvaluacion) {
      throw new BadRequestException('Debes adjuntar el acta de evaluación');
    }
    if (datos.resultado === ResultadoAdjudicacion.DESIERTA && !archivoActaDesierta) {
      throw new BadRequestException('Debes adjuntar el acta de la licitación desierta');
    }

    const urlActaEvaluacion = archivoActaEvaluacion
      ? await this.archivosService.guardarArchivo(archivoActaEvaluacion)
      : null;
    const urlActaDesierta = archivoActaDesierta
      ? await this.archivosService.guardarArchivo(archivoActaDesierta)
      : null;

    return this.licitacionService.registrarAdjudicacion(
      id,
      datos,
      urlActaEvaluacion,
      urlActaDesierta,
      `${req.user.nombres} ${req.user.apellidos}`,
    );
  }

  // Etapa 5: REX de adjudicación. Multipart con el PDF obligatorio. Requiere que
  // la Adjudicación ya esté completa (ver service).
  @Patch(':id/rex-adjudicacion')
  @UseInterceptors(FileInterceptor('archivo', opcionesMulter('licitaciones', ['.pdf'])))
  async registrarRexAdjudicacion(
    @Param('id') id: string,
    @Body() datos: RegistrarRexAdjudicacionDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    if (!archivo) {
      throw new BadRequestException('Debes adjuntar el PDF de la REX de adjudicación');
    }
    const urlDocumento = await this.archivosService.guardarArchivo(archivo);
    return this.licitacionService.registrarRexAdjudicacion(
      id,
      datos,
      urlDocumento,
      `${req.user.nombres} ${req.user.apellidos}`,
    );
  }

  // Etapa 6: ITO. Sin archivo — JSON normal. Requiere que la REX de
  // adjudicación ya esté completa (ver service). Es el último paso: al
  // completarse, la licitación pasa al historial.
  @Patch(':id/ito')
  async registrarIto(
    @Param('id') id: string,
    @Body() datos: RegistrarItoDto,
    @Req() req: { user: UsuarioAutenticado },
  ) {
    return this.licitacionService.registrarIto(id, datos, `${req.user.nombres} ${req.user.apellidos}`);
  }
}

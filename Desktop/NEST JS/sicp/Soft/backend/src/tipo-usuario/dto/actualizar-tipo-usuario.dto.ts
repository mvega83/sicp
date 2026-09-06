import { PartialType } from '@nestjs/mapped-types';
import { CrearTipoUsuarioDto } from './crear-tipo-usuario.dto';

export class ActualizarTipoUsuarioDto extends PartialType(CrearTipoUsuarioDto) {}

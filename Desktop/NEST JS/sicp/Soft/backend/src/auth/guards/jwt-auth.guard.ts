import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege cualquier endpoint que solo deba poder usar alguien con sesión iniciada.
 * Uso: @UseGuards(JwtAuthGuard) arriba del controller o de un método puntual.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

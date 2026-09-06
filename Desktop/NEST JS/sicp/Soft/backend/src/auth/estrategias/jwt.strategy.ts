import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioAutenticado } from '../tipos/usuario-autenticado';

interface PayloadToken {
  sub: string;
  correo: string;
  nombres: string;
  apellidos: string;
}

/**
 * Verifica el JWT que llega en el header "Authorization: Bearer <token>" y arma el
 * objeto req.user a partir de lo que el token trae adentro (ver auth.service.ts,
 * método generarTokenParaUsuario, para ver qué se guarda en el token).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configuracion: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuracion.get<string>(
        'JWT_SECRET',
        'clave-de-desarrollo-no-usar-en-produccion',
      ),
    });
  }

  async validate(payload: PayloadToken): Promise<UsuarioAutenticado> {
    return {
      id: payload.sub,
      correo: payload.correo,
      nombres: payload.nombres,
      apellidos: payload.apellidos,
    };
  }
}

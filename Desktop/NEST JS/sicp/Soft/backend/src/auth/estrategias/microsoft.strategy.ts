import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ProveedorAutenticacion } from '../entidades/usuario.entity';

interface PerfilMicrosoft {
  id: string;
  displayName?: string;
  emails?: { value: string }[];
  _json?: {
    mail?: string;
    userPrincipalName?: string;
    displayName?: string;
    givenName?: string;
    surname?: string;
  };
}

/**
 * Esta estrategia solo se registra como provider si MICROSOFT_CLIENT_ID y
 * MICROSOFT_CLIENT_SECRET existen en el .env (ver auth.module.ts).
 */
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    configuracion: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configuracion.get<string>('MICROSOFT_CLIENT_ID')!,
      clientSecret: configuracion.get<string>('MICROSOFT_CLIENT_SECRET')!,
      callbackURL: configuracion.get<string>('MICROSOFT_CALLBACK_URL')!,
      scope: ['user.read'],
    });
  }

  async validate(
    _tokenAcceso: string,
    _tokenRefresco: string,
    perfil: PerfilMicrosoft,
    listo: (error: unknown, usuario?: unknown) => void,
  ) {
    // Microsoft no siempre entrega el correo en `emails`; hay que revisar el perfil
    // crudo (_json) como respaldo.
    const correo =
      perfil.emails?.[0]?.value ??
      perfil._json?.mail ??
      perfil._json?.userPrincipalName ??
      '';
    // Microsoft Graph sí entrega givenName/surname por separado en el perfil crudo
    // (_json); si no vienen, se parte el displayName por el primer espacio como
    // aproximación simple (no siempre exacta, pero mejor que dejar apellidos vacío).
    const nombreCompleto = perfil.displayName ?? perfil._json?.displayName ?? correo;
    const [nombrePorDefecto, ...restoApellido] = nombreCompleto.split(' ');
    const usuario = await this.authService.validarOCrearUsuario({
      correo,
      nombres: perfil._json?.givenName ?? nombrePorDefecto,
      apellidos: perfil._json?.surname ?? restoApellido.join(' '),
      proveedorAutenticacion: ProveedorAutenticacion.MICROSOFT,
      idProveedorExterno: perfil.id,
    });
    listo(null, usuario);
  }
}

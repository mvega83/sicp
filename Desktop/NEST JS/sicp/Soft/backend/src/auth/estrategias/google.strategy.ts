import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ProveedorAutenticacion } from '../entidades/usuario.entity';

/**
 * Esta estrategia solo se registra como provider si GOOGLE_CLIENT_ID y
 * GOOGLE_CLIENT_SECRET existen en el .env (ver auth.module.ts) — por eso acá se
 * puede asumir que las variables ya están presentes.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configuracion: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configuracion.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configuracion.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configuracion.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _tokenAcceso: string,
    _tokenRefresco: string,
    perfil: Profile,
    listo: VerifyCallback,
  ) {
    // Google entrega nombre y apellido por separado (perfil.name); si por algún
    // motivo no vienen, se usa el displayName completo como "nombres" para no dejar
    // el campo vacío.
    const usuario = await this.authService.validarOCrearUsuario({
      correo: perfil.emails?.[0]?.value ?? '',
      nombres: perfil.name?.givenName ?? perfil.displayName,
      apellidos: perfil.name?.familyName ?? '',
      proveedorAutenticacion: ProveedorAutenticacion.GOOGLE,
      idProveedorExterno: perfil.id,
    });
    listo(null, usuario);
  }
}

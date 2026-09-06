import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Usuario } from './entidades/usuario.entity';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { GoogleStrategy } from './estrategias/google.strategy';
import { MicrosoftStrategy } from './estrategias/microsoft.strategy';

/**
 * Google y Microsoft solo se agregan a la lista de "providers" si sus credenciales
 * existen en el .env. Si faltan, el backend arranca igual (sin esas dos rutas
 * activas) — apenas se agreguen las variables de entorno, esta lista las incluye
 * automáticamente, sin tener que tocar el resto del código.
 */
const estrategiasOAuth: Provider[] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  estrategiasOAuth.push(GoogleStrategy);
}
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  estrategiasOAuth.push(MicrosoftStrategy);
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configuracion: ConfigService) => ({
        secret: configuracion.get<string>(
          'JWT_SECRET',
          'clave-de-desarrollo-no-usar-en-produccion',
        ),
        // Se expresa en segundos (no como texto "8h") porque el tipo que espera
        // @nestjs/jwt para "expiresIn" es number | StringValue, y las variables de
        // entorno siempre llegan como texto — parseInt asegura un number real en
        // tiempo de ejecución, no solo en el tipo de TypeScript.
        signOptions: {
          expiresIn: parseInt(
            configuracion.get<string>('JWT_EXPIRACION_SEGUNDOS', '28800'),
            10,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...estrategiasOAuth],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

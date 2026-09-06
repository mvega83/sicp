import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IniciarSesionDevDto } from './dto/iniciar-sesion-dev.dto';
import { IniciarSesionLocalDto } from './dto/iniciar-sesion-local.dto';
import { ProveedorAutenticacion, Usuario } from './entidades/usuario.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioAutenticado } from './tipos/usuario-autenticado';
import { omitirContrasena } from '../comun/utilidades/omitir-contrasena';

interface RequestConUsuario extends Request {
  user: Usuario;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configuracion: ConfigService,
  ) {}

  /**
   * Le dice al frontend qué botones de login puede mostrar, según qué credenciales
   * OAuth estén configuradas en el backend. Así el frontend nunca muestra un botón
   * "Iniciar sesión con Google" que en realidad no va a funcionar.
   */
  @Get('proveedores-disponibles')
  obtenerProveedoresDisponibles() {
    return {
      desarrollo: this.configuracion.get<string>('NODE_ENV') !== 'production',
      google: Boolean(this.configuracion.get<string>('GOOGLE_CLIENT_ID')),
      microsoft: Boolean(this.configuracion.get<string>('MICROSOFT_CLIENT_ID')),
      local: true,
    };
  }

  /**
   * Login sin contraseña, solo para desarrollo: permite construir y probar el
   * sistema completo sin depender de credenciales OAuth reales todavía. Se
   * desactiva solo con poner NODE_ENV=production en el .env.
   */
  @Post('login-dev')
  async iniciarSesionDev(@Body() datos: IniciarSesionDevDto) {
    if (this.configuracion.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException(
        'El login de desarrollo está desactivado en producción.',
      );
    }
    const usuario = await this.authService.validarOCrearUsuario({
      correo: datos.correo,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      proveedorAutenticacion: ProveedorAutenticacion.DESARROLLO,
    });
    return {
      token: this.authService.generarTokenParaUsuario(usuario),
      usuario: omitirContrasena(usuario),
    };
  }

  /**
   * Login con correo y contraseña, para usuarios creados desde Administración >
   * Usuarios (ver src/usuarios/). A diferencia de login-dev, acá sí se valida una
   * contraseña real (hasheada con bcrypt) y el usuario debe existir de antemano.
   */
  @Post('login-local')
  async iniciarSesionLocal(@Body() datos: IniciarSesionLocalDto) {
    const usuario = await this.authService.validarCredencialesLocales(
      datos.correo,
      datos.contrasena,
    );
    return {
      token: this.authService.generarTokenParaUsuario(usuario),
      usuario: omitirContrasena(usuario),
    };
  }

  // Estas cuatro rutas solo responden si GoogleStrategy/MicrosoftStrategy quedaron
  // registradas en auth.module.ts (es decir, si el .env tiene las credenciales). Si
  // no están configuradas, Passport devuelve un error claro al llamarlas — no hace
  // falta lógica extra acá.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  iniciarGoogle() {
    // Passport redirige a Google automáticamente antes de llegar a este método.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: RequestConUsuario) {
    // TODO cuando se conecte el OAuth real: en vez de devolver JSON, redirigir al
    // frontend con el token (ej. `${URL_FRONTEND}/auth/callback?token=...`).
    return {
      token: this.authService.generarTokenParaUsuario(req.user),
      usuario: omitirContrasena(req.user),
    };
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  iniciarMicrosoft() {}

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  microsoftCallback(@Req() req: RequestConUsuario) {
    return {
      token: this.authService.generarTokenParaUsuario(req.user),
      usuario: omitirContrasena(req.user),
    };
  }

  /** El frontend llama esto al cargar para confirmar que el token guardado sigue siendo válido. */
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  obtenerPerfil(@Req() req: { user: UsuarioAutenticado }) {
    return req.user;
  }
}

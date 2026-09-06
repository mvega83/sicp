import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ProveedorAutenticacion, Usuario } from './entidades/usuario.entity';

interface DatosUsuarioExterno {
  correo: string;
  nombres: string;
  apellidos: string;
  proveedorAutenticacion: ProveedorAutenticacion;
  idProveedorExterno?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioUsuarios: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Busca al usuario por correo; si no existe, lo crea. Se usa tanto para el login
   * de desarrollo como para los callbacks de Google/Microsoft, así el resto del
   * sistema no necesita saber por cuál medio inició sesión cada usuario.
   */
  async validarOCrearUsuario(datos: DatosUsuarioExterno): Promise<Usuario> {
    let usuario = await this.repositorioUsuarios.findOne({
      where: { correo: datos.correo },
    });
    if (!usuario) {
      usuario = this.repositorioUsuarios.create(datos);
      usuario = await this.repositorioUsuarios.save(usuario);
    }
    this.verificarUsuarioActivo(usuario);
    return usuario;
  }

  /**
   * Login local (correo + contraseña), para usuarios creados desde Administración >
   * Usuarios (ver src/usuarios/). No confundir con validarOCrearUsuario: acá el
   * usuario ya debe existir y tener una contraseña propia — nunca se crea nada.
   */
  async validarCredencialesLocales(correo: string, contrasenaPlano: string): Promise<Usuario> {
    const usuario = await this.repositorioUsuarios.findOne({ where: { correo } });
    const coincide = usuario?.contrasenaHash
      ? await bcrypt.compare(contrasenaPlano, usuario.contrasenaHash)
      : false;
    // Mismo mensaje tanto si el correo no existe como si la contraseña está mal, para
    // no darle pistas a quien intenta adivinar cuentas válidas.
    if (!coincide) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    this.verificarUsuarioActivo(usuario as Usuario);
    return usuario as Usuario;
  }

  /**
   * Bloquea el login de cualquier usuario dado de baja (estado = -1), sin importar
   * por qué medio inicia sesión. Se revisa después de validar la identidad (no
   * antes) para no confirmarle a alguien que adivinó un correo si esa cuenta existe.
   */
  private verificarUsuarioActivo(usuario: Usuario): void {
    if (usuario.estado !== 1) {
      throw new ForbiddenException(
        'Esta cuenta está dada de baja. Contacta a un administrador del sistema.',
      );
    }
  }

  generarTokenParaUsuario(
    usuario: Usuario | { id: string; correo: string; nombres: string; apellidos: string },
  ): string {
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
    };
    return this.jwtService.sign(payload);
  }
}

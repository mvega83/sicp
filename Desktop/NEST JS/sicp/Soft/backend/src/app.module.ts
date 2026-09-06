import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseDatosModule } from './base-datos/base-datos.module';
import { AuthModule } from './auth/auth.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ArchivosModule } from './archivos/archivos.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { FinanciamientoModule } from './financiamiento/financiamiento.module';
import { LicitacionModule } from './licitacion/licitacion.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ObraModule } from './obra/obra.module';
import { FinalizacionModule } from './finalizacion/finalizacion.module';
import { TipoUsuarioModule } from './tipo-usuario/tipo-usuario.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UnidadesModule } from './unidades/unidades.module';
import { TipoFuenteFinanciamientoModule } from './tipo-fuente-financiamiento/tipo-fuente-financiamiento.module';
import { CaracteristicasProyectosModule } from './caracteristicas-proyectos/caracteristicas-proyectos.module';
import { LocalidadesModule } from './localidades/localidades.module';
import { TiposProyectoModule } from './tipos-proyecto/tipos-proyecto.module';

@Module({
  imports: [
    // isGlobal=true: cualquier módulo puede inyectar ConfigService sin tener que
    // volver a importar ConfigModule cada vez.
    ConfigModule.forRoot({ isGlobal: true }),
    BaseDatosModule,
    AuthModule,
    BitacoraModule,
    ArchivosModule,
    // Un módulo por etapa del ciclo de vida del proyecto (ver design/ui-general.html).
    ProyectosModule, // Etapa 1: Banco de Ideas
    FinanciamientoModule, // Etapa 2
    LicitacionModule, // Etapa 3
    ProveedorModule, // Etapa 4
    ObraModule, // Etapa 5
    FinalizacionModule, // Etapa 6
    // Sección Administración del menú.
    TipoUsuarioModule,
    UsuariosModule,
    UnidadesModule,
    TipoFuenteFinanciamientoModule,
    CaracteristicasProyectosModule,
    LocalidadesModule,
    TiposProyectoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Este módulo es el ÚNICO lugar del backend que conoce los datos de conexión a MySQL.
 * El resto del sistema solo importa `TypeOrmModule.forFeature([...])` en cada módulo
 * para registrar sus propias entidades — nunca configura la conexión directamente.
 *
 * Por qué: el proyecto se instalará primero en un hosting y luego se migrará a un
 * servidor propio. Con esta separación, cambiar de ambiente es solo actualizar las
 * variables de entorno (.env), sin tocar código de negocio.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configuracion: ConfigService) => ({
        type: 'mysql',
        host: configuracion.get<string>('DB_HOST', 'localhost'),
        port: configuracion.get<number>('DB_PORT', 3306),
        username: configuracion.get<string>('DB_USER', 'root'),
        password: configuracion.get<string>('DB_PASSWORD', ''),
        database: configuracion.get<string>('DB_NAME', 'sicp'),
        // Deja que TypeORM descubra automáticamente las entidades registradas por
        // cada módulo (vía forFeature), sin tener que listarlas a mano acá.
        autoLoadEntities: true,
        // OJO: "synchronize" crea/actualiza las tablas automáticamente a partir de las
        // entidades. Es cómodo mientras se aprende y se arma el esqueleto del proyecto,
        // pero es peligroso en producción (puede alterar o borrar datos reales al
        // detectar cambios de esquema). Por eso solo se activa fuera de producción;
        // en producción se deben usar migraciones de TypeORM.
        synchronize: configuracion.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class BaseDatosModule {}

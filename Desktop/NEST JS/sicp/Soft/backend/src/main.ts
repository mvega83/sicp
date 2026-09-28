import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Valida automáticamente el body de cada request contra los DTOs (class-validator).
  // whitelist=true elimina cualquier campo que no esté declarado en el DTO, para que
  // nadie pueda "colar" datos extra que el backend no espera.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // El frontend (React) corre en otro puerto durante desarrollo, así que hay que
  // habilitar CORS explícitamente para que el navegador permita las llamadas.
  app.enableCors({
    origin: process.env.URL_FRONTEND ?? 'http://localhost:5173',
    credentials: true,
  });

  // Los archivos subidos (imágenes de proyectos, documentos adjuntos, etc.) ya no se
  // sirven como estáticos: pasan por VisorController (ver src/archivos/visor.controller.ts),
  // que busca el archivo por nombre en la carpeta externa configurada en
  // CARPETA_ALMACENAMIENTO_ARCHIVOS, sin revelar la subcarpeta ni la ruta real en disco.

  // Render (y la mayoría de los hostings gratuitos) asignan el puerto ellos mismos
  // y lo pasan en PORT — hay que escucharlo ahí, PUERTO_APP solo aplica en local.
  const puerto = process.env.PORT ?? process.env.PUERTO_APP ?? 3000;
  await app.listen(puerto);
  console.log(`Backend de SICP escuchando en http://localhost:${puerto}`);
}
bootstrap();

# Librerías del backend (SICP)

Listado de todas las librerías de npm instaladas en `backend/package.json`, para qué se usa cada una en este proyecto y de dónde viene (`dependencies` = se necesita para que la app corra; `devDependencies` = solo se usa mientras se desarrolla, no viaja a producción).

## Dependencias principales (`dependencies`)

| Librería | Para qué se usa en SICP |
|---|---|
| `@nestjs/common` | El núcleo de NestJS: decoradores (`@Controller`, `@Injectable`, etc.), pipes, guards, excepciones HTTP. Prácticamente todo archivo del backend depende de este paquete. |
| `@nestjs/core` | El motor que arma y arranca la aplicación NestJS (`NestFactory.create`, `main.ts`). |
| `@nestjs/config` | Lee las variables de entorno del `.env` (`ConfigService`). Es la base de que la conexión a MySQL y las claves de JWT/OAuth nunca queden escritas directo en el código. |
| `@nestjs/typeorm` | Conecta TypeORM con el sistema de módulos de NestJS: permite inyectar `Repository<Entidad>` en los servicios (ver `base-datos/base-datos.module.ts`). |
| `typeorm` | El ORM en sí — define las entidades (`Proyecto`, `Usuario`, `Bitacora`, etc.) y traduce el código TypeScript a consultas SQL contra MySQL. |
| `mysql2` | El driver que TypeORM usa por debajo para hablar realmente con MySQL por la red. |
| `@nestjs/jwt` | Firma y valida los JWT que usa el sistema de sesión (login-dev y, más adelante, Google/Microsoft). |
| `@nestjs/passport` | Conecta la librería Passport (motor de estrategias de autenticación) con los guards de NestJS (`@UseGuards(AuthGuard('jwt'))`). |
| `passport` | El motor de autenticación sobre el que están armadas todas las estrategias (`jwt`, `google`, `microsoft`). |
| `passport-jwt` | Estrategia de Passport que valida el JWT que llega en el header `Authorization` de cada request protegido. |
| `passport-google-oauth20` | Estrategia de Passport para "Iniciar sesión con Google". Solo se activa si `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` existen en el `.env` (ver `auth/auth.module.ts`). |
| `passport-microsoft` | Lo mismo, pero para "Iniciar sesión con Microsoft". Solo se activa si `MICROSOFT_CLIENT_ID`/`MICROSOFT_CLIENT_SECRET` existen en el `.env`. |
| `@nestjs/mapped-types` | Da `PartialType(...)`, usado para construir los DTOs de "actualizar" (ej. `ActualizarProyectoDto`) a partir del DTO de "crear" sin repetir todos los campos. |
| `class-validator` | Decoradores como `@IsEmail()`, `@IsNotEmpty()`, `@IsUUID()` que validan automáticamente el body de cada request contra los DTOs. |
| `class-transformer` | Convierte el JSON plano que llega en cada request en instancias reales de la clase DTO, para que `class-validator` pueda revisarlas (lo usa el `ValidationPipe` global de `main.ts`). |
| `multer` | Maneja la subida de archivos (imágenes de proyectos, REX de licitación, boleta de garantía, documentos de obra) — ver `archivos/opciones-multer.ts`. |
| `reflect-metadata` | Requisito técnico de los decoradores de TypeScript que usan NestJS y TypeORM (`@Injectable`, `@Column`, etc.). Se importa una sola vez en `main.ts`. |
| `rxjs` | Programación reactiva (Observables) que NestJS usa internamente; normalmente no se usa directo en el código de este proyecto. |
| `@types/multer` | Tipos de TypeScript para `multer` (para que `Express.Multer.File` funcione con autocompletado y sin errores de compilación). |
| `@types/passport-google-oauth20` | Tipos de TypeScript para `passport-google-oauth20`. |

## Dependencias de desarrollo (`devDependencies`)

| Librería | Para qué se usa en SICP |
|---|---|
| `@nestjs/cli` | Los comandos `nest new`, `nest build`, `nest start --watch` que se usaron para crear y correr el proyecto. |
| `@nestjs/schematics` | Generadores de código que usa `@nestjs/cli` (ej. `nest generate module`). |
| `@nestjs/testing` | Utilidades para escribir tests de NestJS (`TestingModule`, etc.) — todavía no hay tests escritos en el proyecto, pero queda listo para cuando se agreguen. |
| `typescript` | El compilador de TypeScript a JavaScript. |
| `ts-node` / `ts-loader` / `tsconfig-paths` | Permiten ejecutar y compilar TypeScript directamente (usados por `nest build`/`start` y por los tests). |
| `jest` / `ts-jest` | Framework de tests y su integración con TypeScript. |
| `supertest` | Simula requests HTTP para tests end-to-end de los controladores. |
| `@types/express`, `@types/node`, `@types/jest`, `@types/supertest`, `@types/passport-microsoft` | Tipos de TypeScript para cada una de esas librerías. |
| `eslint`, `@eslint/js`, `@eslint/eslintrc`, `typescript-eslint`, `globals` | Revisan el código en busca de errores comunes y problemas de estilo. |
| `eslint-plugin-prettier`, `eslint-config-prettier` | Conectan Prettier (el formateador) con ESLint, para que no se contradigan entre sí. |
| `prettier` | Formatea el código automáticamente (comillas, indentación, etc.) — comando `npm run format`. |
| `source-map-support` | Hace que los errores en tiempo de ejecución muestren la línea del archivo `.ts` original, no del `.js` compilado. |

## Notas

- **MySQL está aislado del resto del código**: solo `mysql2` y `typeorm` "saben" que la base de datos es MySQL, y ambos quedan encapsulados dentro de `base-datos/base-datos.module.ts`. Ningún otro archivo del proyecto importa `mysql2` directamente.
- **`passport-google-oauth20` y `passport-microsoft` ya están instaladas y con su código completo**, pero no hacen nada hasta que se agreguen las credenciales reales (`GOOGLE_CLIENT_ID`, etc.) al `.env` — ver `auth/auth.module.ts` para el detalle de cómo se activan solas.

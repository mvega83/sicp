import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoUsuario } from './entidades/tipo-usuario.entity';
import { TipoUsuarioService } from './tipo-usuario.service';
import { TipoUsuarioController } from './tipo-usuario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoUsuario])],
  controllers: [TipoUsuarioController],
  providers: [TipoUsuarioService],
})
export class TipoUsuarioModule {}

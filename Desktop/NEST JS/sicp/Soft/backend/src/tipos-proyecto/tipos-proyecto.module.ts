import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoProyecto } from './entidades/tipo-proyecto.entity';
import { TiposProyectoService } from './tipos-proyecto.service';
import { TiposProyectoController } from './tipos-proyecto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoProyecto])],
  controllers: [TiposProyectoController],
  providers: [TiposProyectoService],
})
export class TiposProyectoModule {}

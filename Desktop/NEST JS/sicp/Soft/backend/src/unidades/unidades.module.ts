import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidad } from './entidades/unidad.entity';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Unidad])],
  controllers: [UnidadesController],
  providers: [UnidadesService],
})
export class UnidadesModule {}

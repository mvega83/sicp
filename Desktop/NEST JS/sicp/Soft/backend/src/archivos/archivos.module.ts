import { Module } from '@nestjs/common';
import { ArchivosService } from './archivos.service';
import { VisorController } from './visor.controller';

@Module({
  controllers: [VisorController],
  providers: [ArchivosService],
  exports: [ArchivosService],
})
export class ArchivosModule {}

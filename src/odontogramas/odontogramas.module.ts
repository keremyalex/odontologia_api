import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdontogramasService } from './odontogramas.service';
import { OdontogramasController } from './odontogramas.controller';
import { Odontograma } from '../entities/odontograma.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Odontograma]),
    AuditoriaModule,
  ],
  controllers: [OdontogramasController],
  providers: [OdontogramasService],
  exports: [OdontogramasService],
})
export class OdontogramasModule {}
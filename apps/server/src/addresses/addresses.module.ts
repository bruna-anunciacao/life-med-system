import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from './addresses.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

@Module({
  imports: [PrismaModule, HttpModule, QuestionnaireModule],
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository],
  exports: [AddressesService],
})
export class AddressesModule {}

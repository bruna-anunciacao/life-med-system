import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}

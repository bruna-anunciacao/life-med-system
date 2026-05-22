import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpecialityController } from './speciality.controller';
import { SpecialityService } from './speciality.service';

describe('SpecialityController', () => {
  let controller: SpecialityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialityController],
      providers: [
        SpecialityService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SpecialityController>(SpecialityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

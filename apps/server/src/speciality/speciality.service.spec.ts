import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpecialityService } from './speciality.service';

describe('SpecialityService', () => {
  let service: SpecialityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialityService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SpecialityService>(SpecialityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

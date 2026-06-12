import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityRepository } from './speciality.repository';
import { SpecialityService } from './speciality.service';

describe('SpecialityService', () => {
  let service: SpecialityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialityService,
        {
          provide: SpecialityRepository,
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

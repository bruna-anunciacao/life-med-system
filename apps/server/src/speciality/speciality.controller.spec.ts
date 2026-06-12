import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityController } from './speciality.controller';
import { SpecialityRepository } from './speciality.repository';
import { SpecialityService } from './speciality.service';

describe('SpecialityController', () => {
  let controller: SpecialityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialityController],
      providers: [
        SpecialityService,
        {
          provide: SpecialityRepository,
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

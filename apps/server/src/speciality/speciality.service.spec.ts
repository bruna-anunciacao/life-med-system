import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpecialityRepository } from './speciality.repository';
import { SpecialityService } from './speciality.service';

describe('SpecialityService', () => {
  const repository = {
    findByNameInsensitive: jest.fn(),
    create: jest.fn(),
    findAllOrderedByName: jest.fn(),
    findById: jest.fn(),
    findDuplicateName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let service: SpecialityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SpecialityService(
      repository as unknown as SpecialityRepository,
    );
  });

  describe('create', () => {
    it('rejects a duplicate name', async () => {
      repository.findByNameInsensitive.mockResolvedValue({ id: 's-1' });

      await expect(
        service.create({ name: 'Cardio' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('trims the name before persisting', async () => {
      repository.findByNameInsensitive.mockResolvedValue(null);
      repository.create.mockResolvedValue({ id: 's-1' });

      await service.create({ name: '  Cardio  ' } as any);

      expect(repository.findByNameInsensitive).toHaveBeenCalledWith('Cardio');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cardio' }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFound when missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws NotFound when the speciality does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('x', { name: 'A' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects renaming to an existing name', async () => {
      repository.findById.mockResolvedValue({ id: 's-1' });
      repository.findDuplicateName.mockResolvedValue({ id: 's-2' });

      await expect(
        service.update('s-1', { name: 'Cardio' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('trims and updates when the new name is unique', async () => {
      repository.findById.mockResolvedValue({ id: 's-1' });
      repository.findDuplicateName.mockResolvedValue(null);
      repository.update.mockResolvedValue({ id: 's-1' });

      await service.update('s-1', { name: '  Neuro  ' } as any);

      expect(repository.findDuplicateName).toHaveBeenCalledWith('Neuro', 's-1');
      expect(repository.update).toHaveBeenCalledWith(
        's-1',
        expect.objectContaining({ name: 'Neuro' }),
      );
    });

    it('skips the duplicate check when name is not being changed', async () => {
      repository.findById.mockResolvedValue({ id: 's-1' });
      repository.update.mockResolvedValue({ id: 's-1' });

      await service.update('s-1', { description: 'nova' } as any);

      expect(repository.findDuplicateName).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFound when the speciality does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deletes when the speciality exists', async () => {
      repository.findById.mockResolvedValue({ id: 's-1' });
      repository.delete.mockResolvedValue({ id: 's-1' });

      await service.remove('s-1');

      expect(repository.delete).toHaveBeenCalledWith('s-1');
    });
  });
});

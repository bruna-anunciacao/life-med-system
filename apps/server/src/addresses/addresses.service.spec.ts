import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';

describe('AddressesService', () => {
  const repository = {
    findUserById: jest.fn(),
    findByUserId: jest.fn(),
    createForUser: jest.fn(),
    updateForUser: jest.fn(),
    deleteForUser: jest.fn(),
    findDistinctCities: jest.fn(),
  };
  const httpService = { get: jest.fn() };

  let service: AddressesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AddressesService(
      repository as unknown as AddressesRepository,
      httpService as unknown as HttpService,
    );
  });

  describe('searchByCep', () => {
    it('rejects a CEP that is not 8 digits', async () => {
      await expect(service.searchByCep('123')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects a CEP with non-numeric characters', async () => {
      await expect(service.searchByCep('1234567a')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('maps the ViaCEP response to the address shape', async () => {
      httpService.get.mockReturnValue(
        of({
          data: {
            cep: '40000-000',
            logradouro: 'Rua A',
            bairro: 'Centro',
            localidade: 'Salvador',
            uf: 'BA',
          },
        }),
      );

      const result = await service.searchByCep('40000000');

      expect(result).toEqual({
        zipCode: '40000-000',
        street: 'Rua A',
        district: 'Centro',
        city: 'Salvador',
        state: 'BA',
      });
    });

    it('throws NotFound when ViaCEP returns erro: true', async () => {
      httpService.get.mockReturnValue(of({ data: { erro: true } }));

      await expect(service.searchByCep('00000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('wraps external API failures into a BadRequest', async () => {
      httpService.get.mockImplementation(() => {
        throw new Error('network down');
      });

      await expect(service.searchByCep('40000000')).rejects.toThrow(
        'Erro ao consultar CEP',
      );
    });
  });

  describe('create', () => {
    const dto = {
      zipCode: '40000-000',
      street: 'Rua A',
      number: '1',
      district: 'Centro',
      city: 'Salvador',
      state: 'BA',
    } as any;

    it('throws NotFound when the user does not exist', async () => {
      repository.findUserById.mockResolvedValue(null);

      await expect(service.create('u-1', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects when the user already has an address', async () => {
      repository.findUserById.mockResolvedValue({ id: 'u-1' });
      repository.findByUserId.mockResolvedValue({ id: 'addr-1' });

      await expect(service.create('u-1', dto)).rejects.toThrow(
        'já possui um endereço',
      );
    });

    it('creates the address with complement defaulting to null', async () => {
      repository.findUserById.mockResolvedValue({ id: 'u-1' });
      repository.findByUserId.mockResolvedValue(null);
      repository.createForUser.mockResolvedValue({ id: 'addr-1' });

      await service.create('u-1', dto);

      expect(repository.createForUser).toHaveBeenCalledWith(
        'u-1',
        expect.objectContaining({ complement: null }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFound when there is no address', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.update('u-1', {} as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('keeps existing values for fields not provided', async () => {
      repository.findByUserId.mockResolvedValue({
        zipCode: '40000-000',
        street: 'Rua A',
        number: '1',
        complement: 'Apto 2',
        district: 'Centro',
        city: 'Salvador',
        state: 'BA',
      });
      repository.updateForUser.mockResolvedValue({ id: 'addr-1' });

      await service.update('u-1', { street: 'Rua B' } as any);

      expect(repository.updateForUser).toHaveBeenCalledWith(
        'u-1',
        expect.objectContaining({ street: 'Rua B', city: 'Salvador' }),
      );
    });
  });

  describe('delete', () => {
    it('throws NotFound when there is no address', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.delete('u-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deletes the address when it exists', async () => {
      repository.findByUserId.mockResolvedValue({ id: 'addr-1' });
      repository.deleteForUser.mockResolvedValue({ id: 'addr-1' });

      await service.delete('u-1');

      expect(repository.deleteForUser).toHaveBeenCalledWith('u-1');
    });
  });
});

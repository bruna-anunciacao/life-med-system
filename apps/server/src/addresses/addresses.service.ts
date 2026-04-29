import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto, ViaCepDto } from './dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AddressesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async searchByCep(cep: string) {
    if (!cep || cep.length !== 8 || !/^\d{8}$/.test(cep)) {
      throw new BadRequestException('CEP deve conter exatamente 8 dígitos');
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ViaCepDto>(
          `https://viacep.com.br/ws/${cep}/json/`,
        ),
      );

      if (data.erro) {
        throw new NotFoundException('CEP não encontrado');
      }

      return {
        zipCode: data.cep,
        street: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao consultar CEP na API externa');
    }
  }

  async create(userId: string, dto: CreateAddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`[AddressesService] Usuário com ID ${userId} não encontrado ao tentar criar endereço`);
      throw new NotFoundException('Usuário não encontrado');
    }

    const existingAddress = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (existingAddress) {
      throw new BadRequestException('Este usuário já possui um endereço cadastrado.',);
    }

    return this.prisma.address.create({
      data: {
        userId,
        zipCode: dto.zipCode,
        street: dto.street,
        number: dto.number,
        complement: dto.complement || null,
        district: dto.district,
        city: dto.city,
        state: dto.state,
      },
    });
  }

  async findByUserId(userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado para este usuário');
    }

    return address;
  }

  async update(userId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado para este usuário');
    }

    return this.prisma.address.update({
      where: { userId },
      data: {
        zipCode: dto.zipCode ?? address.zipCode,
        street: dto.street ?? address.street,
        number: dto.number ?? address.number,
        complement:
          dto.complement !== undefined ? dto.complement : address.complement,
        district: dto.district ?? address.district,
        city: dto.city ?? address.city,
        state: dto.state ?? address.state,
      },
    });
  }

  async delete(userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado para este usuário');
    }

    return this.prisma.address.delete({
      where: { userId },
    });
  }
}

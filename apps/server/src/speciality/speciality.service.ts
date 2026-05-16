import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecialityService {
  constructor(private prisma: PrismaService) {}

  async create(createSpecialityDto: CreateSpecialityDto) {
    const name = createSpecialityDto.name.trim();

    const existingSpeciality = await this.prisma.speciality.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingSpeciality) {
      throw new ConflictException('Especialidade já cadastrada');
    }

    return this.prisma.speciality.create({
      data: { ...createSpecialityDto, name },
    });
  }

  async findAll() {
    return this.prisma.speciality.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const speciality = await this.prisma.speciality.findUnique({
      where: { id },
    });

    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return speciality;
  }

  async update(id: string, updateSpecialityDto: UpdateSpecialityDto) {
    const existingSpeciality = await this.prisma.speciality.findUnique({
      where: { id },
    });

    if (!existingSpeciality) {
      throw new NotFoundException('Speciality not found');
    }

    const data = { ...updateSpecialityDto };
    if (data.name !== undefined) {
      data.name = data.name.trim();
      const duplicate = await this.prisma.speciality.findFirst({
        where: {
          name: { equals: data.name, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException('Especialidade já cadastrada');
      }
    }

    return this.prisma.speciality.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const speciality = await this.prisma.speciality.findUnique({
      where: { id },
    });
    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return this.prisma.speciality.delete({
      where: { id },
    });
  }
}

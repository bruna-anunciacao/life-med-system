import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecialityService {
  constructor(private prisma: PrismaService) { }

  async create(createSpecialityDto: CreateSpecialityDto) {
    const existingSpeciality = await this.prisma.speciality.findUnique({
      where: { name: createSpecialityDto.name },
    });

    if (existingSpeciality) {
      throw new ConflictException('Speciality already exists');
    }

    return this.prisma.speciality.create({
      data: createSpecialityDto,
    });
  }

  async findAll() {
    return this.prisma.speciality.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const speciality = await this.prisma.speciality.findUnique({
      where: { id }
    })

    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return speciality;
  }

  async update(id: string, updateSpecialityDto: UpdateSpecialityDto) {
    const existingSpeciality = await this.prisma.speciality.findUnique({
      where: { id }
    })

    if (!existingSpeciality) {
      throw new NotFoundException('Speciality not found');
    }

    return this.prisma.speciality.update({
      where: { id },
      data: updateSpecialityDto,
    });
  }

  async remove(id: string) {
    const speciality = await this.prisma.speciality.findUnique({
      where: { id }
    })
    if (!speciality) {
      throw new NotFoundException('Speciality not found');
    }
    return this.prisma.speciality.delete({
      where: { id }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecialityRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByNameInsensitive(name: string) {
    return this.prisma.speciality.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  create(data: Prisma.SpecialityCreateInput) {
    return this.prisma.speciality.create({ data });
  }

  findAllOrderedByName() {
    return this.prisma.speciality.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.speciality.findUnique({ where: { id } });
  }

  findDuplicateName(name: string, ignoredId: string) {
    return this.prisma.speciality.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: ignoredId },
      },
    });
  }

  update(id: string, data: Prisma.SpecialityUpdateInput) {
    return this.prisma.speciality.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.speciality.delete({ where: { id } });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prisma.address.findUnique({ where: { userId } });
  }

  createForUser(userId: string, data: Omit<Prisma.AddressCreateInput, 'user'>) {
    return this.prisma.address.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  updateForUser(userId: string, data: Prisma.AddressUpdateInput) {
    return this.prisma.address.update({ where: { userId }, data });
  }

  deleteForUser(userId: string) {
    return this.prisma.address.delete({ where: { userId } });
  }

  findDistinctCities() {
    return this.prisma.address.findMany({
      select: {
        city: true,
        state: true,
      },
      distinct: ['city', 'state'],
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
    });
  }
}

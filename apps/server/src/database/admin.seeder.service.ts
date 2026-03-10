import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME') || 'Admin';

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'ADMIN_EMAIL ou ADMIN_PASSWORD não definidos no .env. Ignorando criação de admin.',
      );
      return;
    }

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log(`Admin (${adminEmail}) já existe. Nada a fazer.`);
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword as string, salt);

    try {
      await this.prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.VERIFIED,
        },
      });
      this.logger.log(`✅ Usuário Admin criado com sucesso: ${adminEmail}`);
    } catch (error) {
      this.logger.error('Erro ao criar usuário admin:', error);
    }
  }
}

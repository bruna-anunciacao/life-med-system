import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { EmailVerificationService } from 'src/mail/email-verification.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const password = 'Senha123!';
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  };
  const mailService = {};
  const emailVerification = {};

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      emailVerification as unknown as EmailVerificationService,
    );
  });

  const makeUser = async (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'user-id',
    email: 'usuario@lifemed.com',
    password: await bcrypt.hash(password, 4),
    name: 'Usuario LifeMed',
    role: UserRole.PATIENT,
    status: UserStatus.VERIFIED,
    emailVerified: true,
    patientProfile: {
      questionnaireCompleted: false,
    },
    ...overrides,
  });

  it('rejects login for blocked users without issuing a token', async () => {
    prisma.user.findUnique.mockResolvedValue(
      await makeUser({ status: UserStatus.BLOCKED }),
    );

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).rejects.toThrow(
      'Sua conta está bloqueada. Entre em contato com o administrador.',
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('keeps verified users able to login', async () => {
    prisma.user.findUnique.mockResolvedValue(await makeUser());

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).resolves.toMatchObject({
      accessToken: 'signed-token',
      user: {
        id: 'user-id',
        status: UserStatus.VERIFIED,
      },
    });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-id',
        status: UserStatus.VERIFIED,
      }),
    );
  });
});

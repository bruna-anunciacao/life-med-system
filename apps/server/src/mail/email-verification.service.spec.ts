import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailVerificationService } from './email-verification.service';
import { MailService } from './mail.service';

describe('EmailVerificationService', () => {
  const prisma = {
    emailVerification: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  const mailService = {
    sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
  };

  let service: EmailVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmailVerificationService(
      prisma as unknown as PrismaService,
      mailService as unknown as MailService,
    );
  });

  describe('sendVerification', () => {
    it('persists a token and sends the verification email', async () => {
      prisma.emailVerification.create.mockResolvedValue({});

      await service.sendVerification({
        id: 'u-1',
        name: 'A',
        email: 'a@a.com',
      });

      expect(prisma.emailVerification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'u-1' }),
        }),
      );
      expect(mailService.sendEmailVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('rejects an unknown token', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue(null);

      await expect(service.validateToken('bad')).rejects.toThrow(
        'Token inválido',
      );
    });

    it('rejects an expired token', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue({
        id: 'v-1',
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'u-1' },
      });

      await expect(service.validateToken('old')).rejects.toThrow(
        'Token expirado',
      );
      expect(prisma.emailVerification.delete).not.toHaveBeenCalled();
    });

    it('consumes a valid token and returns the user', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue({
        id: 'v-1',
        expiresAt: new Date(Date.now() + 60_000),
        user: { id: 'u-1', email: 'a@a.com' },
      });

      const result = await service.validateToken('good');

      expect(prisma.emailVerification.delete).toHaveBeenCalledWith({
        where: { id: 'v-1' },
      });
      expect(result).toEqual({ id: 'u-1', email: 'a@a.com' });
    });
  });

  describe('resend', () => {
    it('returns a generic message without resending for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.resend('x@x.com');

      expect(result.message).toMatch(/Se o e-mail/);
      expect(prisma.emailVerification.deleteMany).not.toHaveBeenCalled();
    });

    it('does not resend for an already-verified user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        emailVerified: true,
      });

      await service.resend('a@a.com');

      expect(prisma.emailVerification.deleteMany).not.toHaveBeenCalled();
    });

    it('clears old tokens and resends for a pending user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        name: 'A',
        email: 'a@a.com',
        emailVerified: false,
      });
      prisma.emailVerification.create.mockResolvedValue({});

      await service.resend('a@a.com');

      expect(prisma.emailVerification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
      });
      expect(mailService.sendEmailVerificationEmail).toHaveBeenCalled();
    });
  });
});

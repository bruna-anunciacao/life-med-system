import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { EmailVerificationService } from 'src/mail/email-verification.service';
import { MailService } from 'src/mail/mail.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const password = 'Senha123!';
  const repository = {
    findUserForLogin: jest.fn(),
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
      repository as unknown as AuthRepository,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
      emailVerification as unknown as EmailVerificationService,
    );
  });

  const makeUser = async (
    overrides: Partial<Record<string, unknown>> = {},
  ) => ({
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
    repository.findUserForLogin.mockResolvedValue(
      await makeUser({ status: UserStatus.BLOCKED }),
    );

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).rejects.toThrow(
      'Sua conta está bloqueada. Entre em contato com o administrador.',
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('blocks professional whose email is not yet confirmed', async () => {
    repository.findUserForLogin.mockResolvedValue(
      await makeUser({
        role: UserRole.PROFESSIONAL,
        emailVerified: false,
        status: UserStatus.PENDING,
        patientProfile: null,
      }),
    );

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).rejects.toThrow('Seu e-mail ainda não foi verificado');

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('blocks professional with confirmed email but pending admin approval', async () => {
    repository.findUserForLogin.mockResolvedValue(
      await makeUser({
        role: UserRole.PROFESSIONAL,
        emailVerified: true,
        status: UserStatus.PENDING,
        patientProfile: null,
      }),
    );

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).rejects.toThrow('aguarda aprovação do administrador');

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('lets an approved (VERIFIED) professional login', async () => {
    repository.findUserForLogin.mockResolvedValue(
      await makeUser({
        role: UserRole.PROFESSIONAL,
        emailVerified: true,
        status: UserStatus.VERIFIED,
        patientProfile: null,
      }),
    );

    await expect(
      service.login({ email: 'usuario@lifemed.com', password }),
    ).resolves.toMatchObject({ accessToken: 'signed-token' });
  });

  it('keeps verified users able to login', async () => {
    repository.findUserForLogin.mockResolvedValue(await makeUser());

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

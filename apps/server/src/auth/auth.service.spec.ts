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
    findUserByEmail: jest.fn(),
    findUserByCpf: jest.fn(),
    createPatient: jest.fn(),
    createPasswordReset: jest.fn(),
    findPasswordResetByToken: jest.fn(),
    resetPassword: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  };
  const mailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };
  const emailVerification = {
    sendVerification: jest.fn().mockResolvedValue(undefined),
  };

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

  describe('register', () => {
    const dto = {
      email: 'novo@lifemed.com',
      cpf: '12345678900',
      password,
      name: 'Novo Paciente',
    } as any;

    it('rejects registration when the email already exists', async () => {
      repository.findUserByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow('E-mail já cadastrado');
      expect(repository.createPatient).not.toHaveBeenCalled();
    });

    it('rejects registration when the CPF already exists', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.findUserByCpf.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow('CPF já cadastrado');
      expect(repository.createPatient).not.toHaveBeenCalled();
    });

    it('hashes the password and sends a verification email on success', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.findUserByCpf.mockResolvedValue(null);
      repository.createPatient.mockImplementation(
        async (_dto: unknown, passwordHash: string) => ({
          id: 'new-user',
          email: dto.email,
          name: dto.name,
          role: UserRole.PATIENT,
          status: UserStatus.PENDING,
          password: passwordHash,
        }),
      );

      const result = await service.register(dto);

      const [, passwordHash] = repository.createPatient.mock.calls[0];
      expect(passwordHash).not.toBe(password);
      expect(await bcrypt.compare(password, passwordHash)).toBe(true);
      expect(emailVerification.sendVerification).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'new-user', email: dto.email });
    });
  });

  describe('forgotPassword', () => {
    it('returns a generic message and does nothing when the email is unknown', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'desconhecido@lifemed.com',
      } as any);

      expect(result.message).toMatch(/Se o e-mail existir/);
      expect(repository.createPasswordReset).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('creates a reset token and sends the email when the user exists', async () => {
      repository.findUserByEmail.mockResolvedValue({
        id: 'user-id',
        name: 'Usuario',
        email: 'usuario@lifemed.com',
      });

      const result = await service.forgotPassword({
        email: 'usuario@lifemed.com',
      } as any);

      expect(repository.createPasswordReset).toHaveBeenCalledWith(
        'user-id',
        expect.any(String),
        expect.any(Date),
      );
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
      // Mensagem genérica idêntica à do caso desconhecido (evita enumeração).
      expect(result.message).toMatch(/Se o e-mail existir/);
    });
  });

  describe('resetPassword', () => {
    it('rejects an invalid token', async () => {
      repository.findPasswordResetByToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad', newPassword: password } as any),
      ).rejects.toThrow('Token inválido');
    });

    it('rejects an expired token', async () => {
      repository.findPasswordResetByToken.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword({ token: 'old', newPassword: password } as any),
      ).rejects.toThrow('Token expirado');
      expect(repository.resetPassword).not.toHaveBeenCalled();
    });

    it('hashes the new password and persists it for a valid token', async () => {
      repository.findPasswordResetByToken.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await service.resetPassword({
        token: 'valid',
        newPassword: password,
      } as any);

      const [resetId, userId, passwordHash] =
        repository.resetPassword.mock.calls[0];
      expect(resetId).toBe('reset-1');
      expect(userId).toBe('user-id');
      expect(await bcrypt.compare(password, passwordHash)).toBe(true);
    });
  });
});

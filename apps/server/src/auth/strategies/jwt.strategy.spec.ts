import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  const makeUser = (status: UserStatus) => ({
    id: 'user-id',
    email: 'usuario@lifemed.com',
    name: 'Usuario LifeMed',
    role: UserRole.PATIENT,
    status,
    emailVerified: true,
  });

  it('rejects blocked users even when the JWT payload is valid', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser(UserStatus.BLOCKED));

    await expect(
      strategy.validate({
        sub: 'user-id',
        email: 'usuario@lifemed.com',
        role: UserRole.PATIENT,
      }),
    ).rejects.toThrow(
      'Sua conta está bloqueada. Entre em contato com o administrador.',
    );
  });

  it('keeps verified users authorized and exposes userId', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser(UserStatus.VERIFIED));

    await expect(
      strategy.validate({
        sub: 'user-id',
        email: 'usuario@lifemed.com',
        role: UserRole.PATIENT,
      }),
    ).resolves.toMatchObject({
      id: 'user-id',
      userId: 'user-id',
      status: UserStatus.VERIFIED,
    });
  });
});

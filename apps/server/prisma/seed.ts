
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();


async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);

  // Usuário Admin
  await prisma.user.upsert({
    where: { email: 'admin@lifemed.com' },
    update: {},
    create: {
      email: 'admin@lifemed.com',
      cpf: '00000000000',
      password: hashedPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      status: UserStatus.VERIFIED,
    },
  });

  // Profissional de Saúde
  await prisma.user.upsert({
    where: { email: 'medico@lifemed.com' },
    update: {},
    create: {
      email: 'medico@lifemed.com',
      cpf: '11111111111',
      password: hashedPassword,
      name: 'Dr. Voluntário',
      role: UserRole.PROFESSIONAL,
      status: UserStatus.VERIFIED,
      professionalProfile: {
        create: {
          professionalLicense: 'CRM123456',
          specialty: 'Clínico Geral',
          modality: 'VIRTUAL',
        },
      },
    },
    include: { professionalProfile: true },
  });

  // Paciente
  await prisma.user.upsert({
    where: { email: 'paciente@lifemed.com' },
    update: {},
    create: {
      email: 'paciente@lifemed.com',
      cpf: '22222222222',
      password: hashedPassword,
      name: 'Paciente Exemplo',
      role: UserRole.PATIENT,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      patientProfile: {
        create: {
          phone: '+5571999990001',
          gender: 'M',
          address: 'Rua das Flores, 100, Salvador - BA',
        },
      },
    },
  });

  // Gestor (Manager)
  await prisma.user.upsert({
    where: { email: 'gestor@lifemed.com' },
    update: {},
    create: {
      email: 'gestor@lifemed.com',
      cpf: '33333333333',
      password: hashedPassword,
      name: 'Gestor Exemplo',
      role: UserRole.MANAGER,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      managerProfile: {
        create: {
          phone: '+5571999990002',
          bio: 'Gestor responsável pelo agendamento de consultas.',
          address: 'Av. Sete de Setembro, 200, Salvador - BA',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

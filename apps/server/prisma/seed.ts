
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
      patientProfile: {
        create: {
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

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔁 Seed mínimo: iniciando (4 roles)...');

  // Limpeza defensiva — idempotente se não houver tabelas
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE appointments, availability, vulnerability_questionnaires,
    professional_profiles, patient_profiles, manager_profiles, password_resets,
    email_verifications, sessions, users, specialties RESTART IDENTITY CASCADE;
  `);

  const plain = 'Senha123!';
  const hashed = bcrypt.hashSync(plain, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@local.test',
      password: hashed,
      name: 'Administrador',
      role: UserRole.ADMIN,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      cpf: '00000000000',
    },
  });

  const patient = await prisma.user.create({
    data: {
      email: 'paciente@local.test',
      password: hashed,
      name: 'Paciente Teste',
      role: UserRole.PATIENT,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      cpf: '11111111111',
      patientProfile: { create: { phone: '(00) 00000-0000' } },
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'gestor@local.test',
      password: hashed,
      name: 'Gestor Teste',
      role: UserRole.MANAGER,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      cpf: '22222222222',
      managerProfile: { create: { phone: '(00) 00000-0000' } },
    },
  });

  const professional = await prisma.user.create({
    data: {
      email: 'profissional@local.test',
      password: hashed,
      name: 'Profissional Teste',
      role: UserRole.PROFESSIONAL,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      cpf: '33333333333',
      professionalProfile: {
        create: {
          professionalLicense: 'CRM-TEST-0001',
          modality: 'VIRTUAL',
        },
      },
    },
  });

  console.log('✅ Seed mínimo criado:');
  console.log('   senha (todas):', plain);
  console.log('   admin:', admin.email);
  console.log('   paciente:', patient.email);
  console.log('   gestor:', manager.email);
  console.log('   profissional:', professional.email);
}

main()
  .catch((e) => {
    console.error('Erro no seed-minimal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import {
  PrismaClient,
  UserRole,
  UserStatus,
  AppointmentModality,
  AppointmentStatus,
} from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// Helper para gerar UUIDs fixos e garantir idempotência absoluta em tabelas sem unique constraints óbvios.
function generateUUID(prefix: string, index: number) {
  const padIndex = String(index).padStart(12, '0');
  return `${prefix}-0000-4000-8000-${padIndex}`;
}

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...');

  const passwordText = 'Senha123!';
  const hashedPassword = bcryptjs.hashSync(passwordText, 10);

  // ─────────────────────────────────────────
  // 1. ESPECIALIDADES MÉDICAS
  // ─────────────────────────────────────────
  console.log('⏳ Criando Especialidades...');
  const specialitiesList = [
    'Cardiologia',
    'Pediatria',
    'Dermatologia',
    'Ortopedia',
    'Psiquiatria',
    'Ginecologia e Obstetrícia',
    'Neurologia',
    'Clínica Médica',
  ];

  const specialitiesData: any[] = [];
  for (const name of specialitiesList) {
    const specialty = await prisma.speciality.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    specialitiesData.push(specialty);
  }
  console.log(`  ${specialitiesData.length} Especialidades criadas/atualizadas.`);

  // ─────────────────────────────────────────
  // 2. ADMIN 
  // ─────────────────────────────────────────
  console.log('⏳ Criando Administrador...');
  await prisma.user.upsert({
    where: { email: 'admin@lifemed.com' },
    update: {
      password: hashedPassword, // Garantindo que fique com a senha atualizada caso mude
    },
    create: {
      email: 'admin@lifemed.com',
      cpf: '00000000000',
      password: hashedPassword,
      name: 'Administrador do Sistema',
      role: UserRole.ADMIN,
      status: UserStatus.VERIFIED,
      emailVerified: true,
    },
  });
  console.log('  Admin criado/atualizado.');

  // ─────────────────────────────────────────
  // 3. PROFISSIONAIS 
  // ─────────────────────────────────────────
  console.log('⏳ Criando Profissionais e Disponibilidades...');
  const professionalsInput = [
    { email: 'roberto.souza@lifemed.com', cpf: '11111111101', name: 'Dr. Roberto Souza', crm: 'CRM-SP 10001', specs: [0, 7] }, // Cardiologia, Clínica Médica
    { email: 'ana.costa@lifemed.com', cpf: '11111111102', name: 'Dra. Ana Costa', crm: 'CRM-SP 10002', specs: [1] }, // Pediatria
    { email: 'carlos.lima@lifemed.com', cpf: '11111111103', name: 'Dr. Carlos Lima', crm: 'CRM-SP 10003', specs: [2, 7] }, // Dermatologia, Clínica Médica
    { email: 'fernanda.alves@lifemed.com', cpf: '11111111104', name: 'Dra. Fernanda Alves', crm: 'CRM-SP 10004', specs: [3] }, // Ortopedia
    { email: 'joao.mendes@lifemed.com', cpf: '11111111105', name: 'Dr. João Mendes', crm: 'CRM-SP 10005', specs: [4] }, // Psiquiatria
    { email: 'camila.rocha@lifemed.com', cpf: '11111111106', name: 'Dra. Camila Rocha', crm: 'CRM-SP 10006', specs: [5] }, // Ginecologia
    { email: 'paulo.silva@lifemed.com', cpf: '11111111107', name: 'Dr. Paulo Silva', crm: 'CRM-SP 10007', specs: [6] }, // Neurologia
    { email: 'mariana.santos@lifemed.com', cpf: '11111111108', name: 'Dra. Mariana Santos', crm: 'CRM-SP 10008', specs: [7] }, // Clínica Médica
    { email: 'tiago.freitas@lifemed.com', cpf: '11111111109', name: 'Dr. Tiago Freitas', crm: 'CRM-SP 10009', specs: [0] }, // Cardiologia
    { email: 'beatriz.nogueira@lifemed.com', cpf: '11111111110', name: 'Dra. Beatriz Nogueira', crm: 'CRM-SP 10010', specs: [1, 2] }, // Pediatria, Dermatologia
  ];

  const professionals: any[] = [];
  let availabilityIndex = 0;

  for (const p of professionalsInput) {
    const specialtiesToConnect = p.specs.map(index => ({ id: specialitiesData[index].id }));

    const profUser = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        password: hashedPassword,
        professionalProfile: {
          update: {
            specialities: {
              set: specialtiesToConnect
            }
          }
        }
      },
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedPassword,
        name: p.name,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.VERIFIED, // Nascem verificados para agilizar testes
        emailVerified: true,
        professionalProfile: {
          create: {
            professionalLicense: p.crm,
            specialities: {
              connect: specialtiesToConnect
            },
            modality: AppointmentModality.VIRTUAL,
            bio: 'Profissional especialista altamente qualificado. Focado no bem-estar e na saúde humana de forma integrada.',
            price: 250.0,
            payments: { pix: true, cartao: true },
          }
        }
      },
      include: { professionalProfile: true },
    });
    professionals.push(profUser);

    // Idempotência na disponibilidade
    // Usamos um UUID fixo composto pelo index do profissional + index do dia para não duplicar na rodada dupla.
    const days = [1, 2, 3, 4, 5]; // Segunda a Sexta
    for (let d = 0; d < days.length; d++) {
      const availId = generateUUID('22222222', availabilityIndex++);
      await prisma.availability.upsert({
        where: { id: availId },
        update: {},
        create: {
          id: availId,
          professionalId: profUser.id,
          dayOfWeek: days[d],
          startTime: '08:00',
          endTime: '17:00',
          validFrom: new Date('2025-01-01'),
        }
      });
    }
  }
  console.log(`  ${professionals.length} Profissionais e Disponibilidades criados.`);

  // ─────────────────────────────────────────
  // 4. PACIENTES 
  // ─────────────────────────────────────────
  console.log('⏳ Criando Pacientes...');
  const patientsInput = [
    { email: 'paciente.marcos@gmail.com', cpf: '22222222201', name: 'Marcos de Almeida' },
    { email: 'paciente.luiza@gmail.com', cpf: '22222222202', name: 'Luiza Pereira' },
    { email: 'paciente.fernando@gmail.com', cpf: '22222222203', name: 'Fernando Gomes' },
    { email: 'paciente.amanda@gmail.com', cpf: '22222222204', name: 'Amanda Ribeiro' },
    { email: 'paciente.diego@gmail.com', cpf: '22222222205', name: 'Diego Batista' },
    { email: 'paciente.juliana@gmail.com', cpf: '22222222206', name: 'Juliana Vieira' },
    { email: 'paciente.rafael@gmail.com', cpf: '22222222207', name: 'Rafael Barros' },
    { email: 'paciente.claudia@gmail.com', cpf: '22222222208', name: 'Cláudia Castro' },
    { email: 'paciente.ricardo@gmail.com', cpf: '22222222209', name: 'Ricardo Dias' },
    { email: 'paciente.vanessa@gmail.com', cpf: '22222222210', name: 'Vanessa Moraes' },
  ];

  const patients: any[] = [];
  for (const p of patientsInput) {
    const patientUser = await prisma.user.upsert({
      where: { email: p.email },
      update: { password: hashedPassword },
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedPassword,
        name: p.name,
        role: UserRole.PATIENT,
        status: UserStatus.VERIFIED,
        emailVerified: true,
        patientProfile: {
          create: {
            phone: '(11) 99999-0000',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Masculino',
          },
        },
      },
      include: { patientProfile: true },
    });
    patients.push(patientUser);
  }
  console.log(`  ${patients.length} Pacientes criados.`);

   // ─────────────────────────────────────────
  // 5. GESTORES 
  // ─────────────────────────────────────────
  console.log('⏳ Criando Gestor...');
  const gestorUser = await prisma.user.upsert({
    where: { email: 'gestor@lifemed.com' },
    update: { password: hashedPassword },
    create: {
      email: 'gestor@lifemed.com',
      cpf: '33333333301',
      password: hashedPassword,
      name: 'Gestor do Sistema',
      role: UserRole.MANAGER,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      managerProfile: {
        create: {
          phone: '(11) 99999-1111',
          bio: 'Gestor responsável pela administração do sistema.',
        },
      },
    },
    include: { managerProfile: true },
  });
  console.log('  Gestor criado/atualizado.');

  // ─────────────────────────────────────────
  // 6. CONSULTAS 
  // ─────────────────────────────────────────
  console.log('⏳ Criando Consultas (Appointments)...');

  const appointmentsInput = [
    { pIdx: 0, dIdx: 0, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -10 },
    { pIdx: 1, dIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -5 },
    { pIdx: 2, dIdx: 2, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -2 },
    { pIdx: 3, dIdx: 3, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -1 },
    { pIdx: 4, dIdx: 4, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -4 },
    { pIdx: 5, dIdx: 5, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 2 },
    { pIdx: 6, dIdx: 6, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 5 },
    { pIdx: 7, dIdx: 7, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.HOME_VISIT, daysDiff: 7 },
    { pIdx: 8, dIdx: 8, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 10 },
    { pIdx: 9, dIdx: 9, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -12 },
    { pIdx: 0, dIdx: 5, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 6 },
    { pIdx: 1, dIdx: 4, status: AppointmentStatus.PENDING, modality: AppointmentModality.CLINIC, daysDiff: 8 },
    { pIdx: 2, dIdx: 3, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -20 },
    { pIdx: 3, dIdx: 2, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.HOME_VISIT, daysDiff: -15 },
    { pIdx: 4, dIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -30 },
    { pIdx: 5, dIdx: 0, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 12 },
    { pIdx: 6, dIdx: 9, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -8 },
    { pIdx: 7, dIdx: 8, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 14 }
  ];

  // Helper para gerar datas
  const getRelativeDate = (daysDifference: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + daysDifference);
    d.setUTCHours(14, 0, 0, 0);
    return d;
  };

  let appointmentsCreated = 0;
  for (let i = 0; i < appointmentsInput.length; i++) {
    const { pIdx, dIdx, status, modality, daysDiff } = appointmentsInput[i];

    const patientUser = patients[pIdx];
    const profUser = professionals[dIdx];

    const appointmentId = generateUUID('11111111', i);

    await prisma.appointment.upsert({
      where: { id: appointmentId },
      update: {
        status,
        modality,
        dateTime: getRelativeDate(daysDiff),
      },
      create: {
        id: appointmentId,
        patientId: patientUser.id,
        professionalId: profUser.id,
        status,
        modality,
        dateTime: getRelativeDate(daysDiff),
        notes:
          status === AppointmentStatus.COMPLETED
            ? 'Consulta realizada com sucesso. Paciente bem e medicado.'
            : null,
      }
    });
    appointmentsCreated++;
  }

  console.log(`  ${appointmentsCreated} Consultas criadas.`);

  // ─────────────────────────────────────────
  // 7. QUESTIONÁRIO DE VULNERABILIDADE
  // ─────────────────────────────────────────
  console.log('⏳ Criando Questionário de Vulnerabilidade...');

  const QUESTIONNAIRE_ID = generateUUID('99999999', 1);
  const SEED_QUESTIONS = [
    {
      id: generateUUID('99999999', 10),
      label: 'Qual é a renda mensal da família?',
      order: 1,
      options: [
        { id: generateUUID('99999999', 11), label: 'Até 1 salário mínimo', score: 3, order: 1 },
        { id: generateUUID('99999999', 12), label: 'Entre 1 e 2 salários mínimos', score: 2, order: 2 },
        { id: generateUUID('99999999', 13), label: 'Entre 2 e 3 salários mínimos', score: 1, order: 3 },
        { id: generateUUID('99999999', 14), label: 'Acima de 3 salários mínimos', score: 0, order: 4 },
      ],
    },
    {
      id: generateUUID('99999999', 20),
      label: 'Quantas pessoas dependem dessa renda?',
      order: 2,
      options: [
        { id: generateUUID('99999999', 21), label: 'Até 2 pessoas', score: 0, order: 1 },
        { id: generateUUID('99999999', 22), label: '3 ou mais pessoas', score: 1, order: 2 },
      ],
    },
    {
      id: generateUUID('99999999', 30),
      label: 'Você ou alguém da família está desempregado?',
      order: 3,
      options: [
        { id: generateUUID('99999999', 31), label: 'Sim', score: 2, order: 1 },
        { id: generateUUID('99999999', 32), label: 'Não', score: 0, order: 2 },
      ],
    },
    {
      id: generateUUID('99999999', 40),
      label: 'Possui CadÚnico?',
      order: 4,
      options: [
        { id: generateUUID('99999999', 41), label: 'Sim', score: 4, order: 1 },
        { id: generateUUID('99999999', 42), label: 'Não', score: 0, order: 2 },
      ],
    },
    {
      id: generateUUID('99999999', 50),
      label: 'Sua moradia é própria?',
      order: 5,
      options: [
        { id: generateUUID('99999999', 51), label: 'Sim', score: 0, order: 1 },
        { id: generateUUID('99999999', 52), label: 'Não', score: 1, order: 2 },
      ],
    },
    {
      id: generateUUID('99999999', 60),
      label: 'A casa possui água encanada?',
      order: 6,
      options: [
        { id: generateUUID('99999999', 61), label: 'Sim', score: 0, order: 1 },
        { id: generateUUID('99999999', 62), label: 'Não', score: 1, order: 2 },
      ],
    },
    {
      id: generateUUID('99999999', 70),
      label: 'Há saneamento básico (esgoto)?',
      order: 7,
      options: [
        { id: generateUUID('99999999', 71), label: 'Sim', score: 0, order: 1 },
        { id: generateUUID('99999999', 72), label: 'Não', score: 1, order: 2 },
      ],
    },
  ];

  await prisma.questionnaire.upsert({
    where: { id: QUESTIONNAIRE_ID },
    update: { vulnerabilityThreshold: 6 },
    create: {
      id: QUESTIONNAIRE_ID,
      vulnerabilityThreshold: 6,
    },
  });

  for (const q of SEED_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: { label: q.label, order: q.order, isActive: true },
      create: {
        id: q.id,
        questionnaireId: QUESTIONNAIRE_ID,
        label: q.label,
        order: q.order,
      },
    });
    for (const opt of q.options) {
      await prisma.questionOption.upsert({
        where: { id: opt.id },
        update: { label: opt.label, score: opt.score, order: opt.order, isActive: true },
        create: {
          id: opt.id,
          questionId: q.id,
          label: opt.label,
          score: opt.score,
          order: opt.order,
        },
      });
    }
  }
  console.log('  Questionário de Vulnerabilidade criado/atualizado.');

  console.log('🎉 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('  Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

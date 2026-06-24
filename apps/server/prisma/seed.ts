import {
  PrismaClient,
  UserRole,
  UserStatus,
  AppointmentModality,
  AppointmentStatus,
  PatientApprovalStatus,
  QuestionnaireAnsweredBy,
} from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

function generateUUID(prefix: string, index: number) {
  const padIndex = String(index).padStart(12, '0');
  return `${prefix}-0000-4000-8000-${padIndex}`;
}

const getRelativeDate = (daysDifference: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysDifference);
  d.setUTCHours(14, 0, 0, 0);
  return d;
};

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
    update: { password: hashedPassword },
    create: {
      email: 'admin@lifemed.com',
      cpf: null,
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
    { email: 'roberto.souza@lifemed.com', cpf: '11111111101', name: 'Dr. Roberto Souza', crm: 'CRM-SP 10001', specs: [0, 7] },
    { email: 'ana.costa@lifemed.com', cpf: '11111111102', name: 'Dra. Ana Costa', crm: 'CRM-SP 10002', specs: [1] },
    { email: 'carlos.lima@lifemed.com', cpf: '11111111103', name: 'Dr. Carlos Lima', crm: 'CRM-SP 10003', specs: [2, 7] },
    { email: 'fernanda.alves@lifemed.com', cpf: '11111111104', name: 'Dra. Fernanda Alves', crm: 'CRM-SP 10004', specs: [3] },
    { email: 'joao.mendes@lifemed.com', cpf: '11111111105', name: 'Dr. João Mendes', crm: 'CRM-SP 10005', specs: [4] },
    { email: 'camila.rocha@lifemed.com', cpf: '11111111106', name: 'Dra. Camila Rocha', crm: 'CRM-SP 10006', specs: [5] },
    { email: 'paulo.silva@lifemed.com', cpf: '11111111107', name: 'Dr. Paulo Silva', crm: 'CRM-SP 10007', specs: [6] },
    { email: 'mariana.santos@lifemed.com', cpf: '11111111108', name: 'Dra. Mariana Santos', crm: 'CRM-SP 10008', specs: [7] },
    { email: 'tiago.freitas@lifemed.com', cpf: '11111111109', name: 'Dr. Tiago Freitas', crm: 'CRM-SP 10009', specs: [0] },
    { email: 'beatriz.nogueira@lifemed.com', cpf: '11111111110', name: 'Dra. Beatriz Nogueira', crm: 'CRM-SP 10010', specs: [1, 2] },
  ];

  const professionals: any[] = [];
  let availabilityIndex = 0;

  for (const p of professionalsInput) {
    const specialtiesToConnect = p.specs.map((index) => ({ id: specialitiesData[index].id }));

    const profUser = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        password: hashedPassword,
        professionalProfile: {
          update: {
            specialities: { set: specialtiesToConnect },
          },
        },
      },
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedPassword,
        name: p.name,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.VERIFIED,
        emailVerified: true,
        professionalProfile: {
          create: {
            professionalLicense: p.crm,
            specialities: { connect: specialtiesToConnect },
            modality: AppointmentModality.VIRTUAL,
            bio: 'Profissional especialista altamente qualificado. Focado no bem-estar e na saúde humana de forma integrada.',
            price: 250.0,
            payments: { pix: true, cartao: true },
          },
        },
      },
      include: { professionalProfile: true },
    });
    professionals.push(profUser);

    const days = [1, 2, 3, 4, 5];
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
        },
      });
    }
  }
  console.log(`  ${professionals.length} Profissionais e Disponibilidades criados.`);

  // ─────────────────────────────────────────
  // 4. PACIENTES
  // Variações de approvalStatus para cobrir todos os estados do fluxo.
  // ─────────────────────────────────────────
  console.log('⏳ Criando Pacientes...');
  const patientsInput = [
    { email: 'paciente.marcos@gmail.com', cpf: '22222222201', name: 'Marcos de Almeida', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.luiza@gmail.com', cpf: '22222222202', name: 'Luiza Pereira', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.fernando@gmail.com', cpf: '22222222203', name: 'Fernando Gomes', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.amanda@gmail.com', cpf: '22222222204', name: 'Amanda Ribeiro', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.diego@gmail.com', cpf: '22222222205', name: 'Diego Batista', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.juliana@gmail.com', cpf: '22222222206', name: 'Juliana Vieira', gender: 'Feminino', approval: PatientApprovalStatus.PENDING },
    { email: 'paciente.rafael@gmail.com', cpf: '22222222207', name: 'Rafael Barros', gender: 'Masculino', approval: PatientApprovalStatus.PENDING },
    { email: 'paciente.claudia@gmail.com', cpf: '22222222208', name: 'Cláudia Castro', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED },
    { email: 'paciente.ricardo@gmail.com', cpf: '22222222209', name: 'Ricardo Dias', gender: 'Masculino', approval: PatientApprovalStatus.REJECTED },
    { email: 'paciente.vanessa@gmail.com', cpf: '22222222210', name: 'Vanessa Moraes', gender: 'Feminino', approval: PatientApprovalStatus.PENDING },
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
            dateOfBirth: new Date('1990-06-15'),
            gender: p.gender,
            approvalStatus: p.approval,
          },
        },
      },
      include: { patientProfile: true },
    });
    patients.push(patientUser);
  }
  console.log(`  ${patients.length} Pacientes criados.`);

  // ─────────────────────────────────────────
  // 4.1. ENDEREÇOS DOS PACIENTES
  // ─────────────────────────────────────────
  console.log('⏳ Criando Endereços...');
  const addressData = [
    { zipCode: '01310-100', street: 'Avenida Paulista', number: '1000', district: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    { zipCode: '20040-020', street: 'Avenida Rio Branco', number: '156', district: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
    { zipCode: '30112-000', street: 'Avenida Afonso Pena', number: '200', district: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    { zipCode: '40020-000', street: 'Avenida Sete de Setembro', number: '450', district: 'Centro', city: 'Salvador', state: 'BA' },
    { zipCode: '60060-310', street: 'Rua Barão do Rio Branco', number: '100', district: 'Centro', city: 'Fortaleza', state: 'CE' },
  ];

  let addressesCreated = 0;
  for (let i = 0; i < Math.min(patients.length, addressData.length); i++) {
    const existing = await prisma.address.findUnique({ where: { userId: patients[i].id } });
    if (!existing) {
      await prisma.address.create({
        data: {
          userId: patients[i].id,
          ...addressData[i],
        },
      });
      addressesCreated++;
    }
  }
  console.log(`  ${addressesCreated} Endereços criados.`);

  // ─────────────────────────────────────────
  // 5. GESTOR
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
    { pIdx: 7, dIdx: 8, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 14 },
  ];

  let appointmentsCreated = 0;
  for (let i = 0; i < appointmentsInput.length; i++) {
    const { pIdx, dIdx, status, modality, daysDiff } = appointmentsInput[i];
    const patientUser = patients[pIdx];
    const profUser = professionals[dIdx];
    const appointmentId = generateUUID('11111111', i);

    await prisma.appointment.upsert({
      where: { id: appointmentId },
      update: { status, modality, dateTime: getRelativeDate(daysDiff) },
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
      },
    });
    appointmentsCreated++;
  }
  console.log(`  ${appointmentsCreated} Consultas criadas.`);

  // ─────────────────────────────────────────
  // 6.1. CENÁRIO DE TESTE — PRONTUÁRIOS
  // ─────────────────────────────────────────
  console.log('⏳ Criando cenário de prontuários (controle de acesso entre médicos)...');

  const sharedPatient = patients[0];
  const doctorA = professionals[0];
  const doctorB = professionals[1];
  const doctorNoLink = professionals[8];

  const recordScenarios = [
    {
      doctor: doctorA,
      daysDiff: -25,
      modality: AppointmentModality.CLINIC,
      record: {
        chiefComplaint: 'Dor torácica e palpitações há 1 semana.',
        diagnosis: 'Arritmia cardíaca leve (extrassístoles).',
        treatmentPlan: 'Reduzir cafeína, monitorar pressão arterial e retorno em 30 dias.',
        prescriptions: 'Propranolol 40mg — 1 comprimido ao dia.',
        internalNotes: 'Prontuário do Dr. Roberto (Cardiologia). Anotação interna do cardiologista.',
      },
    },
    {
      doctor: doctorB,
      daysDiff: -18,
      modality: AppointmentModality.VIRTUAL,
      record: {
        chiefComplaint: 'Acompanhamento de quadro alérgico respiratório.',
        diagnosis: 'Rinite alérgica sazonal.',
        treatmentPlan: 'Anti-histamínico e controle ambiental de poeira.',
        prescriptions: 'Loratadina 10mg — 1 comprimido ao dia por 15 dias.',
        internalNotes: 'Prontuário da Dra. Ana (Pediatria). Anotação interna da pediatra.',
      },
    },
  ];

  let recordsCreated = 0;
  for (let i = 0; i < recordScenarios.length; i++) {
    const { doctor, daysDiff, modality, record } = recordScenarios[i];
    const apptId = generateUUID('33333333', i);
    const recordId = generateUUID('44444444', i);

    await prisma.appointment.upsert({
      where: { id: apptId },
      update: { status: AppointmentStatus.COMPLETED, modality, dateTime: getRelativeDate(daysDiff) },
      create: {
        id: apptId,
        patientId: sharedPatient.id,
        professionalId: doctor.id,
        status: AppointmentStatus.COMPLETED,
        modality,
        dateTime: getRelativeDate(daysDiff),
        notes: 'Consulta com prontuário registrado (cenário de teste de acesso).',
      },
    });

    await prisma.medicalRecord.upsert({
      where: { id: recordId },
      update: { ...record },
      create: {
        id: recordId,
        appointmentId: apptId,
        patientId: sharedPatient.id,
        authorId: doctor.id,
        ...record,
      },
    });
    recordsCreated++;
  }

  const noLinkCount = await prisma.appointment.count({
    where: {
      professionalId: doctorNoLink.id,
      patientId: sharedPatient.id,
      status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] },
    },
  });

  console.log(`  ${recordsCreated} prontuários criados.`);
  console.log('  ── Cenário de teste de acesso a prontuários ──');
  console.log(`     Paciente: ${sharedPatient.name} (${sharedPatient.email})`);
  console.log(`     ✅ ${doctorA.name} — COM vínculo → vê o prontuário de ${doctorB.name}`);
  console.log(`     ✅ ${doctorB.name} — COM vínculo → vê o prontuário de ${doctorA.name}`);
  console.log(`     ❌ ${doctorNoLink.name} — SEM vínculo (${noLinkCount} consultas) → deve receber 403`);

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
    create: { id: QUESTIONNAIRE_ID, vulnerabilityThreshold: 6 },
  });

  for (const q of SEED_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: { label: q.label, order: q.order, isActive: true },
      create: { id: q.id, questionnaireId: QUESTIONNAIRE_ID, label: q.label, order: q.order },
    });
    for (const opt of q.options) {
      await prisma.questionOption.upsert({
        where: { id: opt.id },
        update: { label: opt.label, score: opt.score, order: opt.order, isActive: true },
        create: { id: opt.id, questionId: q.id, label: opt.label, score: opt.score, order: opt.order },
      });
    }
  }
  console.log('  Questionário criado/atualizado.');

  // ─────────────────────────────────────────
  // 7.1. RESPOSTAS DE QUESTIONÁRIO
  // Popula 3 pacientes com questionários respondidos (1 vulnerável, 2 não-vulneráveis)
  // para que os filtros do gestor tenham dados reais.
  // ─────────────────────────────────────────
  console.log('⏳ Criando respostas de questionário...');

  const questionnaireScenarios = [
    {
      patient: patients[0], // Marcos — vulnerável (score alto)
      answers: [
        { qIdx: 0, optIdx: 0 }, // Até 1 SM — score 3
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 0 }, // Desempregado sim — score 2
        { qIdx: 3, optIdx: 0 }, // CadÚnico sim — score 4
        { qIdx: 4, optIdx: 1 }, // Moradia não própria — score 1
        { qIdx: 5, optIdx: 1 }, // Sem água encanada — score 1
        { qIdx: 6, optIdx: 1 }, // Sem saneamento — score 1
      ], // total = 13 → vulnerável (threshold 6)
      isVulnerable: true,
    },
    {
      patient: patients[1], // Luiza — não vulnerável
      answers: [
        { qIdx: 0, optIdx: 3 }, // Acima 3 SM — score 0
        { qIdx: 1, optIdx: 0 }, // Até 2 pessoas — score 0
        { qIdx: 2, optIdx: 1 }, // Não desempregado — score 0
        { qIdx: 3, optIdx: 1 }, // Sem CadÚnico — score 0
        { qIdx: 4, optIdx: 0 }, // Moradia própria — score 0
        { qIdx: 5, optIdx: 0 }, // Com água encanada — score 0
        { qIdx: 6, optIdx: 0 }, // Com saneamento — score 0
      ], // total = 0 → não vulnerável
      isVulnerable: false,
    },
    {
      patient: patients[2], // Fernando — borderline (score 4)
      answers: [
        { qIdx: 0, optIdx: 2 }, // 2-3 SM — score 1
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 1 }, // Não desempregado — score 0
        { qIdx: 3, optIdx: 1 }, // Sem CadÚnico — score 0
        { qIdx: 4, optIdx: 1 }, // Moradia não própria — score 1
        { qIdx: 5, optIdx: 0 }, // Com água encanada — score 0
        { qIdx: 6, optIdx: 1 }, // Sem saneamento — score 1
      ], // total = 4 → não vulnerável (abaixo de 6)
      isVulnerable: false,
    },
  ];

  let questionnairesCreated = 0;
  for (let s = 0; s < questionnaireScenarios.length; s++) {
    const { patient, answers, isVulnerable } = questionnaireScenarios[s];

    if (!patient.patientProfile) continue;

    const existing = await prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId: patient.patientProfile.id },
    });
    if (existing) continue;

    const totalScore = answers.reduce((sum, a) => {
      return sum + SEED_QUESTIONS[a.qIdx].options[a.optIdx].score;
    }, 0);

    const vulnQId = generateUUID('88888888', s);
    await prisma.vulnerabilityQuestionnaire.create({
      data: {
        id: vulnQId,
        patientProfileId: patient.patientProfile.id,
        questionnaireId: QUESTIONNAIRE_ID,
        answeredBy: QuestionnaireAnsweredBy.PATIENT,
        answeredByUserId: patient.id,
        totalScore,
        isVulnerable,
        answers: {
          create: answers.map((a) => ({
            questionId: SEED_QUESTIONS[a.qIdx].id,
            optionId: SEED_QUESTIONS[a.qIdx].options[a.optIdx].id,
          })),
        },
      },
    });

    // Marca questionário como concluído no perfil
    await prisma.patientProfile.update({
      where: { id: patient.patientProfile.id },
      data: { questionnaireCompleted: true },
    });

    questionnairesCreated++;
  }
  console.log(`  ${questionnairesCreated} respostas de questionário criadas.`);

  // ─────────────────────────────────────────
  // 8. BLOQUEIOS DE AGENDA
  // ─────────────────────────────────────────
  console.log('⏳ Criando bloqueios de agenda...');

  const scheduleBlocks = [
    { profIdx: 0, date: '2026-07-04', startTime: '12:00', endTime: '14:00' }, // almoço prolongado
    { profIdx: 1, date: '2026-07-10', startTime: null, endTime: null },         // dia inteiro bloqueado
    { profIdx: 2, date: '2026-07-15', startTime: '08:00', endTime: '10:00' },
  ];

  let blocksCreated = 0;
  for (let i = 0; i < scheduleBlocks.length; i++) {
    const { profIdx, date, startTime, endTime } = scheduleBlocks[i];
    const blockId = generateUUID('55555555', i);
    const existing = await prisma.scheduleBlock.findUnique({ where: { id: blockId } });
    if (!existing) {
      await prisma.scheduleBlock.create({
        data: {
          id: blockId,
          professionalId: professionals[profIdx].id,
          date,
          startTime,
          endTime,
        },
      });
      blocksCreated++;
    }
  }
  console.log(`  ${blocksCreated} bloqueios de agenda criados.`);

  console.log('\n🎉 Seed finalizado com sucesso!');
  console.log('\n📋 Credenciais de acesso (senha: Senha123!):');
  console.log('   ADMIN       → admin@lifemed.com');
  console.log('   GESTOR      → gestor@lifemed.com');
  console.log('   PROFISSIONAL→ roberto.souza@lifemed.com (e outros 9)');
  console.log('   PACIENTE    → paciente.marcos@gmail.com (APPROVED, vulnerável)');
  console.log('   PACIENTE    → paciente.luiza@gmail.com  (APPROVED, não vulnerável)');
  console.log('   PACIENTE    → paciente.juliana@gmail.com (PENDING)');
  console.log('   PACIENTE    → paciente.ricardo@gmail.com (REJECTED)');
}

main()
  .catch((e) => {
    console.error('  Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

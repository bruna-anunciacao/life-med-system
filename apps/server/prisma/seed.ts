import {
  PrismaClient,
  UserRole,
  UserStatus,
  AppointmentModality,
  AppointmentStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // ─────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────
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
      emailVerified: true,
    },
  });

  console.log('✅ Admin created');

  // ─────────────────────────────────────────
  // DOCTORS
  // ─────────────────────────────────────────
  const doctorsData = [
    {
      email: 'ana.oliveira@lifemed.com',
      cpf: '11111111101',
      name: 'Dra. Ana Oliveira',
      profile: {
        professionalLicense: 'CRM-BA 12345',
        specialty: 'Cardiologia',
        subspecialty: 'Cardiologia Intervencionista',
        modality: AppointmentModality.CLINIC,
        bio: 'Cardiologista com 15 anos de experiência, especialista em doenças coronarianas e insuficiência cardíaca.',
        address: 'Rua das Flores, 123 - Salvador, BA',
        price: 250.0,
        payments: { pix: true, cartao: true, convenio: true },
      },
    },
    {
      email: 'carlos.santos@lifemed.com',
      cpf: '11111111102',
      name: 'Dr. Carlos Santos',
      profile: {
        professionalLicense: 'CRM-BA 23456',
        specialty: 'Clínico Geral',
        subspecialty: null,
        modality: AppointmentModality.VIRTUAL,
        bio: 'Médico clínico geral com atendimento humanizado e foco em medicina preventiva.',
        address: null,
        price: 150.0,
        payments: { pix: true, cartao: true, convenio: false },
      },
    },
    {
      email: 'mariana.costa@lifemed.com',
      cpf: '11111111103',
      name: 'Dra. Mariana Costa',
      profile: {
        professionalLicense: 'CRM-BA 34567',
        specialty: 'Dermatologia',
        subspecialty: 'Dermatologia Clínica e Cirúrgica',
        modality: AppointmentModality.CLINIC,
        bio: 'Dermatologista especializada em doenças de pele, cabelo e unhas. Tratamentos estéticos e clínicos.',
        address: 'Av. Oceânica, 456 - Salvador, BA',
        price: 300.0,
        payments: { pix: true, cartao: true, convenio: false },
      },
    },
    {
      email: 'roberto.lima@lifemed.com',
      cpf: '11111111104',
      name: 'Dr. Roberto Lima',
      profile: {
        professionalLicense: 'CRM-BA 45678',
        specialty: 'Ortopedia',
        subspecialty: 'Coluna Vertebral',
        modality: AppointmentModality.HOME_VISIT,
        bio: 'Ortopedista com especialização em cirurgia de coluna e medicina esportiva.',
        address: 'Rua da Paz, 789 - Salvador, BA',
        price: 350.0,
        payments: { pix: true, cartao: true, convenio: true },
      },
    },
    {
      email: 'fernanda.alves@lifemed.com',
      cpf: '11111111105',
      name: 'Dra. Fernanda Alves',
      profile: {
        professionalLicense: 'CRM-BA 56789',
        specialty: 'Pediatria',
        subspecialty: 'Neonatologia',
        modality: AppointmentModality.VIRTUAL,
        bio: 'Pediatra com 10 anos de experiência em cuidados neonatais e desenvolvimento infantil.',
        address: null,
        price: 200.0,
        payments: { pix: true, cartao: false, convenio: true },
      },
    },
    {
      email: 'paulo.mendes@lifemed.com',
      cpf: '11111111106',
      name: 'Dr. Paulo Mendes',
      profile: {
        professionalLicense: 'CRM-BA 67890',
        specialty: 'Psiquiatria',
        subspecialty: 'Saúde Mental do Adulto',
        modality: AppointmentModality.VIRTUAL,
        bio: 'Psiquiatra focado no tratamento de transtornos de ansiedade, depressão e transtorno bipolar.',
        address: null,
        price: 280.0,
        payments: { pix: true, cartao: true, convenio: false },
      },
    },
    {
      email: 'lucia.ferreira@lifemed.com',
      cpf: '11111111107',
      name: 'Dra. Lúcia Ferreira',
      profile: {
        professionalLicense: 'CRM-BA 78901',
        specialty: 'Ginecologia e Obstetrícia',
        subspecialty: 'Alto Risco Obstétrico',
        modality: AppointmentModality.CLINIC,
        bio: 'Ginecologista e obstetra com foco em gestações de alto risco e saúde da mulher.',
        address: 'Rua Sete de Setembro, 321 - Salvador, BA',
        price: 320.0,
        payments: { pix: true, cartao: true, convenio: true },
      },
    },
    {
      email: 'thiago.rocha@lifemed.com',
      cpf: '11111111108',
      name: 'Dr. Thiago Rocha',
      profile: {
        professionalLicense: 'CRM-BA 89012',
        specialty: 'Neurologia',
        subspecialty: 'Neurologia Clínica',
        modality: AppointmentModality.CLINIC,
        bio: 'Neurologista especializado em epilepsia, cefaleia e doenças neurodegenerativas.',
        address: 'Av. Paralela, 654 - Salvador, BA',
        price: 400.0,
        payments: { pix: true, cartao: true, convenio: true },
      },
    },
  ];

  const doctors: Record<string, string> = {};

  for (const d of doctorsData) {
    const doctor = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        cpf: d.cpf,
        password: hashedPassword,
        name: d.name,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.VERIFIED,
        emailVerified: true,
        professionalProfile: { create: d.profile },
      },
      include: { professionalProfile: true },
    });
    doctors[d.email] = doctor.id;
  }

  console.log(`✅ ${doctorsData.length} doctors created`);

  // ─────────────────────────────────────────
  // AVAILABILITY for each doctor
  // ─────────────────────────────────────────
  // day_of_week: 0=Sun, 1=Mon, ..., 6=Sat
  const availabilityTemplates = [
    // Mon-Fri morning
    { days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '12:00' },
    // Mon-Fri afternoon
    { days: [1, 2, 3, 4, 5], startTime: '14:00', endTime: '18:00' },
    // Mon-Wed-Fri full
    { days: [1, 3, 5], startTime: '07:00', endTime: '17:00' },
    // Tue-Thu morning + Sat morning
    { days: [2, 4, 6], startTime: '09:00', endTime: '13:00' },
    // Mon-Thu afternoon
    { days: [1, 2, 3, 4], startTime: '13:00', endTime: '19:00' },
    // Wed-Fri morning
    { days: [3, 4, 5], startTime: '08:00', endTime: '14:00' },
    // Mon-Fri + Sat morning
    { days: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '12:00' },
    // Tue-Thu full day
    { days: [2, 3, 4], startTime: '07:00', endTime: '19:00' },
  ];

  const doctorIds = Object.values(doctors);
  for (let i = 0; i < doctorIds.length; i++) {
    const template = availabilityTemplates[i % availabilityTemplates.length];
    for (const day of template.days) {
      await prisma.availability.create({
        data: {
          professionalId: doctorIds[i],
          dayOfWeek: day,
          startTime: template.startTime,
          endTime: template.endTime,
          validFrom: new Date('2025-01-01'),
        },
      });
    }
  }

  console.log('✅ Availability slots created');

  // ─────────────────────────────────────────
  // PATIENTS
  // ─────────────────────────────────────────
  const patientsData = [
    {
      email: 'joao.silva@email.com',
      cpf: '22222222201',
      name: 'João Silva',
      profile: {
        phone: '(71) 99001-1001',
        dateOfBirth: new Date('1990-03-15'),
        gender: 'Masculino',
        address: 'Rua das Acácias, 10 - Salvador, BA',
      },
    },
    {
      email: 'maria.santos@email.com',
      cpf: '22222222202',
      name: 'Maria Santos',
      profile: {
        phone: '(71) 99001-2002',
        dateOfBirth: new Date('1985-07-22'),
        gender: 'Feminino',
        address: 'Av. Centenário, 200 - Salvador, BA',
      },
    },
    {
      email: 'pedro.lima@email.com',
      cpf: '22222222203',
      name: 'Pedro Lima',
      profile: {
        phone: '(71) 99001-3003',
        dateOfBirth: new Date('1978-11-08'),
        gender: 'Masculino',
        address: 'Rua do Comercio, 55 - Feira de Santana, BA',
      },
    },
    {
      email: 'ana.ferreira@email.com',
      cpf: '22222222204',
      name: 'Ana Ferreira',
      profile: {
        phone: '(71) 99001-4004',
        dateOfBirth: new Date('1995-01-30'),
        gender: 'Feminino',
        address: 'Av. Bonocô, 300 - Salvador, BA',
      },
    },
    {
      email: 'lucas.oliveira@email.com',
      cpf: '22222222205',
      name: 'Lucas Oliveira',
      profile: {
        phone: '(71) 99001-5005',
        dateOfBirth: new Date('2000-05-17'),
        gender: 'Masculino',
        address: 'Rua Chile, 77 - Salvador, BA',
      },
    },
    {
      email: 'julia.costa@email.com',
      cpf: '22222222206',
      name: 'Júlia Costa',
      profile: {
        phone: '(71) 99001-6006',
        dateOfBirth: new Date('1992-09-03'),
        gender: 'Feminino',
        address: 'Ladeira da Barra, 12 - Salvador, BA',
      },
    },
    {
      email: 'rafael.souza@email.com',
      cpf: '22222222207',
      name: 'Rafael Souza',
      profile: {
        phone: '(71) 99001-7007',
        dateOfBirth: new Date('1982-12-25'),
        gender: 'Masculino',
        address: 'Rua Direita de Santo Antônio, 8 - Salvador, BA',
      },
    },
    {
      email: 'camila.rodrigues@email.com',
      cpf: '22222222208',
      name: 'Camila Rodrigues',
      profile: {
        phone: '(71) 99001-8008',
        dateOfBirth: new Date('1998-04-14'),
        gender: 'Feminino',
        address: 'Av. Tancredo Neves, 450 - Salvador, BA',
      },
    },
    {
      email: 'marcos.alves@email.com',
      cpf: '22222222209',
      name: 'Marcos Alves',
      profile: {
        phone: '(71) 99001-9009',
        dateOfBirth: new Date('1975-08-19'),
        gender: 'Masculino',
        address: 'Rua Marquês de Caravelas, 90 - Salvador, BA',
      },
    },
    {
      email: 'beatriz.mendes@email.com',
      cpf: '22222222210',
      name: 'Beatriz Mendes',
      profile: {
        phone: '(71) 99001-0010',
        dateOfBirth: new Date('1988-06-07'),
        gender: 'Feminino',
        address: 'Rua Professor Lemos de Brito, 15 - Salvador, BA',
      },
    },
    {
      email: 'gabriel.nascimento@email.com',
      cpf: '22222222211',
      name: 'Gabriel Nascimento',
      profile: {
        phone: '(71) 99002-1011',
        dateOfBirth: new Date('2003-02-28'),
        gender: 'Masculino',
        address: 'Av. Milton Santos, 110 - Salvador, BA',
      },
    },
    {
      email: 'larissa.teixeira@email.com',
      cpf: '22222222212',
      name: 'Larissa Teixeira',
      profile: {
        phone: '(71) 99002-2012',
        dateOfBirth: new Date('1993-10-11'),
        gender: 'Feminino',
        address: 'Rua da Ajuda, 33 - Salvador, BA',
      },
    },
    {
      email: 'diego.carvalho@email.com',
      cpf: '22222222213',
      name: 'Diego Carvalho',
      profile: {
        phone: '(71) 99002-3013',
        dateOfBirth: new Date('1987-03-04'),
        gender: 'Masculino',
        address: 'Rua das Laranjeiras, 67 - Camaçari, BA',
      },
    },
    {
      email: 'isabela.gomes@email.com',
      cpf: '22222222214',
      name: 'Isabela Gomes',
      profile: {
        phone: '(71) 99002-4014',
        dateOfBirth: new Date('1996-07-09'),
        gender: 'Feminino',
        address: 'Av. ACM, 500 - Salvador, BA',
      },
    },
    {
      email: 'thiago.martins@email.com',
      cpf: '22222222215',
      name: 'Thiago Martins',
      profile: {
        phone: '(71) 99002-5015',
        dateOfBirth: new Date('1980-11-21'),
        gender: 'Masculino',
        address: 'Rua da Bela Vista, 44 - Lauro de Freitas, BA',
      },
    },
  ];

  const patients: Record<string, string> = {};

  for (const p of patientsData) {
    const patient = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedPassword,
        name: p.name,
        role: UserRole.PATIENT,
        status: UserStatus.VERIFIED,
        emailVerified: true,
        patientProfile: { create: p.profile },
      },
    });
    patients[p.email] = patient.id;
  }

  console.log(`✅ ${patientsData.length} patients created`);

  // ─────────────────────────────────────────
  // APPOINTMENTS
  // ─────────────────────────────────────────
  // Helper to build a date relative to today
  const daysFromNow = (days: number, hour = 9, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const doctorList = Object.values(doctors);
  const patientList = Object.values(patients);

  // Doctor shortcuts by specialty order (same as doctorsData array)
  const [
    docCardio,    // ana.oliveira
    docClinico,   // carlos.santos
    docDerma,     // mariana.costa
    docOrtho,     // roberto.lima
    docPedi,      // fernanda.alves
    docPsiq,      // paulo.mendes
    docGineco,    // lucia.ferreira
    docNeuro,     // thiago.rocha
  ] = doctorList;

  // Patient shortcuts
  const [
    patJoao, patMaria, patPedro, patAna, patLucas,
    patJulia, patRafael, patCamila, patMarcos, patBeatriz,
    patGabriel, patLarissa, patDiego, patIsabela, patThiago,
  ] = patientList;

  type AppointmentInput = {
    professionalId: string;
    patientId: string;
    dateTime: Date;
    status: AppointmentStatus;
    modality: AppointmentModality;
    notes?: string;
  };

  const appointments: AppointmentInput[] = [
    // ── COMPLETED (past appointments) ──────────────────────────────
    {
      professionalId: docCardio,
      patientId: patJoao,
      dateTime: daysFromNow(-60, 9, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Consulta de rotina. Paciente hipertenso controlado. Solicitar ECG e exames laboratoriais.',
    },
    {
      professionalId: docCardio,
      patientId: patMaria,
      dateTime: daysFromNow(-45, 10, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Retorno pós-cateterismo. Evolução satisfatória. Manter medicação atual.',
    },
    {
      professionalId: docClinico,
      patientId: patPedro,
      dateTime: daysFromNow(-30, 14, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Consulta virtual. Queixa de gripe. Prescrito antiviral e repouso por 5 dias.',
    },
    {
      professionalId: docClinico,
      patientId: patAna,
      dateTime: daysFromNow(-20, 15, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Renovação de receita para anti-hipertensivo. Pressão bem controlada.',
    },
    {
      professionalId: docDerma,
      patientId: patLucas,
      dateTime: daysFromNow(-15, 9, 30),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Tratamento de acne moderada. Prescrito isotretinoína 20mg. Retorno em 30 dias.',
    },
    {
      professionalId: docDerma,
      patientId: patJulia,
      dateTime: daysFromNow(-10, 11, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Avaliação de mancha suspeita. Biópsia realizada. Aguardando resultado.',
    },
    {
      professionalId: docOrtho,
      patientId: patRafael,
      dateTime: daysFromNow(-25, 8, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Paciente com lombalgia crônica. Indicado fisioterapia 2x/semana por 6 semanas.',
    },
    {
      professionalId: docOrtho,
      patientId: patMarcos,
      dateTime: daysFromNow(-8, 9, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Pós-operatório de hérnia de disco L4-L5. Cicatrização boa. Iniciar reabilitação.',
    },
    {
      professionalId: docPedi,
      patientId: patCamila,
      dateTime: daysFromNow(-35, 10, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Consulta sobre amamentação. Orientações sobre pega correta e frequência.',
    },
    {
      professionalId: docPsiq,
      patientId: patBeatriz,
      dateTime: daysFromNow(-50, 16, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Sessão de acompanhamento. Paciente relatou melhora do humor. Manter escitalopram 20mg.',
    },
    {
      professionalId: docPsiq,
      patientId: patGabriel,
      dateTime: daysFromNow(-40, 17, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Avaliação inicial. Diagnóstico de transtorno de ansiedade generalizada. Iniciar sertralina 50mg.',
    },
    {
      professionalId: docGineco,
      patientId: patLarissa,
      dateTime: daysFromNow(-55, 9, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Consulta pré-natal 20 semanas. Morfológico normal. Tudo bem.',
    },
    {
      professionalId: docGineco,
      patientId: patIsabela,
      dateTime: daysFromNow(-18, 10, 30),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Consulta de rotina. Preventivo coletado. Orientações sobre anticoncepção.',
    },
    {
      professionalId: docNeuro,
      patientId: patDiego,
      dateTime: daysFromNow(-70, 14, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Investigação de cefaleia crônica. Solicitado ressonância magnética.',
    },
    {
      professionalId: docNeuro,
      patientId: patThiago,
      dateTime: daysFromNow(-12, 15, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Retorno com resultado de ressonância. Enxaqueca sem lesão estrutural. Prescrito topiramato profilático.',
    },
    // Additional completed
    {
      professionalId: docClinico,
      patientId: patJoao,
      dateTime: daysFromNow(-90, 8, 0),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Check-up anual. Exames laboratoriais dentro da normalidade.',
    },
    {
      professionalId: docCardio,
      patientId: patPedro,
      dateTime: daysFromNow(-5, 9, 30),
      status: AppointmentStatus.COMPLETED,
      modality: AppointmentModality.CLINIC,
      notes: 'Avaliação de arritmia. Holter de 24h solicitado.',
    },

    // ── CANCELLED ──────────────────────────────────────────────────
    {
      professionalId: docCardio,
      patientId: patLucas,
      dateTime: daysFromNow(-14, 9, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.CLINIC,
      notes: 'Paciente cancelou por motivos pessoais.',
    },
    {
      professionalId: docClinico,
      patientId: patRafael,
      dateTime: daysFromNow(-7, 14, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Cancelado pelo médico — compromisso de emergência.',
    },
    {
      professionalId: docDerma,
      patientId: patMarcos,
      dateTime: daysFromNow(-3, 11, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.CLINIC,
      notes: 'Paciente não conseguiu transporte.',
    },
    {
      professionalId: docOrtho,
      patientId: patCamila,
      dateTime: daysFromNow(-21, 8, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Reagendamento solicitado pelo paciente.',
    },
    {
      professionalId: docPsiq,
      patientId: patAna,
      dateTime: daysFromNow(-28, 17, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Paciente sem acesso à internet no dia agendado.',
    },
    {
      professionalId: docGineco,
      patientId: patMaria,
      dateTime: daysFromNow(-42, 10, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.CLINIC,
      notes: 'Cancelado — paciente deu à luz antes da consulta.',
    },
    {
      professionalId: docNeuro,
      patientId: patBeatriz,
      dateTime: daysFromNow(-6, 15, 0),
      status: AppointmentStatus.CANCELLED,
      modality: AppointmentModality.CLINIC,
      notes: 'Médico adoeceu. Consulta remarcada.',
    },

    // ── NO-SHOW ────────────────────────────────────────────────────
    {
      professionalId: docCardio,
      patientId: patGabriel,
      dateTime: daysFromNow(-9, 8, 0),
      status: AppointmentStatus.NO_SHOW,
      modality: AppointmentModality.CLINIC,
      notes: 'Paciente não compareceu e não avisou.',
    },
    {
      professionalId: docClinico,
      patientId: patLarissa,
      dateTime: daysFromNow(-11, 14, 0),
      status: AppointmentStatus.NO_SHOW,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Paciente não entrou na videochamada.',
    },
    {
      professionalId: docDerma,
      patientId: patDiego,
      dateTime: daysFromNow(-16, 10, 0),
      status: AppointmentStatus.NO_SHOW,
      modality: AppointmentModality.CLINIC,
      notes: 'Faltou sem justificativa.',
    },
    {
      professionalId: docOrtho,
      patientId: patIsabela,
      dateTime: daysFromNow(-22, 9, 0),
      status: AppointmentStatus.NO_SHOW,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Endereço não localizado. Paciente não atendeu ligações.',
    },

    // ── PENDING (upcoming, not yet confirmed) ─────────────────────
    {
      professionalId: docCardio,
      patientId: patThiago,
      dateTime: daysFromNow(3, 9, 0),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.CLINIC,
      notes: 'Primeira consulta — queixa de palpitações.',
    },
    {
      professionalId: docClinico,
      patientId: patJoao,
      dateTime: daysFromNow(5, 10, 0),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Dor de cabeça persistente há 1 semana.',
    },
    {
      professionalId: docDerma,
      patientId: patMaria,
      dateTime: daysFromNow(7, 9, 30),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.CLINIC,
      notes: 'Mancha nova no braço. Quer avaliação dermatológica.',
    },
    {
      professionalId: docPsiq,
      patientId: patPedro,
      dateTime: daysFromNow(4, 16, 0),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Relato de insônia e ansiedade elevada.',
    },
    {
      professionalId: docGineco,
      patientId: patJulia,
      dateTime: daysFromNow(10, 10, 0),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.CLINIC,
      notes: 'Consulta pré-natal de rotina — 12 semanas.',
    },
    {
      professionalId: docNeuro,
      patientId: patCamila,
      dateTime: daysFromNow(6, 14, 0),
      status: AppointmentStatus.PENDING,
      modality: AppointmentModality.CLINIC,
      notes: 'Crise convulsiva episódica. Encaminhada pelo clínico.',
    },

    // ── CONFIRMED (upcoming, confirmed) ───────────────────────────
    {
      professionalId: docCardio,
      patientId: patJoao,
      dateTime: daysFromNow(14, 9, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Retorno pós-exames. Trazer resultados de ECG e labs.',
    },
    {
      professionalId: docCardio,
      patientId: patBeatriz,
      dateTime: daysFromNow(21, 10, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Avaliação de risco cardiovascular.',
    },
    {
      professionalId: docClinico,
      patientId: patAna,
      dateTime: daysFromNow(2, 14, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Retorno para avaliação do tratamento.',
    },
    {
      professionalId: docClinico,
      patientId: patLucas,
      dateTime: daysFromNow(9, 15, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.VIRTUAL,
    },
    {
      professionalId: docDerma,
      patientId: patRafael,
      dateTime: daysFromNow(12, 9, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Resultado de biópsia + novo tratamento.',
    },
    {
      professionalId: docOrtho,
      patientId: patMarcos,
      dateTime: daysFromNow(15, 8, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Avaliação pós-fisioterapia.',
    },
    {
      professionalId: docPedi,
      patientId: patGabriel,
      dateTime: daysFromNow(8, 10, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Criança com febre recorrente. Pais solicitem exames antes.',
    },
    {
      professionalId: docPsiq,
      patientId: patBeatriz,
      dateTime: daysFromNow(20, 17, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.VIRTUAL,
      notes: 'Sessão mensal de acompanhamento.',
    },
    {
      professionalId: docGineco,
      patientId: patLarissa,
      dateTime: daysFromNow(25, 9, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Consulta pré-natal 32 semanas.',
    },
    {
      professionalId: docNeuro,
      patientId: patDiego,
      dateTime: daysFromNow(18, 14, 30),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Retorno com exames de imagem. Avaliação de enxaqueca crônica.',
    },
    {
      professionalId: docNeuro,
      patientId: patThiago,
      dateTime: daysFromNow(30, 15, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Avaliação de resposta ao topiramato.',
    },
    // Far future confirmed
    {
      professionalId: docCardio,
      patientId: patDiego,
      dateTime: daysFromNow(45, 9, 0),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.CLINIC,
      notes: 'Avaliação cardiológica pré-operatória.',
    },
    {
      professionalId: docOrtho,
      patientId: patIsabela,
      dateTime: daysFromNow(60, 8, 30),
      status: AppointmentStatus.CONFIRMED,
      modality: AppointmentModality.HOME_VISIT,
      notes: 'Consulta domiciliar pós-cirurgia de joelho.',
    },
  ];

  let appointmentCount = 0;
  for (const appt of appointments) {
    await prisma.appointment.create({ data: appt });
    appointmentCount++;
  }

  console.log(`✅ ${appointmentCount} appointments created`);

  // ─────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────
  const byStatus = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('\n📊 Appointments by status:');
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`   ${status}: ${count}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n🔑 All users login with password: password');
  console.log('   admin@lifemed.com          → Admin');
  console.log('   ana.oliveira@lifemed.com   → Cardiologista');
  console.log('   carlos.santos@lifemed.com  → Clínico Geral');
  console.log('   mariana.costa@lifemed.com  → Dermatologista');
  console.log('   roberto.lima@lifemed.com   → Ortopedista');
  console.log('   fernanda.alves@lifemed.com → Pediatra');
  console.log('   paulo.mendes@lifemed.com   → Psiquiatra');
  console.log('   lucia.ferreira@lifemed.com → Ginecologista');
  console.log('   thiago.rocha@lifemed.com   → Neurologista');
  console.log('   joao.silva@email.com       → Paciente');
  console.log('   ... (15 patients total)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

const getRelativeDate = (daysDifference: number, hour = 14) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysDifference);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...');

  const defaultPasswordText = 'Senha123!';
  const hashedDefaultPassword = bcryptjs.hashSync(defaultPasswordText, 10);

  // Senha exigida para os 4 usuários fixos que devem sobreviver a qualquer
  // reset de produção (login garantido para demonstração/QA).
  const corePasswordText = 'SenhaSegura123!';
  const hashedCorePassword = bcryptjs.hashSync(corePasswordText, 10);

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
    'Endocrinologia',
    'Oftalmologia',
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
  // 2. USUÁRIOS FIXOS OBRIGATÓRIOS
  // Estes 4 usuários devem sempre existir, mesmo que o banco de produção
  // seja recriado do zero. Senha: SenhaSegura123!
  // ─────────────────────────────────────────
  console.log('⏳ Criando usuários fixos obrigatórios (admin, paciente, profissional, gestor)...');

  await prisma.user.upsert({
    where: { email: 'admin@lifemed.com' },
    update: { password: hashedCorePassword },
    create: {
      email: 'admin@lifemed.com',
      cpf: null,
      password: hashedCorePassword,
      name: 'Administrador do Sistema',
      role: UserRole.ADMIN,
      status: UserStatus.VERIFIED,
      emailVerified: true,
    },
  });

  const coreManager = await prisma.user.upsert({
    where: { email: 'gestor@lifemed.com' },
    update: { password: hashedCorePassword },
    create: {
      email: 'gestor@lifemed.com',
      cpf: '00000000001',
      password: hashedCorePassword,
      name: 'Gestor Padrão do Sistema',
      role: UserRole.MANAGER,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      managerProfile: {
        create: {
          phone: '(11) 90000-0001',
          bio: 'Gestor padrão do sistema, usado para testes e demonstrações.',
        },
      },
    },
    include: { managerProfile: true },
  });

  const coreProfessional = await prisma.user.upsert({
    where: { email: 'profissional@lifemed.com' },
    update: { password: hashedCorePassword },
    create: {
      email: 'profissional@lifemed.com',
      cpf: '00000000002',
      password: hashedCorePassword,
      name: 'Dr. Profissional Padrão',
      role: UserRole.PROFESSIONAL,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      professionalProfile: {
        create: {
          professionalLicense: 'CRM-BA 00000',
          specialities: { connect: [{ id: specialitiesData[0].id }, { id: specialitiesData[7].id }] },
          modality: AppointmentModality.VIRTUAL,
          bio: 'Usuário profissional padrão do sistema, usado para testes e demonstrações.',
          price: 200.0,
          payments: { pix: true, cartao: true },
        },
      },
    },
    include: { professionalProfile: true },
  });

  const coreProfessionalAddress = {
    zipCode: '40020-000',
    street: 'Avenida Sete de Setembro',
    number: '1500',
    district: 'Centro',
    city: 'Salvador',
    state: 'BA',
  };
  await prisma.address.upsert({
    where: { userId: coreProfessional.id },
    update: { ...coreProfessionalAddress },
    create: { userId: coreProfessional.id, ...coreProfessionalAddress },
  });

  const coreProfessionalAvailDays = [1, 2, 3, 4, 5];
  for (let d = 0; d < coreProfessionalAvailDays.length; d++) {
    const availId = generateUUID('20000000', d);
    await prisma.availability.upsert({
      where: { id: availId },
      update: {},
      create: {
        id: availId,
        professionalId: coreProfessional.id,
        dayOfWeek: coreProfessionalAvailDays[d],
        startTime: '09:00',
        endTime: '18:00',
        validFrom: new Date('2025-01-01'),
      },
    });
  }

  const corePatient = await prisma.user.upsert({
    where: { email: 'paciente@lifemed.com' },
    update: { password: hashedCorePassword },
    create: {
      email: 'paciente@lifemed.com',
      cpf: '00000000003',
      password: hashedCorePassword,
      name: 'Paciente Padrão do Sistema',
      role: UserRole.PATIENT,
      status: UserStatus.VERIFIED,
      emailVerified: true,
      patientProfile: {
        create: {
          phone: '(11) 90000-0003',
          dateOfBirth: new Date('1988-03-20'),
          gender: 'Feminino',
          approvalStatus: PatientApprovalStatus.APPROVED,
        },
      },
    },
    include: { patientProfile: true },
  });

  const corePatientAddress = {
    zipCode: '41830-001',
    street: 'Avenida Paulo VI',
    number: '3400',
    district: 'Pituba',
    city: 'Salvador',
    state: 'BA',
  };
  await prisma.address.upsert({
    where: { userId: corePatient.id },
    update: { ...corePatientAddress },
    create: { userId: corePatient.id, ...corePatientAddress },
  });

  console.log('  Usuários fixos criados/atualizados (senha: SenhaSegura123!).');

  // ─────────────────────────────────────────
  // 3. PROFISSIONAIS DE EXEMPLO (com localização real)
  // ─────────────────────────────────────────
  console.log('⏳ Criando Profissionais, Endereços e Disponibilidades...');
  const professionalsInput = [
    {
      email: 'roberto.souza@lifemed.com', cpf: '11111111101', name: 'Dr. Roberto Souza', crm: 'CRM-BA 10001', specs: [0, 7],
      address: { zipCode: '40020-000', street: 'Avenida Sete de Setembro', number: '1000', district: 'Centro', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'ana.costa@lifemed.com', cpf: '11111111102', name: 'Dra. Ana Costa', crm: 'CRM-BA 10002', specs: [1],
      address: { zipCode: '41830-001', street: 'Avenida Paulo VI', number: '2000', district: 'Pituba', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'carlos.lima@lifemed.com', cpf: '11111111103', name: 'Dr. Carlos Lima', crm: 'CRM-BA 10003', specs: [2, 7],
      address: { zipCode: '40140-110', street: 'Avenida Tancredo Neves', number: '156', district: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'fernanda.alves@lifemed.com', cpf: '11111111104', name: 'Dra. Fernanda Alves', crm: 'CRM-BA 10004', specs: [3],
      address: { zipCode: '41940-450', street: 'Avenida Otávio Mangabeira', number: '1702', district: 'Boca do Rio', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'joao.mendes@lifemed.com', cpf: '11111111105', name: 'Dr. João Mendes', crm: 'CRM-BA 10005', specs: [4],
      address: { zipCode: '40170-110', street: 'Avenida Sete de Setembro', number: '200', district: 'Vitória', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'camila.rocha@lifemed.com', cpf: '11111111106', name: 'Dra. Camila Rocha', crm: 'CRM-BA 10006', specs: [5],
      address: { zipCode: '40020-000', street: 'Avenida Sete de Setembro', number: '450', district: 'Centro', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paulo.silva@lifemed.com', cpf: '11111111107', name: 'Dr. Paulo Silva', crm: 'CRM-BA 10007', specs: [6],
      address: { zipCode: '41810-000', street: 'Avenida Antônio Carlos Magalhães', number: '100', district: 'Itaigara', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'mariana.santos@lifemed.com', cpf: '11111111108', name: 'Dra. Mariana Santos', crm: 'CRM-BA 10008', specs: [7],
      address: { zipCode: '40140-110', street: 'Avenida Tancredo Neves', number: '620', district: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'tiago.freitas@lifemed.com', cpf: '11111111109', name: 'Dr. Tiago Freitas', crm: 'CRM-BA 10009', specs: [0],
      address: { zipCode: '40155-190', street: 'Rua Territórios', number: '500', district: 'Rio Vermelho', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'beatriz.nogueira@lifemed.com', cpf: '11111111110', name: 'Dra. Beatriz Nogueira', crm: 'CRM-BA 10010', specs: [1, 2],
      address: { zipCode: '41720-020', street: 'Avenida Luís Viana Filho', number: '10', district: 'Patamares', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'gustavo.pereira@lifemed.com', cpf: '11111111111', name: 'Dr. Gustavo Pereira', crm: 'CRM-BA 10011', specs: [8],
      address: { zipCode: '40296-720', street: 'Rua Fonte do Boi', number: '1001', district: 'Barra', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'patricia.gomes@lifemed.com', cpf: '11111111112', name: 'Dra. Patrícia Gomes', crm: 'CRM-BA 10012', specs: [9],
      address: { zipCode: '40155-060', street: 'Rua Marquês de Caravelas', number: '300', district: 'Barra', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'renata.barbosa@lifemed.com', cpf: '11111111113', name: 'Dra. Renata Barbosa', crm: 'CRM-BA 10013', specs: [0],
      address: { zipCode: '41830-330', street: 'Avenida Manoel Dias da Silva', number: '250', district: 'Pituba', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'marcelo.tavares@lifemed.com', cpf: '11111111114', name: 'Dr. Marcelo Tavares', crm: 'CRM-BA 10014', specs: [3, 8],
      address: { zipCode: '40243-900', street: 'Avenida Garibaldi', number: '620', district: 'Ondina', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'larissa.moura@lifemed.com', cpf: '11111111115', name: 'Dra. Larissa Moura', crm: 'CRM-BA 10015', specs: [5, 9],
      address: { zipCode: '40015-130', street: 'Rua Chile', number: '1500', district: 'Comércio', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'bruno.cavalcante@lifemed.com', cpf: '11111111116', name: 'Dr. Bruno Cavalcante', crm: 'CRM-BA 10016', specs: [4, 6],
      address: { zipCode: '41940-455', street: 'Avenida Octávio Mangabeira', number: '850', district: 'Armação', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'isabela.martins@lifemed.com', cpf: '11111111117', name: 'Dra. Isabela Martins', crm: 'CRM-BA 10017', specs: [1, 5],
      address: { zipCode: '40225-270', street: 'Rua Waldemar Falcão', number: '400', district: 'Brotas', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'felipe.rodrigues@lifemed.com', cpf: '11111111118', name: 'Dr. Felipe Rodrigues', crm: 'CRM-BA 10018', specs: [7, 9],
      address: { zipCode: '41600-010', street: 'Avenida São Rafael', number: '235', district: 'São Rafael', city: 'Salvador', state: 'BA' },
    },
  ];

  const professionals: any[] = [];
  let availabilityIndex = 100;

  for (const p of professionalsInput) {
    const specialtiesToConnect = p.specs.map((index) => ({ id: specialitiesData[index].id }));

    const profUser = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        password: hashedDefaultPassword,
        professionalProfile: {
          update: {
            specialities: { set: specialtiesToConnect },
          },
        },
      },
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedDefaultPassword,
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

    await prisma.address.upsert({
      where: { userId: profUser.id },
      update: { ...p.address },
      create: { userId: profUser.id, ...p.address },
    });

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
  console.log(`  ${professionals.length} Profissionais, Endereços e Disponibilidades criados.`);

  // ─────────────────────────────────────────
  // 4. PACIENTES
  // Variações de approvalStatus para cobrir todos os estados do fluxo.
  // ─────────────────────────────────────────
  console.log('⏳ Criando Pacientes...');
  const patientsInput = [
    {
      email: 'paciente.marcos@gmail.com', cpf: '22222222201', name: 'Marcos de Almeida', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40020-000', street: 'Avenida Sete de Setembro', number: '1000', district: 'Centro', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.luiza@gmail.com', cpf: '22222222202', name: 'Luiza Pereira', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '41830-001', street: 'Avenida Paulo VI', number: '156', district: 'Pituba', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.fernando@gmail.com', cpf: '22222222203', name: 'Fernando Gomes', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40140-110', street: 'Avenida Tancredo Neves', number: '200', district: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.amanda@gmail.com', cpf: '22222222204', name: 'Amanda Ribeiro', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40020-000', street: 'Avenida Sete de Setembro', number: '450', district: 'Centro', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.diego@gmail.com', cpf: '22222222205', name: 'Diego Batista', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '41940-450', street: 'Avenida Otávio Mangabeira', number: '100', district: 'Boca do Rio', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.juliana@gmail.com', cpf: '22222222206', name: 'Juliana Vieira', gender: 'Feminino', approval: PatientApprovalStatus.PENDING,
      address: { zipCode: '40170-110', street: 'Avenida Sete de Setembro', number: '10', district: 'Vitória', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.rafael@gmail.com', cpf: '22222222207', name: 'Rafael Barros', gender: 'Masculino', approval: PatientApprovalStatus.PENDING,
      address: { zipCode: '41810-000', street: 'Avenida Antônio Carlos Magalhães', number: '1001', district: 'Itaigara', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.claudia@gmail.com', cpf: '22222222208', name: 'Cláudia Castro', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40155-190', street: 'Rua Territórios', number: '300', district: 'Rio Vermelho', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.ricardo@gmail.com', cpf: '22222222209', name: 'Ricardo Dias', gender: 'Masculino', approval: PatientApprovalStatus.REJECTED,
      address: { zipCode: '41720-020', street: 'Avenida Luís Viana Filho', number: '2000', district: 'Patamares', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.vanessa@gmail.com', cpf: '22222222210', name: 'Vanessa Moraes', gender: 'Feminino', approval: PatientApprovalStatus.PENDING,
      address: { zipCode: '40296-720', street: 'Rua Fonte do Boi', number: '1702', district: 'Barra', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.eduardo@gmail.com', cpf: '22222222211', name: 'Eduardo Nascimento', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '41830-330', street: 'Avenida Manoel Dias da Silva', number: '500', district: 'Pituba', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.sabrina@gmail.com', cpf: '22222222212', name: 'Sabrina Cardoso', gender: 'Feminino', approval: PatientApprovalStatus.REJECTED,
      address: { zipCode: '40140-110', street: 'Avenida Tancredo Neves', number: '620', district: 'Caminho das Árvores', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.helena@gmail.com', cpf: '22222222213', name: 'Helena Farias', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40243-900', street: 'Avenida Garibaldi', number: '250', district: 'Ondina', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.igor@gmail.com', cpf: '22222222214', name: 'Igor Correia', gender: 'Masculino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '40015-130', street: 'Rua Chile', number: '620', district: 'Comércio', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.natalia@gmail.com', cpf: '22222222215', name: 'Natália Duarte', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '41940-455', street: 'Avenida Octávio Mangabeira', number: '1500', district: 'Armação', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.vitor@gmail.com', cpf: '22222222216', name: 'Vitor Azevedo', gender: 'Masculino', approval: PatientApprovalStatus.PENDING,
      address: { zipCode: '40225-270', street: 'Rua Waldemar Falcão', number: '850', district: 'Brotas', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.camille@gmail.com', cpf: '22222222217', name: 'Camille Teixeira', gender: 'Feminino', approval: PatientApprovalStatus.APPROVED,
      address: { zipCode: '41600-010', street: 'Avenida São Rafael', number: '400', district: 'São Rafael', city: 'Salvador', state: 'BA' },
    },
    {
      email: 'paciente.henrique@gmail.com', cpf: '22222222218', name: 'Henrique Lopes', gender: 'Masculino', approval: PatientApprovalStatus.REJECTED,
      address: { zipCode: '41500-070', street: 'Avenida Dorival Caymmi', number: '235', district: 'Itapuã', city: 'Salvador', state: 'BA' },
    },
  ];

  const patients: any[] = [];
  for (const p of patientsInput) {
    const patientUser = await prisma.user.upsert({
      where: { email: p.email },
      update: { password: hashedDefaultPassword },
      create: {
        email: p.email,
        cpf: p.cpf,
        password: hashedDefaultPassword,
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

    await prisma.address.upsert({
      where: { userId: patientUser.id },
      update: { ...p.address },
      create: { userId: patientUser.id, ...p.address },
    });
  }
  console.log(`  ${patients.length} Pacientes e Endereços criados.`);

  // ─────────────────────────────────────────
  // 5. CONSULTAS — histórico passado e agenda futura
  // ─────────────────────────────────────────
  console.log('⏳ Criando Consultas (Appointments) passadas e futuras...');

  const appointmentsInput = [
    // ── Passadas concluídas / canceladas / faltas ──
    { pIdx: 0, dIdx: 0, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -10 },
    { pIdx: 1, dIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -5 },
    { pIdx: 2, dIdx: 2, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -2 },
    { pIdx: 3, dIdx: 3, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -1 },
    { pIdx: 4, dIdx: 4, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -4 },
    { pIdx: 9, dIdx: 9, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -12 },
    { pIdx: 2, dIdx: 3, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -20 },
    { pIdx: 3, dIdx: 2, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.HOME_VISIT, daysDiff: -15 },
    { pIdx: 4, dIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -30 },
    { pIdx: 6, dIdx: 9, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -8 },
    { pIdx: 10, dIdx: 10, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -45 },
    { pIdx: 11, dIdx: 11, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -60 },
    { pIdx: 12, dIdx: 12, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -18 },
    { pIdx: 13, dIdx: 13, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -22 },
    { pIdx: 15, dIdx: 15, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -33 },
    { pIdx: 17, dIdx: 17, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -9 },
    { pIdx: 12, dIdx: 14, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -75 },
    { pIdx: 13, dIdx: 16, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.VIRTUAL, daysDiff: -50 },
    { pIdx: 0, dIdx: 12, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -90 },
    { pIdx: 1, dIdx: 13, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -100 },
    { pIdx: 3, dIdx: 15, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -120 },
    { pIdx: 7, dIdx: 16, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -150 },

    // ── Futuras pendentes / confirmadas (agenda real) ──
    { pIdx: 5, dIdx: 5, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 2 },
    { pIdx: 6, dIdx: 6, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 5 },
    { pIdx: 7, dIdx: 7, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.HOME_VISIT, daysDiff: 7 },
    { pIdx: 8, dIdx: 8, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 10 },
    { pIdx: 0, dIdx: 5, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 6 },
    { pIdx: 1, dIdx: 4, status: AppointmentStatus.PENDING, modality: AppointmentModality.CLINIC, daysDiff: 8 },
    { pIdx: 5, dIdx: 0, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 12 },
    { pIdx: 7, dIdx: 8, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 14 },
    { pIdx: 10, dIdx: 2, status: AppointmentStatus.PENDING, modality: AppointmentModality.CLINIC, daysDiff: 3 },
    { pIdx: 11, dIdx: 6, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 20 },
    { pIdx: 12, dIdx: 7, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 16 },
    { pIdx: 13, dIdx: 9, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 18 },
    { pIdx: 14, dIdx: 14, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 22 },
    { pIdx: 16, dIdx: 17, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.HOME_VISIT, daysDiff: 25 },
    { pIdx: 17, dIdx: 3, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 30 },
    { pIdx: 4, dIdx: 15, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 35 },
    { pIdx: 8, dIdx: 16, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 40 },
    { pIdx: 15, dIdx: 8, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 45 },
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
  console.log(`  ${appointmentsCreated} Consultas criadas (passadas e futuras).`);

  // ─────────────────────────────────────────
  // 5.1. AGENDA DO PROFISSIONAL PADRÃO (profissional@lifemed.com)
  // ─────────────────────────────────────────
  console.log('⏳ Criando agenda do profissional padrão...');

  const coreProfessionalAppointments = [
    { pIdx: 0, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -14 },
    { pIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -7 },
    { pIdx: 2, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -3 },
    { pIdx: 3, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 1 },
    { pIdx: 4, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 4 },
    { pIdx: 0, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 9 },
    { pIdx: 5, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -21 },
    { pIdx: 6, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -35 },
    { pIdx: 7, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -18 },
    { pIdx: 8, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -28 },
    { pIdx: 9, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -50 },
    { pIdx: 1, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 2 },
    { pIdx: 3, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 6 },
    { pIdx: 10, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 13 },
    { pIdx: 11, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 17 },
  ];

  for (let i = 0; i < coreProfessionalAppointments.length; i++) {
    const { pIdx, status, modality, daysDiff } = coreProfessionalAppointments[i];
    const appointmentId = generateUUID('66666666', i);
    await prisma.appointment.upsert({
      where: { id: appointmentId },
      update: { status, modality, dateTime: getRelativeDate(daysDiff) },
      create: {
        id: appointmentId,
        patientId: patients[pIdx].id,
        professionalId: coreProfessional.id,
        status,
        modality,
        dateTime: getRelativeDate(daysDiff),
        notes: status === AppointmentStatus.COMPLETED ? 'Consulta realizada com o profissional padrão.' : null,
      },
    });
  }
  console.log(`  ${coreProfessionalAppointments.length} Consultas do profissional padrão criadas.`);

  // ─────────────────────────────────────────
  // 5.2. PACIENTE PADRÃO — histórico com MÚLTIPLOS MÉDICOS
  // Cobre o cenário de relatório: um paciente atendido por 3+ profissionais
  // diferentes, em diferentes especialidades, status e datas (passado/futuro).
  // ─────────────────────────────────────────
  console.log('⏳ Criando histórico multi-médico do paciente padrão...');

  const corePatientAppointments = [
    { profIdx: 0, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -40 }, // Cardiologia
    { profIdx: 1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -25 }, // Pediatria
    { profIdx: 2, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -15 }, // Dermatologia
    { profIdx: 3, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -10 }, // Ortopedia
    { profIdx: 4, status: AppointmentStatus.NO_SHOW, modality: AppointmentModality.CLINIC, daysDiff: -6 }, // Psiquiatria
    { profIdx: -1, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -3 }, // Profissional padrão
    { profIdx: 5, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 4 }, // Ginecologia
    { profIdx: 6, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 11 }, // Neurologia
    { profIdx: 7, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -55 }, // Clínica Médica
    { profIdx: 8, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.VIRTUAL, daysDiff: -70 }, // Cardiologia (2º cardiologista)
    { profIdx: 9, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.HOME_VISIT, daysDiff: -85 }, // Endocrinologia
    { profIdx: -1, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -60 }, // Profissional padrão (2ª consulta, cancelada)
    { profIdx: 10, status: AppointmentStatus.PENDING, modality: AppointmentModality.VIRTUAL, daysDiff: 18 }, // Oftalmologia
    { profIdx: 11, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.CLINIC, daysDiff: 25 }, // Cardiologia (Renata)
  ];

  let corePatientApptsCreated = 0;
  for (let i = 0; i < corePatientAppointments.length; i++) {
    const { profIdx, status, modality, daysDiff } = corePatientAppointments[i];
    const professionalId = profIdx === -1 ? coreProfessional.id : professionals[profIdx].id;
    const appointmentId = generateUUID('77777777', i);

    await prisma.appointment.upsert({
      where: { id: appointmentId },
      update: { status, modality, dateTime: getRelativeDate(daysDiff) },
      create: {
        id: appointmentId,
        patientId: corePatient.id,
        professionalId,
        status,
        modality,
        dateTime: getRelativeDate(daysDiff),
        notes:
          status === AppointmentStatus.COMPLETED
            ? 'Consulta concluída — parte do histórico multi-especialidade do paciente padrão.'
            : null,
      },
    });
    corePatientApptsCreated++;
  }
  console.log(`  ${corePatientApptsCreated} consultas do paciente padrão com múltiplos médicos criadas.`);

  // ─────────────────────────────────────────
  // 6. CENÁRIO DE TESTE — PRONTUÁRIOS
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

  // ── Prontuários adicionais de pacientes de exemplo (histórico avulso) ──
  const extraRecordScenarios = [
    {
      patient: patients[3], // Amanda
      doctor: professionals[4],
      daysDiff: -30,
      modality: AppointmentModality.CLINIC,
      record: {
        chiefComplaint: 'Episódios de ansiedade e insônia há 2 meses.',
        diagnosis: 'Transtorno de ansiedade generalizada.',
        treatmentPlan: 'Terapia cognitivo-comportamental semanal e reavaliação medicamentosa em 30 dias.',
        prescriptions: 'Escitalopram 10mg — 1 comprimido ao dia.',
        internalNotes: 'Paciente relatou melhora parcial dos sintomas na última semana.',
      },
    },
    {
      patient: patients[9],
      doctor: professionals[9],
      daysDiff: -45,
      modality: AppointmentModality.VIRTUAL,
      record: {
        chiefComplaint: 'Check-up cardiológico de rotina.',
        diagnosis: 'Sem alterações significativas no ECG.',
        treatmentPlan: 'Manter hábitos saudáveis, retorno anual.',
        prescriptions: null,
        internalNotes: 'Paciente assintomático, histórico familiar de hipertensão.',
      },
    },
    {
      patient: patients[12],
      doctor: professionals[12],
      daysDiff: -18,
      modality: AppointmentModality.VIRTUAL,
      record: {
        chiefComplaint: 'Dor lombar recorrente relacionada ao trabalho.',
        diagnosis: 'Lombalgia mecânica.',
        treatmentPlan: 'Fisioterapia 2x por semana e anti-inflamatório por 5 dias.',
        prescriptions: 'Nimesulida 100mg — 1 comprimido a cada 12h por 5 dias.',
        internalNotes: 'Orientado sobre ergonomia no ambiente de trabalho.',
      },
    },
    {
      patient: patients[13],
      doctor: professionals[13],
      daysDiff: -22,
      modality: AppointmentModality.CLINIC,
      record: {
        chiefComplaint: 'Consulta oftalmológica de rotina.',
        diagnosis: 'Miopia leve, sem progressão.',
        treatmentPlan: 'Atualização do grau dos óculos, retorno em 12 meses.',
        prescriptions: null,
        internalNotes: 'Fundo de olho sem alterações.',
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

  for (let i = 0; i < extraRecordScenarios.length; i++) {
    const { patient, doctor, daysDiff, modality, record } = extraRecordScenarios[i];
    const apptId = generateUUID('33333333', 10 + i);
    const recordId = generateUUID('44444444', 20 + i);

    await prisma.appointment.upsert({
      where: { id: apptId },
      update: { status: AppointmentStatus.COMPLETED, modality, dateTime: getRelativeDate(daysDiff) },
      create: {
        id: apptId,
        patientId: patient.id,
        professionalId: doctor.id,
        status: AppointmentStatus.COMPLETED,
        modality,
        dateTime: getRelativeDate(daysDiff),
        notes: 'Consulta com prontuário registrado.',
      },
    });

    await prisma.medicalRecord.upsert({
      where: { id: recordId },
      update: { ...record },
      create: {
        id: recordId,
        appointmentId: apptId,
        patientId: patient.id,
        authorId: doctor.id,
        ...record,
      },
    });
    recordsCreated++;
  }

  // ── Prontuários do paciente padrão (multi-médico) ──
  const corePatientRecordScenarios = [
    {
      apptId: generateUUID('77777777', 0),
      doctor: professionals[0],
      record: {
        chiefComplaint: 'Avaliação cardiológica de rotina.',
        diagnosis: 'Hipertensão arterial controlada.',
        treatmentPlan: 'Manter medicação e reavaliar em 6 meses.',
        prescriptions: 'Losartana 50mg — 1 comprimido ao dia.',
        internalNotes: 'Paciente colaborativo, sem intercorrências.',
      },
    },
    {
      apptId: generateUUID('77777777', 1),
      doctor: professionals[1],
      record: {
        chiefComplaint: 'Consulta pediátrica de acompanhamento familiar.',
        diagnosis: 'Sem alterações relevantes.',
        treatmentPlan: 'Orientações gerais de saúde preventiva.',
        prescriptions: null,
        internalNotes: 'Consulta de rotina, sem achados.',
      },
    },
    {
      apptId: generateUUID('77777777', 2),
      doctor: professionals[2],
      record: {
        chiefComplaint: 'Lesão de pele em região dorsal.',
        diagnosis: 'Dermatite de contato.',
        treatmentPlan: 'Corticoide tópico por 7 dias e reavaliação.',
        prescriptions: 'Betametasona creme — aplicar 2x ao dia.',
        internalNotes: 'Orientado sobre possíveis irritantes de contato.',
      },
    },
    {
      apptId: generateUUID('77777777', 5),
      doctor: coreProfessional,
      record: {
        chiefComplaint: 'Consulta de acompanhamento geral com o profissional padrão.',
        diagnosis: 'Paciente estável, sem queixas relevantes.',
        treatmentPlan: 'Retorno em 90 dias.',
        prescriptions: null,
        internalNotes: 'Registro criado para validar fluxo do usuário profissional padrão.',
      },
    },
  ];

  for (let i = 0; i < corePatientRecordScenarios.length; i++) {
    const { apptId, doctor, record } = corePatientRecordScenarios[i];
    const recordId = generateUUID('44444444', 10 + i);

    await prisma.medicalRecord.upsert({
      where: { id: recordId },
      update: { ...record },
      create: {
        id: recordId,
        appointmentId: apptId,
        patientId: corePatient.id,
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
  console.log(`     Paciente padrão: ${corePatient.name} (${corePatient.email}) — histórico com múltiplos médicos (relatório multi-médico).`);

  // ─────────────────────────────────────────
  // 6.1. CONSULTAS ASSISTIDAS PELO GESTOR PADRÃO (gestor@lifemed.com)
  // Exercita o fluxo de agendamento/cancelamento assistido, usado no
  // dashboard do gestor (Appointment.scheduledByManager / cancelledByManager).
  // ─────────────────────────────────────────
  console.log('⏳ Criando consultas assistidas pelo gestor padrão...');

  if (coreManager.managerProfile) {
    const managerAssistedAppointments = [
      { pIdx: 0, dIdx: 0, status: AppointmentStatus.COMPLETED, modality: AppointmentModality.CLINIC, daysDiff: -35, cancelled: false },
      { pIdx: 3, dIdx: 4, status: AppointmentStatus.CONFIRMED, modality: AppointmentModality.VIRTUAL, daysDiff: 9, cancelled: false },
      { pIdx: 6, dIdx: 9, status: AppointmentStatus.PENDING, modality: AppointmentModality.HOME_VISIT, daysDiff: 15, cancelled: false },
      { pIdx: 9, dIdx: 12, status: AppointmentStatus.CANCELLED, modality: AppointmentModality.VIRTUAL, daysDiff: -12, cancelled: true },
    ];

    for (let i = 0; i < managerAssistedAppointments.length; i++) {
      const { pIdx, dIdx, status, modality, daysDiff, cancelled } = managerAssistedAppointments[i];
      const appointmentId = generateUUID('50000000', i);

      await prisma.appointment.upsert({
        where: { id: appointmentId },
        update: {
          status,
          modality,
          dateTime: getRelativeDate(daysDiff),
          scheduledByManagerId: coreManager.managerProfile.id,
          cancelledByManagerId: cancelled ? coreManager.managerProfile.id : null,
          cancelledAt: cancelled ? getRelativeDate(daysDiff - 1) : null,
        },
        create: {
          id: appointmentId,
          patientId: patients[pIdx].id,
          professionalId: professionals[dIdx].id,
          status,
          modality,
          dateTime: getRelativeDate(daysDiff),
          scheduledByManagerId: coreManager.managerProfile.id,
          cancelledByManagerId: cancelled ? coreManager.managerProfile.id : null,
          cancelledAt: cancelled ? getRelativeDate(daysDiff - 1) : null,
          notes: status === AppointmentStatus.COMPLETED ? 'Consulta agendada de forma assistida pelo gestor padrão.' : null,
        },
      });
    }
    console.log(`  ${managerAssistedAppointments.length} consultas assistidas pelo gestor padrão criadas.`);
  }

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
  // Popula pacientes com questionários respondidos (vulneráveis e não-vulneráveis,
  // respondidos pelo próprio paciente e por gestor) para que os filtros e
  // relatórios do gestor tenham dados reais.
  // ─────────────────────────────────────────
  console.log('⏳ Criando respostas de questionário...');

  const questionnaireScenarios = [
    {
      patient: patients[0], // Marcos — vulnerável (score alto)
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[0],
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
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[1],
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
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[2],
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
    {
      patient: patients[3], // Amanda — vulnerável, respondido pelo gestor (assistido)
      answeredBy: QuestionnaireAnsweredBy.MANAGER,
      answeredByUser: coreManager,
      answers: [
        { qIdx: 0, optIdx: 0 }, // Até 1 SM — score 3
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 0 }, // Desempregado sim — score 2
        { qIdx: 3, optIdx: 0 }, // CadÚnico sim — score 4
        { qIdx: 4, optIdx: 1 }, // Moradia não própria — score 1
        { qIdx: 5, optIdx: 0 }, // Com água encanada — score 0
        { qIdx: 6, optIdx: 0 }, // Com saneamento — score 0
      ], // total = 11 → vulnerável
      isVulnerable: true,
    },
    {
      patient: corePatient, // Paciente padrão — não vulnerável
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: corePatient,
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
      patient: patients[13], // Henrique — vulnerável (score alto)
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[13],
      answers: [
        { qIdx: 0, optIdx: 0 }, // Até 1 SM — score 3
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 0 }, // Desempregado sim — score 2
        { qIdx: 3, optIdx: 0 }, // CadÚnico sim — score 4
        { qIdx: 4, optIdx: 1 }, // Moradia não própria — score 1
        { qIdx: 5, optIdx: 1 }, // Sem água encanada — score 1
        { qIdx: 6, optIdx: 0 }, // Com saneamento — score 0
      ], // total = 12 → vulnerável
      isVulnerable: true,
    },
    {
      patient: patients[14], // Helena — não vulnerável
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[14],
      answers: [
        { qIdx: 0, optIdx: 3 }, // Acima 3 SM — score 0
        { qIdx: 1, optIdx: 0 }, // Até 2 pessoas — score 0
        { qIdx: 2, optIdx: 1 }, // Não desempregado — score 0
        { qIdx: 3, optIdx: 1 }, // Sem CadÚnico — score 0
        { qIdx: 4, optIdx: 0 }, // Moradia própria — score 0
        { qIdx: 5, optIdx: 0 }, // Com água encanada — score 0
        { qIdx: 6, optIdx: 1 }, // Sem saneamento — score 1
      ], // total = 1 → não vulnerável
      isVulnerable: false,
    },
    {
      patient: patients[15], // Igor — vulnerável, respondido pelo gestor (assistido)
      answeredBy: QuestionnaireAnsweredBy.MANAGER,
      answeredByUser: coreManager,
      answers: [
        { qIdx: 0, optIdx: 0 }, // Até 1 SM — score 3
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 0 }, // Desempregado sim — score 2
        { qIdx: 3, optIdx: 0 }, // CadÚnico sim — score 4
        { qIdx: 4, optIdx: 1 }, // Moradia não própria — score 1
        { qIdx: 5, optIdx: 1 }, // Sem água encanada — score 1
        { qIdx: 6, optIdx: 1 }, // Sem saneamento — score 1
      ], // total = 13 → vulnerável
      isVulnerable: true,
    },
    {
      patient: patients[17], // Camille — borderline (score 5)
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUser: patients[17],
      answers: [
        { qIdx: 0, optIdx: 1 }, // 1-2 SM — score 2
        { qIdx: 1, optIdx: 1 }, // 3+ pessoas — score 1
        { qIdx: 2, optIdx: 1 }, // Não desempregado — score 0
        { qIdx: 3, optIdx: 0 }, // CadÚnico sim — score 4
        { qIdx: 4, optIdx: 0 }, // Moradia própria — score 0
        { qIdx: 5, optIdx: 0 }, // Com água encanada — score 0
        { qIdx: 6, optIdx: 0 }, // Com saneamento — score 0
      ], // total = 6 → vulnerável (igual ao threshold)
      isVulnerable: true,
    },
  ];

  let questionnairesCreated = 0;
  for (let s = 0; s < questionnaireScenarios.length; s++) {
    const { patient, answers, isVulnerable, answeredBy, answeredByUser } = questionnaireScenarios[s];

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
        answeredBy,
        answeredByUserId: answeredByUser.id,
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

  const formatDateOnly = (daysDiff: number) => getRelativeDate(daysDiff).toISOString().slice(0, 10);

  const scheduleBlocks = [
    { professionalId: professionals[0].id, date: formatDateOnly(5), startTime: '12:00', endTime: '14:00' }, // almoço prolongado
    { professionalId: professionals[1].id, date: formatDateOnly(11), startTime: null, endTime: null },        // dia inteiro bloqueado
    { professionalId: professionals[2].id, date: formatDateOnly(16), startTime: '08:00', endTime: '10:00' },
    { professionalId: coreProfessional.id, date: formatDateOnly(2), startTime: '13:00', endTime: '15:00' }, // bloqueio do profissional padrão
  ];

  let blocksCreated = 0;
  for (let i = 0; i < scheduleBlocks.length; i++) {
    const { professionalId, date, startTime, endTime } = scheduleBlocks[i];
    const blockId = generateUUID('55555555', i);
    const existing = await prisma.scheduleBlock.findUnique({ where: { id: blockId } });
    if (!existing) {
      await prisma.scheduleBlock.create({
        data: {
          id: blockId,
          professionalId,
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
  console.log('\n📋 Credenciais fixas obrigatórias (senha: SenhaSegura123!):');
  console.log('   ADMIN       → admin@lifemed.com');
  console.log('   PACIENTE    → paciente@lifemed.com   (APPROVED, histórico com 8+ médicos diferentes, prontuários e questionário)');
  console.log('   PROFISSIONAL→ profissional@lifemed.com (agenda própria, disponibilidade, bloqueio de agenda e consultas em todos os status)');
  console.log('   GESTOR      → gestor@lifemed.com      (consultas agendadas/canceladas de forma assistida)');
  console.log('\n📋 Credenciais de exemplo (senha: Senha123!):');
  console.log('   PROFISSIONAL→ roberto.souza@lifemed.com (e outros 17, todos em Salvador/BA, bairros diferentes)');
  console.log('   PACIENTE    → paciente.marcos@gmail.com (APPROVED, vulnerável)');
  console.log('   PACIENTE    → paciente.luiza@gmail.com  (APPROVED, não vulnerável)');
  console.log('   PACIENTE    → paciente.amanda@gmail.com (APPROVED, vulnerável — questionário respondido pelo gestor)');
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

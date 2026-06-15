import type { Tour } from "nextstepjs";
import {
  Compass,
  Search,
  CalendarDays,
  LayoutDashboard,
  Stethoscope,
  ListFilter,
  ClipboardList,
  Download,
  FileText,
  Pencil,
  UserRound,
  MapPin,
  UserPlus,
  CalendarPlus,
  AlertTriangle,
  Table,
  Clock,
  CalendarCheck,
  Users,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

/**
 * Tours de onboarding (tutoriais de primeiro acesso) do LifeMed.
 *
 * Convenção de nome: "<role>-<tela>" (ex.: "patient-home").
 * Cada `selector` aponta para um `id` real renderizado na tela correspondente.
 * Os botões "Ajuda" (TourButton) disparam o tour pelo nome.
 *
 * Os passos são adaptativos por viewport via `getTours(isMobile)`:
 * - no mobile a sidebar fica escondida (vira a barra inferior `MobileNav`);
 * - posicionamentos laterais (left/right/cantos) viram vertical (bottom/top),
 *   pois não há largura para o card ao lado do alvo em telas estreitas.
 *
 * Texto em pt-BR, orientado à AÇÃO ("clique em…", "aqui você…"), encadeando os passos.
 */

const COMMON_STEP = {
  pointerPadding: 8,
  pointerRadius: 10,
  // Compensa o header fixo (h-14) ao rolar o alvo para a viewport.
  scrollOffset: 80,
  // Alvos que dependem de fetch (listas/cards) podem demorar a renderizar.
  selectorRetryAttempts: 5,
  selectorRetryDelay: 250,
};

type Side = NonNullable<Tour["steps"][number]["side"]>;

/**
 * Em telas estreitas não há espaço para o card ao lado do alvo, então
 * convertemos posicionamentos laterais/de canto em vertical. Para alvos no
 * canto superior direito (botões do header), o card abre abaixo e alinhado à
 * esquerda (`bottom-left`) para crescer para DENTRO da tela e não cortar na
 * borda direita. No desktop o `side` é mantido.
 */
function adaptSide(side: Side, isMobile: boolean): Side {
  if (!isMobile) return side;
  if (side.startsWith("top")) return "top";
  if (side.endsWith("right")) return "bottom-left";
  return "bottom";
}

export function getTours(isMobile: boolean): Tour[] {
  return [
    {
      tour: "patient-home",
      steps: [
        isMobile
          ? {
              icon: <Compass />,
              title: "Navegação",
              content: (
                <>
                  Use a barra inferior para circular entre as áreas: início,
                  buscar médicos, consultas, prontuários e perfil.
                </>
              ),
              selector: "#tour-mobile-nav",
              side: "top",
              ...COMMON_STEP,
            }
          : {
              icon: <Compass />,
              title: "Menu de navegação",
              content: (
                <>
                  Use este menu lateral para circular entre as áreas: início,
                  buscar médicos, consultas, prontuários e perfil.
                </>
              ),
              selector: "#tour-sidebar",
              side: "right",
              ...COMMON_STEP,
            },
        {
          icon: <Search />,
          title: "Buscar médicos",
          content: (
            <>
              Toque aqui para encontrar profissionais voluntários e agendar uma
              consulta gratuita.
            </>
          ),
          selector: "#tour-patient-search-btn",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <CalendarDays />,
          title: "Sua próxima consulta",
          content: (
            <>
              Aqui aparece sua próxima consulta confirmada. Você pode ver os
              detalhes ou agendar uma nova.
            </>
          ),
          selector: "#tour-patient-next-appt",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <LayoutDashboard />,
          title: "Seu resumo",
          content: (
            <>
              Estes cartões mostram um resumo rápido: próximas consultas, as que
              aguardam confirmação e as já realizadas.
            </>
          ),
          selector: "#tour-patient-stats",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Stethoscope />,
          title: "Médicos sugeridos",
          content: (
            <>
              Sugestões de profissionais para você. Toque em um deles para ver o
              perfil e agendar. Pronto, é só começar!
            </>
          ),
          selector: "#tour-patient-suggested",
          side: adaptSide("left", isMobile),
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "patient-search",
      steps: [
        {
          icon: <Search />,
          title: "Pesquisa e filtros",
          content: (
            <>
              Digite o nome ou a especialidade e use os filtros de especialidade
              e localização para refinar os resultados.
            </>
          ),
          selector: "#tour-search-bar",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Stethoscope />,
          title: "Resultados",
          content: (
            <>
              Cada cartão é um profissional. Toque em <strong>Ver perfil</strong>{" "}
              para conhecê-lo ou em <strong>Agendar</strong> para marcar a
              consulta.
            </>
          ),
          selector: "#tour-search-results",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "patient-appointments",
      steps: [
        {
          icon: <ListFilter />,
          title: "Filtrar por situação",
          content: (
            <>
              Alterne entre <strong>Próximas</strong>, <strong>Realizadas</strong>{" "}
              e <strong>Canceladas</strong> para encontrar a consulta que
              procura.
            </>
          ),
          selector: "#tour-appt-tabs",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <ClipboardList />,
          title: "Suas consultas",
          content: (
            <>
              Aqui ficam suas consultas. Toque em <strong>Detalhes</strong> para
              ver as informações ou em <strong>Cancelar</strong> quando
              permitido.
            </>
          ),
          selector: "#tour-appt-list",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Download />,
          title: "Baixar relatório",
          content: (
            <>
              Gere um PDF com as consultas da aba atual — útil para guardar ou
              apresentar em atendimentos.
            </>
          ),
          // O botão de relatório fica em locais diferentes por viewport.
          selector: isMobile ? "#tour-appt-report-mobile" : "#tour-appt-report",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "patient-records",
      steps: [
        {
          icon: <Search />,
          title: "Buscar prontuário",
          content: (
            <>
              Busque por médico, queixa ou diagnóstico e toque em{" "}
              <strong>Buscar</strong> para filtrar seus prontuários.
            </>
          ),
          selector: "#tour-records-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <FileText />,
          title: "Seus prontuários",
          content: (
            <>
              Cada item é um prontuário de uma consulta. Toque em{" "}
              <strong>Abrir</strong> para ver os detalhes e exportar em PDF.
            </>
          ),
          selector: "#tour-records-list",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "patient-profile",
      steps: [
        {
          icon: <Pencil />,
          title: "Editar perfil",
          content: (
            <>
              Toque em <strong>Editar Perfil</strong> para habilitar a alteração
              dos seus dados pessoais.
            </>
          ),
          selector: "#tour-profile-edit",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <UserRound />,
          title: "Informações pessoais",
          content: (
            <>
              Aqui ficam seus dados. Quando estiver editando, ajuste o que
              precisar e depois salve as alterações.
            </>
          ),
          selector: "#tour-profile-info",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <MapPin />,
          title: "Seu endereço",
          content: (
            <>
              Mantenha seu endereço atualizado — ele ajuda a encontrar
              atendimentos presenciais perto de você.
            </>
          ),
          selector: "#tour-profile-address",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "manager-home",
      steps: [
        {
          icon: <UserPlus />,
          title: "Ações rápidas",
          content: (
            <>
              Por aqui você cadastra um novo paciente ou inicia o agendamento de
              uma consulta.
            </>
          ),
          selector: "#tour-mgr-actions",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <LayoutDashboard />,
          title: "Indicadores",
          content: (
            <>
              Um resumo da operação: total de pacientes, consultas, quem está sem
              questionário e quantos são vulneráveis.
            </>
          ),
          selector: "#tour-mgr-stats",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <CalendarDays />,
          title: "Próximas consultas",
          content: (
            <>
              As próximas consultas agendadas. Use <strong>Ver todas</strong>{" "}
              para abrir a lista completa.
            </>
          ),
          selector: "#tour-mgr-upcoming",
          side: "top",
          ...COMMON_STEP,
        },
        {
          icon: <AlertTriangle />,
          title: "Pontos de atenção",
          content: (
            <>
              Aqui aparecem pendências que precisam de ação, como consultas
              pendentes e pacientes sem questionário.
            </>
          ),
          selector: "#tour-mgr-attention",
          side: adaptSide("left", isMobile),
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "manager-patients",
      steps: [
        {
          icon: <UserPlus />,
          title: "Cadastrar paciente",
          content: (
            <>
              Toque aqui para abrir o formulário e cadastrar um novo paciente.
            </>
          ),
          selector: "#tour-mgr-patients-new",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <LayoutDashboard />,
          title: "Resumo dos pacientes",
          content: (
            <>
              Totais rápidos: pacientes ativos e quantos já responderam ao
              questionário.
            </>
          ),
          selector: "#tour-mgr-patients-stats",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Search />,
          title: "Buscar paciente",
          content: <>Digite o nome para localizar um paciente rapidamente.</>,
          selector: "#tour-mgr-patients-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Table />,
          title: "Lista de pacientes",
          content: (
            <>
              A lista com todos os pacientes. Toque em <strong>Ver Detalhes</strong>{" "}
              para abrir o cadastro e o questionário. As colunas são ordenáveis.
            </>
          ),
          selector: "#tour-mgr-patients-table",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "manager-appointments",
      steps: [
        {
          icon: <CalendarPlus />,
          title: "Nova consulta",
          content: <>Inicie o agendamento de uma nova consulta por aqui.</>,
          selector: "#tour-mgr-appts-new",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <Search />,
          title: "Buscar e filtrar",
          content: (
            <>
              Busque por paciente ou profissional e filtre por situação da
              consulta.
            </>
          ),
          selector: "#tour-mgr-appts-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Table />,
          title: "Lista de consultas",
          content: (
            <>
              Todas as consultas da clínica. Você pode ordenar pelas colunas e{" "}
              <strong>Cancelar</strong> quando necessário.
            </>
          ),
          selector: "#tour-mgr-appts-table",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "manager-new-appointment",
      steps: [
        {
          icon: <Search />,
          title: "Encontrar profissional",
          content: (
            <>
              Busque e filtre o profissional desejado por nome, especialidade ou
              localização.
            </>
          ),
          selector: "#tour-mgr-new-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Stethoscope />,
          title: "Escolher e agendar",
          content: (
            <>
              Cada cartão é um profissional. Toque em <strong>Agendar</strong>{" "}
              para escolher o paciente e marcar a consulta.
            </>
          ),
          selector: "#tour-mgr-new-results",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "manager-profile",
      steps: [
        {
          icon: <Pencil />,
          title: "Editar perfil",
          content: (
            <>
              Toque em <strong>Editar Perfil</strong> para atualizar seus dados.
            </>
          ),
          selector: "#tour-mgr-profile-edit",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <UserRound />,
          title: "Suas informações",
          content: (
            <>
              Seus dados pessoais. Ao editar, ajuste o necessário e salve as
              alterações.
            </>
          ),
          selector: "#tour-mgr-profile-info",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },

    // ── PROFESSIONAL ────────────────────────────────────────────────────────
    {
      tour: "professional-home",
      steps: [
        isMobile
          ? {
              icon: <Compass />,
              title: "Navegação",
              content: (
                <>
                  Use a barra inferior para circular entre as áreas: painel,
                  agenda, pacientes, prontuários e perfil.
                </>
              ),
              selector: "#tour-mobile-nav",
              side: "top" as Side,
              ...COMMON_STEP,
            }
          : {
              icon: <Compass />,
              title: "Menu de navegação",
              content: (
                <>
                  Use este menu para circular entre as áreas: painel, agenda,
                  pacientes, prontuários e perfil.
                </>
              ),
              selector: "#tour-sidebar",
              side: "right" as Side,
              ...COMMON_STEP,
            },
        {
          icon: <CalendarDays />,
          title: "Minha Agenda",
          content: (
            <>
              Acesse a agenda completa do dia, gerencie horários e visualize os
              atendimentos confirmados.
            </>
          ),
          selector: "#tour-prof-agenda-btn",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <LayoutDashboard />,
          title: "Indicadores do dia",
          content: (
            <>
              Resumo rápido: consultas de hoje, solicitações pendentes de
              aprovação e total de pacientes atendidos.
            </>
          ),
          selector: "#tour-prof-stats",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <CalendarCheck />,
          title: "Próximo atendimento",
          content: (
            <>
              O próximo paciente confirmado aparece aqui. Você pode ver o
              prontuário ou iniciar a videochamada.
            </>
          ),
          selector: "#tour-prof-next-appt",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Clock />,
          title: "Solicitações pendentes",
          content: (
            <>
              Novas solicitações de agendamento aparecem aqui. Aceite ou recuse
              cada uma diretamente por esta área.
            </>
          ),
          selector: "#tour-prof-requests",
          side: adaptSide("left", isMobile),
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "professional-schedule",
      steps: [
        {
          icon: <CalendarCheck />,
          title: "Gerenciar horários",
          content: (
            <>
              Clique aqui para configurar os dias e horários em que você aceita
              consultas.
            </>
          ),
          selector: "#tour-prof-sched-manage",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <CalendarDays />,
          title: "Calendário",
          content: (
            <>
              Selecione qualquer dia no calendário para visualizar os
              atendimentos agendados naquela data.
            </>
          ),
          selector: "#tour-prof-sched-calendar",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <Clock />,
          title: "Linha do tempo",
          content: (
            <>
              Aqui ficam os horários do dia selecionado. Confirme, cancele ou
              finalize consultas diretamente nesta área.
            </>
          ),
          selector: "#tour-prof-sched-timeline",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "professional-patients",
      steps: [
        {
          icon: <Search />,
          title: "Buscar paciente",
          content: (
            <>
              Pesquise por nome, e-mail, telefone ou CPF para localizar um
              paciente rapidamente.
            </>
          ),
          selector: "#tour-prof-patients-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Users />,
          title: "Lista de pacientes",
          content: (
            <>
              Cartões com seus pacientes. Toque em um cartão para ver o perfil
              e o histórico de consultas.
            </>
          ),
          selector: "#tour-prof-patients-list",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "professional-records",
      steps: [
        {
          icon: <Search />,
          title: "Filtrar prontuários",
          content: (
            <>
              Busque por paciente, queixa ou diagnóstico e filtre por período
              para encontrar o prontuário desejado.
            </>
          ),
          selector: "#tour-prof-records-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <FileText />,
          title: "Prontuários criados",
          content: (
            <>
              Cada item é um prontuário de uma consulta. Toque em{" "}
              <strong>Abrir</strong> para visualizar ou editar os detalhes.
            </>
          ),
          selector: "#tour-prof-records-list",
          side: "bottom",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "professional-profile",
      steps: [
        {
          icon: <Pencil />,
          title: "Editar perfil",
          content: (
            <>
              Clique em <strong>Editar Perfil</strong> para atualizar seus dados
              profissionais e foto.
            </>
          ),
          selector: "#tour-prof-profile-edit",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <UserRound />,
          title: "Informações profissionais",
          content: (
            <>
              Seus dados pessoais e links sociais. Mantenha-os atualizados para
              que os pacientes possam encontrá-lo.
            </>
          ),
          selector: "#tour-prof-profile-info",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <MapPin />,
          title: "Seu endereço",
          content: (
            <>
              Informe seu endereço para que os pacientes saibam onde você
              atende presencialmente.
            </>
          ),
          selector: "#tour-prof-profile-address",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },

    // ── ADMIN ────────────────────────────────────────────────────────────────
    {
      tour: "admin-home",
      steps: [
        {
          icon: <UserPlus />,
          title: "Cadastrar gestor",
          content: (
            <>
              Crie uma nova conta de gestor pelo painel administrativo,
              vinculada à operação da clínica.
            </>
          ),
          selector: "#tour-admin-new-manager",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <Stethoscope />,
          title: "Gerenciar especialidades",
          content: (
            <>
              Adicione, edite ou remova as especialidades médicas disponíveis no
              sistema.
            </>
          ),
          selector: "#tour-admin-specialties",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <ClipboardCheck />,
          title: "Gerenciar questionário",
          content: (
            <>
              Configure as perguntas do questionário de vulnerabilidade
              aplicado aos pacientes.
            </>
          ),
          selector: "#tour-admin-questionnaires",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <ListFilter />,
          title: "Filtrar e buscar",
          content: (
            <>
              Filtre por tipo de usuário (Paciente, Profissional ou Gestor) e
              busque pelo nome ou e-mail.
            </>
          ),
          selector: "#tour-admin-users-toolbar",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Table />,
          title: "Lista de usuários",
          content: (
            <>
              Todos os usuários do sistema. Visualize detalhes, aprove ou
              bloqueie contas diretamente por aqui.
            </>
          ),
          selector: "#tour-admin-users-table",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "admin-appointments",
      steps: [
        {
          icon: <CalendarPlus />,
          title: "Nova consulta",
          content: (
            <>
              Inicie o agendamento de uma nova consulta para qualquer paciente
              e profissional do sistema.
            </>
          ),
          selector: "#tour-mgr-appts-new",
          side: adaptSide("bottom-right", isMobile),
          ...COMMON_STEP,
        },
        {
          icon: <Search />,
          title: "Buscar e filtrar",
          content: (
            <>
              Busque por paciente ou profissional e filtre pelo status da
              consulta para localizar rapidamente.
            </>
          ),
          selector: "#tour-mgr-appts-search",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <Table />,
          title: "Lista de consultas",
          content: (
            <>
              Todas as consultas do sistema. Ordene pelas colunas e cancele
              quando necessário.
            </>
          ),
          selector: "#tour-mgr-appts-table",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
    {
      tour: "admin-new-manager",
      steps: [
        {
          icon: <UserPlus />,
          title: "Formulário de cadastro",
          content: (
            <>
              Preencha nome, e-mail, CPF, telefone e senha inicial do novo
              gestor. A bio é opcional.
            </>
          ),
          selector: "#tour-admin-mgr-form",
          side: "bottom",
          ...COMMON_STEP,
        },
        {
          icon: <ShieldCheck />,
          title: "Confirmar cadastro",
          content: (
            <>
              Após preencher os dados, clique em{" "}
              <strong>Cadastrar gestor</strong> para criar a conta. O gestor
              receberá as credenciais de acesso.
            </>
          ),
          selector: "#tour-admin-mgr-submit",
          side: "top",
          ...COMMON_STEP,
        },
      ],
    },
  ];
}

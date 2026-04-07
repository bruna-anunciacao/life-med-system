workspace "Life Med System" "Plataforma digital de saúde que conecta pacientes a profissionais voluntários." {

    !identifiers hierarchical

    model {

        # ─── Atores ───────────────────────────────────────────────────────────
        paciente     = person "Paciente"       "Usuário do sistema"
        profissional = person "Profissional"   "Voluntário de saúde"
        gestor       = person "Gestor"         "Coordenador admin."
        admin        = person "Administrador"  "Admin do sistema"

        # ─── Sistema externo ──────────────────────────────────────────────────
        smtp = softwareSystem "Serviço de E-mail" "E-mails transacionais via SMTP." {
            tags "External"
        }

        # ─── Sistema principal ────────────────────────────────────────────────
        ss = softwareSystem "Life Med System" "Plataforma web de agendamento de consultas gratuitas." {

            # ── L2: Containers ─────────────────────────────────────────────
            wa = container "Aplicação Web" "Interface responsiva com controle de acesso por perfil." "Next.js · React · Tailwind CSS · TanStack Query · Axios" {
                tags "Web"

                # ── L3: Componentes do Frontend ──────────────────────────
                uiLib       = component "Biblioteca de UI"          "Componentes reutilizáveis: botões, inputs, modais, tabelas."    "Shadcn · Tailwind CSS · Radix UI"
                apiClient   = component "Cliente de API"            "Instância Axios com interceptors JWT e tratamento de erros."    "Axios · js-cookie"
                authPages   = component "Páginas de Autenticação"   "Login, registro, recuperação e verificação de e-mail."          "React Hook Form · Zod"
                patientDash = component "Dashboard do Paciente"     "Busca de profissionais, agendamentos e exportação de PDF."      "TanStack Query"
                proDash     = component "Dashboard do Profissional" "Gerenciamento de disponibilidade e agenda diária."              "TanStack Query"
                managerDash = component "Dashboard do Gestor"       "Cadastro de pacientes e criação de agendamentos."               "TanStack Query"
                adminDash   = component "Dashboard do Admin"        "Aprovação e verificação de profissionais cadastrados."          "TanStack Query"
            }

            api = container "API Backend" "Processa regras de negócio, autenticação e relatórios." "NestJS · TypeScript · Prisma ORM · JWT · Passport" {
                tags "API"

                # ── L3: Componentes do Backend ───────────────────────────
                authModule   = component "Módulo de Autenticação"  "Registro, login, verificação de e-mail e redefinição de senha."     "JWT · bcryptjs · Passport"
                usersModule  = component "Módulo de Usuários"      "Perfis, upload de foto e listagem de profissionais/pacientes."      "NestJS · Multer"
                proModule    = component "Módulo de Profissionais" "Disponibilidade semanal e configurações do profissional."           "NestJS"
                apptModule   = component "Módulo de Consultas"     "Agendamento, slots disponíveis, cancelamento com regra de 6h."     "NestJS · Prisma"
                managerModule = component "Módulo do Gestor"       "Criação de pacientes e agendamentos administrativos."              "NestJS"
                patientsModule = component "Módulo de Pacientes"   "Exportação de relatórios filtrados por status."                    "PDFKit"
                mailModule   = component "Módulo de E-mail"        "Templates de e-mail: verificação, aprovação e senha temporária."   "Nodemailer"
                prisma       = component "Serviço de Dados"        "Acesso ao banco com ORM, transações e migrações."                  "Prisma ORM"
            }

            db = container "Banco de Dados" "Persiste usuários, perfis, disponibilidades, consultas e tokens." "PostgreSQL 15" {
                tags "Database"
            }
        }

        # ─── L1: Relacionamentos de contexto ──────────────────────────────────
        paciente     -> ss.wa "Acessa via navegador"
        profissional -> ss.wa "Acessa via navegador"
        gestor       -> ss.wa "Acessa via navegador"
        admin        -> ss.wa "Acessa via navegador"
        ss.wa        -> ss.api "REST API · HTTPS · JWT"
        ss.api       -> ss.db  "SQL via Prisma ORM"
        ss.api       -> smtp   "SMTP · Nodemailer"

        # ─── L3: Relacionamentos entre componentes do Frontend ────────────────
        ss.wa.authPages   -> ss.wa.apiClient "Endpoints de auth"
        ss.wa.patientDash -> ss.wa.apiClient "Endpoints de consulta"
        ss.wa.proDash     -> ss.wa.apiClient "Endpoints de profissional"
        ss.wa.managerDash -> ss.wa.apiClient "Endpoints de gestor"
        ss.wa.adminDash   -> ss.wa.apiClient "Endpoints de usuários"
        ss.wa.apiClient   -> ss.api          "REST API · HTTPS"

        # ─── L3: Relacionamentos entre componentes do Backend ─────────────────
        ss.api.authModule     -> ss.api.prisma     "Lê e grava usuários"
        ss.api.authModule     -> ss.api.mailModule  "Dispara e-mails"
        ss.api.usersModule    -> ss.api.prisma     "Lê e grava perfis"
        ss.api.proModule      -> ss.api.prisma     "Lê e grava disponibilidade"
        ss.api.apptModule     -> ss.api.prisma     "Lê e grava consultas"
        ss.api.managerModule  -> ss.api.prisma     "Lê e grava dados"
        ss.api.managerModule  -> ss.api.mailModule  "Envia senha temporária"
        ss.api.patientsModule -> ss.api.prisma     "Consulta histórico"
        ss.api.prisma         -> ss.db             "SQL"
        ss.api.mailModule     -> smtp              "SMTP"
    }

    views {

        # ── Nível 1 — Contexto ────────────────────────────────────────────────
        systemContext ss "L1_Contexto" "Nível 1 — Visão geral: sistema, atores e dependências externas." {
            include *
            autoLayout tb 300 150
        }

        # ── Nível 2 — Containers ──────────────────────────────────────────────
        container ss "L2_Containers" "Nível 2 — Unidades de deploy: frontend, backend e banco de dados." {
            include *
            autoLayout tb 300 150
        }

        # ── Nível 3 — Componentes do Frontend ────────────────────────────────
        # lr: dashboards (esq) → cliente API (centro) → API backend (dir)
        component ss.wa "L3_Frontend" "Nível 3 — Componentes internos da aplicação web (Next.js)." {
            include *
            autoLayout lr 300 100
        }

        # ── Nível 3 — Componentes do Backend ─────────────────────────────────
        # lr: módulos (esq) → prisma/mail (centro) → banco/e-mail (dir)
        component ss.api "L3_Backend" "Nível 3 — Módulos internos da API (NestJS)." {
            include *
            autoLayout lr 300 100
        }

        styles {
            element "Person" {
                shape person
                background #ffffff
                color #000000
                stroke #000000
                strokeWidth 2
                fontSize 12
                width 200
                height 200
            }
            element "Software System" {
                background #ffffff
                color #000000
                stroke #000000
                strokeWidth 2
                shape roundedbox
                fontSize 13
            }
            element "Container" {
                background #ffffff
                color #000000
                stroke #000000
                strokeWidth 2
                shape roundedbox
                fontSize 12
            }
            element "Component" {
                background #ffffff
                color #000000
                stroke #000000
                strokeWidth 1
                shape roundedbox
                fontSize 11
            }
            element "Database" {
                shape cylinder
                background #ffffff
                color #000000
                stroke #000000
                strokeWidth 2
                fontSize 12
            }
            element "External" {
                background #f5f5f5
                color #555555
                stroke #888888
                strokeWidth 2
                shape roundedbox
            }
            element "Boundary" {
                strokeWidth 2
                color #000000
            }
            relationship "Relationship" {
                thickness 2
                color #444444
                fontSize 10
            }
        }
    }

    configuration {
        scope softwaresystem
    }

}

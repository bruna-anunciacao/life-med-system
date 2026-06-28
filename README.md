# LifeMed System

Plataforma digital web responsiva, sem fins lucrativos, destinada a facilitar o acesso à saúde. O sistema conecta profissionais de saúde voluntários à comunidade, permitindo o agendamento de consultas gratuitas.

## Links do Projeto

| Recurso | Link |
|---------|------|
| **Frontend (Produção)** | https://life-med-system-web.vercel.app/ |
| **Backend (Produção)** | https://life-med.onrender.com/ |
| **Repositório Principal** | https://github.com/bruna-anunciacao/life-med-system |
| **Documentação de Requisitos** | [Google Docs](https://docs.google.com/document/d/1nTb6WZjGDMXA394hR0gvFeqp7Gk6E-zGJrsyybsuBJ4/edit?usp=sharing) |
| **Documentação da API (local)** | http://localhost:8000/api/docs |
| **Arquitetura C4** | [Google Drive](https://drive.google.com/file/d/1DR9QUuljaCMrjepajVdWZDnpnJh7PpGL/view?usp=sharing) |

## Visão Geral

O LifeMed atua como intermediário que permite:
- **Profissionais de Saúde** ofertarem horários voluntários, registrarem prontuários e visualizarem o histórico clínico de pacientes já atendidos por colegas
- **Pacientes** responderem um questionário de vulnerabilidade, aguardarem aprovação e agendarem consultas gratuitas
- **Gestores** acompanharem agendamentos, pacientes e profissionais de uma unidade
- **Administradores** gerenciarem usuários, especialidades, questionários de vulnerabilidade e cadastrarem gestores

## Tecnologias

### Frontend (`apps/web`)
- **Next.js 16** (App Router) com **Turbopack**
- **React 19**
- **TypeScript 5.9**
- **TailwindCSS 4** + **shadcn/ui** + **@base-ui/react**
- **TanStack Query** (React Query) para data fetching
- **React Hook Form** + **Zod** para formulários e validação
- **Axios** como HTTP client
- **Phosphor / Lucide** para ícones
- **Sonner** para notificações (toasts)
- **zxcvbn** para força de senha

### Backend (`apps/server`)
- **NestJS 11**
- **Prisma ORM 6** + **PostgreSQL**
- **JWT** + **Passport** para autenticação
- **Zod** para validação de schemas
- **Scalar** (`@scalar/nestjs-api-reference`) para documentação interativa da API
- **@nestjs/throttler** para rate limiting
- **Nodemailer** / **Resend** para envio de emails
- **Google Calendar API** (`googleapis`) para criação de eventos / Google Meet
- **PDFKit** para geração de relatórios em PDF
- **bcryptjs** para hash de senhas

### Infraestrutura
- **Monorepo:** Turborepo + npm workspaces
- **Backend (deploy):** Render
- **Frontend (deploy):** Vercel
- **CI/CD:** deploy automático ao merge na `main`

## Estrutura do Projeto

```
life-med-system/
├── apps/
│   ├── server/                  # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema/          # Schema Prisma (multi-arquivo)
│   │   │   ├── migrations/
│   │   │   ├── seed.ts          # Seed completo (usuários demo, especialidades)
│   │   │   └── seed-minimal.ts  # Seed mínimo
│   │   ├── scripts/             # google-oauth-bootstrap.ts (refresh token Google)
│   │   └── src/
│   │       ├── admin/
│   │       ├── appointments/
│   │       ├── auth/            # JWT, guards, strategies, decorators
│   │       ├── common/
│   │       ├── google-calendar/ # Integração Calendar/Meet
│   │       ├── mail/            # SMTP / Resend / Ethereal
│   │       ├── manager/
│   │       ├── medical-records/ # Prontuários (criação, leitura, compartilhamento)
│   │       ├── patients/
│   │       ├── prisma/
│   │       ├── professional/
│   │       ├── questionnaire/   # Questionário de vulnerabilidade
│   │       ├── speciality/
│   │       └── users/
│   └── web/                     # Frontend Next.js
│       ├── app/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   │   ├── admin/       # Usuários, especialidades, questionários, gestores
│       │   │   ├── manager/     # Agendamentos, pacientes, profissionais
│       │   │   ├── patient/     # Busca, agendamentos, prontuários
│       │   │   └── professional/# Agenda, pacientes, prontuários (próprios e compartilhados)
│       │   └── ui/
│       ├── components/
│       │   └── ui/              # Primitivos shadcn (DataTable, Sidebar, etc.)
│       ├── config/              # env.ts (validação via Zod)
│       ├── hooks/
│       ├── lib/                 # api.ts (axios)
│       ├── queries/             # TanStack Query hooks
│       └── services/            # Camada de serviços HTTP
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
└── docs/                        # Diagramas C4, Mermaid, Eraser e ADRs
```

---

## Guia de Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) **v18 ou superior** (recomendado v20+)
- [npm](https://www.npmjs.com/) **v11+** (o repositório define `packageManager: npm@11.6.4`)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou superior; **v16** recomendado)
- [pgAdmin](https://www.pgadmin.org/) (opcional, para gerenciamento visual)
- [Docker](https://www.docker.com/) (opcional, alternativa rápida ao PostgreSQL local)

> **Importante:** o projeto usa **npm** (não pnpm/yarn). Use sempre `npm run ...`.

---

### 1. Instalação do PostgreSQL

#### Alternativa com Docker (recomendado)

```bash
docker run --name life-med-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=root \
  -e POSTGRES_DB=life-med \
  -p 5432:5432 \
  -d postgres:16
```

Para parar ou iniciar o container depois:

```bash
docker stop life-med-db
docker start life-med-db
```

> Com essa opção, pule direto para o [passo 3](#3-configuração-do-projeto).

---

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Windows

Baixe e instale o [PostgreSQL Installer](https://www.postgresql.org/download/windows/).

---

### 2. Configuração do Banco de Dados

Acesse o PostgreSQL via terminal:

```bash
# Linux/macOS
sudo -u postgres psql

# Windows (PowerShell como Admin)
psql -U postgres
```

Execute os comandos SQL:

```sql
ALTER USER postgres WITH PASSWORD 'root';
CREATE DATABASE "life-med";
\q
```

#### Alternativa via pgAdmin

1. Conecte ao servidor com:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `root`
   - **SSL Mode:** `Disable`
2. Clique com botão direito em **Databases** → **Create** → **Database**
3. Nome: `life-med`

---

### 3. Configuração do Projeto

Clone o repositório e instale as dependências (a partir da raiz; o Turborepo resolve todos os workspaces):

```bash
git clone https://github.com/bruna-anunciacao/life-med-system.git
cd life-med-system
npm install
```

---

### 4. Configuração do Backend (`apps/server`)

Crie o arquivo de variáveis de ambiente:

```bash
cp apps/server/.env.example apps/server/.env
```

Edite `apps/server/.env`. Variáveis suportadas:

```env
# --- Banco e autenticação ---
DATABASE_URL="postgresql://postgres:root@localhost:5432/life-med?sslmode=disable"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# --- Google Calendar / Meet (opcional) ---
# Para gerar o refresh token, rode uma vez:
#   npx ts-node apps/server/scripts/google-oauth-bootstrap.ts
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary

# --- Email ---
# MAIL_PROVIDER: "smtp" | "resend" | "ethereal"
# Em dev, default é "ethereal" (gera link de preview).
# Em prod, prefere "resend" se RESEND_API_KEY existir; senão usa "smtp".
MAIL_PROVIDER=smtp
MAIL_FROM="LifeMed <noreply@lifemed.com>"

# SMTP (VPS / provedor próprio)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=
MAIL_PASS=
MAIL_CONTACT=

# Resend (https://resend.com)
RESEND_API_KEY=
```

> **Importante:** nunca commite o arquivo `.env` com credenciais reais.

---

### 5. Configuração do Frontend (`apps/web`) (opcional em dev)

O frontend usa apenas uma variável pública, com fallback para `http://localhost:8000`. Para customizar, crie `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 6. Migrações e Seed do Banco

Gere o cliente Prisma, aplique as migrações e (opcional) popule dados iniciais:

```bash
cd apps/server

npm run prisma:generate
npm run prisma:migrate -- --name init

# Seed completo (usuários demo, especialidades, questionário, etc.)
npx prisma db seed --schema prisma/schema

# OU seed mínimo
npx ts-node --transpile-only prisma/seed-minimal.ts

cd ../..
```

---

### 7. Executando o Projeto

Na raiz do projeto:

```bash
npm run dev
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Documentação da API (Scalar):** http://localhost:8000/api/docs

---

## Comandos Úteis

### Comandos do dia a dia (raiz do monorepo)

| Situação | Comando |
|----------|---------|
| Iniciar o projeto (web + server) | `npm run dev` |
| Build de produção (todos workspaces) | `npm run build` |
| Lint em todos workspaces | `npm run lint` |
| Type-check em todos workspaces | `npm run check-types` |
| Formatar código (Prettier) | `npm run format` |
| Após `git pull` | `npm install && cd apps/server && npm run prisma:generate && cd ../.. && npm run dev` |
| Após alterar o schema Prisma | `cd apps/server && npm run prisma:migrate -- --name descricao && cd ../..` |

### Comandos do Backend (`apps/server`)

```bash
cd apps/server

npm run dev         # nest start --watch
npm run build       # nest build
npm run start:prod  # node dist/main
npm run test        # jest
npm run test:e2e    # jest e2e
npm run lint        # eslint --fix
```

### Comandos do Frontend (`apps/web`)

```bash
cd apps/web

npm run dev          # next dev --turbopack (porta 3000)
npm run build        # next build
npm run start        # next start
npm run check-types  # next typegen && tsc --noEmit
npm run lint         # eslint --max-warnings 0
```

### Comandos do Prisma

> O schema está em `prisma/schema/` (multi-arquivo). Os comandos abaixo já incluem o caminho correto.

```bash
cd apps/server

npm run prisma:generate                        # gerar cliente Prisma
npm run prisma:migrate -- --name descricao     # criar migração em dev
npx prisma migrate deploy --schema prisma/schema  # aplicar migrações em prod
npm run prisma:studio                          # GUI no navegador (porta 5555)
npx prisma db seed --schema prisma/schema      # rodar seed.ts
```

### Comandos do PostgreSQL

```bash
sudo systemctl status postgresql   # status
sudo systemctl start postgresql    # iniciar
sudo -u postgres psql -d life-med  # acessar banco
```

### Bootstrap do Google Calendar (uma vez)

Para habilitar criação de eventos/Meet em consultas, gere o refresh token do Google OAuth:

```bash
cd apps/server
npx ts-node scripts/google-oauth-bootstrap.ts
```

Cole o `GOOGLE_CALENDAR_REFRESH_TOKEN` retornado no `.env`.

---

## Solução de Problemas

| Erro | Solução |
|------|---------|
| `Connection refused` ao conectar no banco | Execute `sudo systemctl start postgresql` ou `docker start life-med-db` |
| `Cannot find module 'dotenv/config'` | Execute `npm install` na raiz do monorepo |
| `Database "life-med" does not exist` | `sudo -u postgres psql` → `CREATE DATABASE "life-med";` |
| Erro de permissão no PostgreSQL | Verifique usuário/senha no `.env` |
| `Unit postgresql.service not found` | Instale o PostgreSQL: `sudo apt install postgresql` |
| `PrismaClient is not generated` | `cd apps/server && npx prisma generate` |
| Frontend não conecta ao backend | Verifique `NEXT_PUBLIC_API_URL` em `apps/web/.env.local` |
| Emails não chegam em dev | Use `MAIL_PROVIDER=ethereal` e abra o link de preview do console |
| Google Calendar 401/invalid_grant | Rode novamente `scripts/google-oauth-bootstrap.ts` para gerar novo refresh token |

---

## Atores do Sistema

- **Administrador:** gerencia usuários, especialidades, questionários de vulnerabilidade e cadastra gestores
- **Gestor:** acompanha agendamentos, pacientes e profissionais de uma unidade
- **Profissional de Saúde (Voluntário):** oferta horários, realiza atendimentos, registra prontuários e visualiza prontuários de colegas para pacientes já atendidos
- **Paciente:** responde o questionário de vulnerabilidade, aguarda aprovação manual e agenda consultas gratuitas
- **Sistema:** envia notificações por email, cria eventos no Google Calendar/Meet e gera prontuários em PDF

---

## Licença

Este projeto é sem fins lucrativos e destinado a facilitar o acesso à saúde.

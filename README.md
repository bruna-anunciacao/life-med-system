# LifeMed System

Plataforma digital web responsiva, sem fins lucrativos, destinada a facilitar o acesso à saúde. O sistema conecta profissionais de saúde voluntários à comunidade, permitindo o agendamento de consultas gratuitas.

## Links do Projeto

| Recurso | Link |
|---------|------|
| **Frontend (Produção)** | https://life-med-system-web.vercel.app/ |
| **Backend (Produção)** | https://life-med-system.onrender.com |
| **Repositório Principal** | https://github.com/bruna-anunciacao/life-med-system |
| **Repositório Original (TCC)** | https://github.com/bruna-anunciacao/life-med |
| **Documentação de Requisitos** | [Google Docs](https://docs.google.com/document/d/1nTb6WZjGDMXA394hR0gvFeqp7Gk6E-zGJrsyybsuBJ4/edit?usp=sharing) |

> **Nota:** O repositório original (`life-med`) foi usado como base, mas devido a problemas de tipagem e atualizações do NestJS, foi criado este novo repositório (`life-med-system`) para a versão de produção.

## Visão Geral

O LifeMed atua como intermediário que permite:
- **Profissionais de Saúde** ofertarem horários de atendimento voluntário
- **Pacientes** agendarem serviços de saúde de forma simples e gratuita

## Tecnologias

- **Frontend:** Next.js, React, TypeScript
- **Backend:** NestJS, Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Monorepo:** Turborepo

## Estrutura do Projeto

```
life-med-system/
├── apps/
│   ├── server/     # Backend NestJS
│   └── web/        # Frontend Next.js
├── packages/
│   ├── ui/         # Componentes compartilhados
│   ├── eslint-config/
│   └── typescript-config/
```

---

## Guia de Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou superior)
- [pgAdmin](https://www.pgadmin.org/) (opcional, para gerenciamento visual)

---

### 1. Instalação do PostgreSQL

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Inicie o serviço:

```bash
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

Execute os seguintes comandos SQL:

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

Clone o repositório:

```bash
git clone https://github.com/bruna-anunciacao/life-med-system.git
cd life-med-system
```

Instale as dependências:

```bash
npm install
```

---

### 4. Configuração do Backend

Crie o arquivo de variáveis de ambiente:

```bash
cp apps/server/.env.example apps/server/.env
```

Edite o arquivo `apps/server/.env`:

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/life-med?sslmode=disable"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

MAIL_HOST=smtp.exemplo.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=seu_email@exemplo.com
MAIL_PASS=sua_senha_de_app
```

> **Importante:** Nunca commite o arquivo `.env` com credenciais reais.

---

### 5. Migrações do Banco de Dados

Gere o cliente Prisma e execute as migrações:

```bash
cd apps/server
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

---

### 6. Executando o Projeto

Na raiz do projeto, execute:

```bash
npm run dev
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## Comandos Úteis

### Comandos do dia a dia

| Situação | Comando |
|----------|---------|
| Iniciar o projeto | `npm run dev` |
| Após `git pull` | `npm install && cd apps/server && npx prisma generate && cd ../.. && npm run dev` |
| Após alterar `.env` | `cd apps/server && npx prisma generate && cd ../..` |
| Após alterar `schema.prisma` | `cd apps/server && npx prisma migrate dev --name descricao && cd ../..` |

### Comandos do PostgreSQL

```bash
# Verificar status
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Acessar banco via terminal
sudo -u postgres psql -d life-med
```

### Comandos do Prisma

```bash
cd apps/server

# Gerar cliente Prisma
npx prisma generate

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Visualizar banco no navegador
npx prisma studio
```

---

## Solução de Problemas

| Erro | Solução |
|------|---------|
| `Connection refused` ao conectar no banco | Execute `sudo systemctl start postgresql` |
| `Cannot find module 'dotenv/config'` | Execute `npm install` na pasta `apps/server` |
| `Database "life-med" does not exist` | Crie o banco: `sudo -u postgres psql` → `CREATE DATABASE "life-med";` |
| Erro de permissão no PostgreSQL | Verifique usuário/senha no `.env` |
| `Unit postgresql.service not found` | Instale o PostgreSQL: `sudo apt install postgresql` |

---

## Atores do Sistema

- **Profissional de Saúde (Voluntário):** Médico, psicólogo, enfermeiro ou terapeuta que deseja doar seu serviço
- **Paciente (Usuário Comum):** Membro da comunidade que busca atendimento gratuito
- **Sistema (Automático):** Processos de background (notificações, atualizações de status)

---

## Licença

Este projeto é sem fins lucrativos e destinado a facilitar o acesso à saúde.

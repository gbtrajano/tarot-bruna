# 🔮 Arcana — Sistema de Cursos de Tarot

## Stack
- **Next.js 15** · **TypeScript** · **Tailwind CSS**
- **Supabase** (Postgres, Auth, Storage)
- **Mercado Pago** ou **Stripe**
- **Bun** como runtime

---

## Estrutura de arquivos

```
arcana/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── page.tsx                # Redireciona para /catalog
│   │   ├── login/page.tsx          # Login
│   │   ├── register/page.tsx       # Cadastro (só alunos)
│   │   ├── catalog/page.tsx        # Catálogo de cursos
│   │   ├── course/[id]/page.tsx    # Página de vendas do curso
│   │   ├── checkout/[id]/page.tsx  # Checkout / compra
│   │   ├── my-courses/page.tsx     # Meus cursos (aluno)
│   │   ├── learn/[id]/page.tsx     # Player de aula
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Layout do painel (protegido)
│   │   │   ├── page.tsx            # Dashboard com métricas
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx        # Lista de cursos
│   │   │   │   ├── new/page.tsx    # Criar novo curso
│   │   │   │   └── edit/page.tsx   # Editar curso (?id=...)
│   │   │   ├── students/page.tsx   # Gerenciar alunos
│   │   │   ├── finances/page.tsx   # Financeiro
│   │   │   └── settings/page.tsx   # Configurações e banco
│   │   └── api/
│   │       ├── checkout/route.ts   # API de pagamento
│   │       └── webhook/route.ts    # Webhook MP/Stripe
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── CourseEditor.tsx
│   │   │   └── SettingsClient.tsx
│   │   ├── student/
│   │   │   ├── StudentHeader.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   └── MarkCompleteButton.tsx
│   │   └── checkout/
│   │       └── CheckoutForm.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Client-side Supabase
│   │   │   └── server.ts           # Server-side Supabase
│   │   ├── actions/
│   │   │   ├── auth.ts             # Login, register, logout
│   │   │   ├── courses.ts          # CRUD cursos/módulos/aulas
│   │   │   └── dashboard.ts        # Stats, seller profile
│   │   └── utils.ts                # Helpers (formatCurrency, etc)
│   ├── middleware.ts                # Proteção de rotas
│   └── types/                      # TypeScript types
└── supabase/
    ├── migration.sql               # Todas as tabelas
    └── seed.sql                    # Criar vendedor e admin
```

---

## Setup

### 1. Instalar dependências
```bash
bun install
```

### 2. Variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 3. Banco de dados no Supabase

**a)** No SQL Editor, cole e execute `supabase/migration.sql`

**b)** Desative confirmação de e-mail:
`Authentication → Providers → Email → desligar "Confirm email" → Save`

### 4. Criar vendedor e admin

**a)** `Authentication → Users → Add user` — crie 2 usuários

**b)** Copie os UUIDs, edite `supabase/seed.sql` e execute

### 5. Rodar o projeto
```bash
bun dev
```

---

## Acessos

| Usuário | URL | Destino após login |
|---------|-----|--------------------|
| Vendedora / Admin | `/login` | `/dashboard` |
| Aluno | `/login` | `/catalog` |
| Cadastro público | `/register` | Cria apenas alunos |

---

## Configurar Mercado Pago

1. Acesse [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Crie um app e copie o **Access Token de produção**
3. No painel: **Configurações → Gateway → Mercado Pago** → cole o token
4. Configure o webhook: `https://seudominio.com/api/webhook?gateway=mercadopago`

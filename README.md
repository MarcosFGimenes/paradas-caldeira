# Paradas Caldeira - Sistema de Gestão de Ordens de Serviço

Sistema web para gerenciar ordens de serviço em paradas de equipamentos, com suporte a importação via Excel, organização hierárquica por pacotes e subpacotes, e atualização em tempo real do progresso.

## 🚀 Tecnologias

- **Frontend**: Next.js 16.x com React 19 e TypeScript
- **Estilização**: Tailwind CSS 4
- **Banco de Dados**: Firebase Firestore
- **Importação de Dados**: XLSX
- **Notificações**: React Hot Toast
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase

## 🛠️ Instalação e Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative Firestore Database
4. Copie suas credenciais
5. Crie arquivo `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Executar

```bash
npm run dev
```

Visite `http://localhost:3000`

## 📊 Funcionalidades

- ✅ Importação de Excel com validação automática
- ✅ Organização em 3 níveis: Pacotes > Subpacotes > O.S.
- ✅ Atualização em tempo real com auto-save
- ✅ Histórico de modificações
- ✅ Indicadores visuais de progresso (🟧 Em andamento, 🟩 Concluído, 🟥 Atrasado)
- ✅ Integração Firebase Firestore
- ✅ Dashboard com estatísticas

## 📁 Estrutura

```
app/
├── components/     # Componentes React
├── hooks/          # Hooks customizados
├── lib/            # Serviços Firebase
├── packages/       # Páginas dinâmicas
├── types/          # TypeScript types
├── utils/          # Utilitários
└── page.tsx        # Página principal
```

## 🔧 Tecnologia

- **Framework**: Next.js 16.x
- **Linguagem**: TypeScript
- **Backend**: Firebase
- **Database**: Firestore
- **UI**: React + Tailwind CSS
- **Importação**: XLSX
- **Notificações**: React Hot Toast
- **Deploy**: Vercel

## 🚀 Deploy

```bash
git push
# Deploy automático no Vercel
```

## 📝 License

MIT

---

**Status**: ✅ Projeto Inicializado com sucesso!


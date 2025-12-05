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

6. Preencha as chaves copiadas do console do Firebase no arquivo `.env.local`.

### 3. Aplicar regras do Firestore

Copie o conteúdo de `firestore.rules` deste repositório e cole na aba **Rules** do Firestore para proteger as coleções.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Acesso somente para usuários autenticados
    function isSignedIn() {
      return request.auth != null;
    }

    match /{document=**} {
      allow read, write: if isSignedIn();
    }
  }
}
```

### 4. Executar

```bash
npm run dev
```

Visite `http://localhost:3000`

## 📊 Funcionalidades atuais

- ✅ Listagem de pacotes com navegação para subpacotes
- ✅ Visualização das ordens de serviço de cada subpacote
- ✅ Atualização de status de O.S. (pendente/concluída)
- ✅ Importação inicial de O.S. via Excel

## 🚧 Pendências e próximos passos

- 🔲 Criar/editar pacotes e subpacotes via interface
- 🔲 Validação completa dos dados importados do Excel (campos obrigatórios, mensagens em lote)
- 🔲 Indicadores de progresso e dashboard resumido
- 🔲 Histórico de modificações das O.S.
- 🔲 Autenticação e controle de acesso
- 🔲 Ajustar layout/tema (hoje usa estilos inline simples)

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


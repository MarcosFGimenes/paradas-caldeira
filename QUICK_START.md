# Guia de Teste Rápido - Paradas Caldeira

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar Firebase**
   - Acesse https://console.firebase.google.com/
   - Crie um novo projeto (ou use um existente)
   - Ative Firestore Database
   - Copie as credenciais
   - Crie `.env.local`:
   
```bash
cp .env.example .env.local
```

   - Edite `.env.local` com suas credenciais do Firebase

3. **Configurar Firestore**
   - No Firebase Console, vá em Firestore Database
   - Clique em "Iniciar em modo de teste"
   - Edite as regras de segurança e defina como:
   
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. **Executar servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acessar a aplicação**
   - Abra http://localhost:3000 no navegador

## 📊 Fluxo de Teste

### 1️⃣ Criar um Pacote
- Na página inicial, clique em "+ Novo Pacote"
- Digite um nome (ex: "Parada Caldeira 2024")
- Clique em "Criar"

### 2️⃣ Importar Dados via Excel
- Acesse o pacote que criou
- Clique em "📊 Importar Excel"
- Selecione `exemplo-dados.csv` ou um arquivo Excel próprio

**Formato esperado do Excel:**
| TAG | Nome da Máquina | Descrição | Equipe |
|-----|-----------------|-----------|--------|
| BOMB-001 | Bomba Principal | Trocar óleo | Mecânica |

- Aguarde a validação
- Revise a pré-visualização
- Clique em "Importar"

### 3️⃣ Visualizar Subpacotes
- O sistema criará automaticamente subpacotes por equipe
- Você verá:
  - Mecânica
  - Elétrica
  - Soldadura
  - PCM
  - Instrumentação

### 4️⃣ Atualizar Progresso
- Clique em um subpacote para expandir
- Para cada Ordem de Serviço:
  - Edite o campo "% Atual"
  - O sistema auto-salva em 2 segundos
  - Veja o ✓ de confirmação
  - Digite 100 para marcar como concluído (🟩)

### 5️⃣ Verificar Progresso
- A barra de progresso atualiza automaticamente
- Cards mostram estatísticas em tempo real
- Indicadores visuais:
  - 🟧 Em andamento
  - 🟩 Concluído
  - 🟥 Atrasado
  - ⚪ Pendente

## 📁 Arquivo de Exemplo

Arquivo `exemplo-dados.csv` contém dados de teste:
- 20 ordens de serviço
- 5 equipes diferentes
- Variação de prioridades
- Nomes realistas

**Usar em Excel**: 
1. Abra em Excel
2. Salve como `.xlsx`
3. Use no modal de importação

## 🔧 Solução de Problemas

### Firebase não conecta
- Verifique se `.env.local` tem as credenciais corretas
- Verifique se Firestore está ativado no Firebase Console
- Verifique as regras de segurança do Firestore

### Erro ao importar Excel
- Verifique se as colunas obrigatórias estão presentes
- Nomes esperados: TAG, Nome da Máquina, Descrição, Equipe
- Sem tags duplicadas
- Sem células vazias nos campos obrigatórios

### Página em branco
- Abra o console (F12) e verifique erros
- Verifique se Firebase está rodando
- Reinicie o servidor (`npm run dev`)

## 📱 Recursos da Interface

### Navbar
- Logo e nome da aplicação
- Nome do usuário logado
- Avatar (placeholder)

### Página Inicial
- Lista de pacotes em cards
- Cada card mostra:
  - Nome do pacote
  - Status
  - Total de O.S.
  - O.S. concluídas
  - Barra de progresso

### Página do Pacote
- Cabeçalho com estatísticas gerais
- Botão "Importar Excel"
- Seção de subpacotes
- Para cada subpacote:
  - Header com info
  - Barra de progresso
  - Lista de O.S.

### Ordem de Serviço
Exibe em linha:
- Status emoji
- TAG
- Nome atual/antigo
- Descrição
- % anterior
- % atual (editável)
- Data/usuário
- Indicador de salvamento

## 🎯 Casos de Uso

### Caso 1: Simulação de Parada
1. Crie pacote "Parada Simples"
2. Importe exemplo-dados.csv
3. Atualize alguns itens para 50% (🟧)
4. Atualize alguns para 100% (🟩)
5. Veja o progresso geral atualizar

### Caso 2: Múltiplas Equipes
1. Crie pacote "Múltiplas Equipes"
2. Importe dados com várias equipes
3. Veja como subpacotes são criados automaticamente
4. Cada equipe tem sua seção

### Caso 3: Acompanhamento de Progresso
1. Crie pacote "Acompanhamento"
2. Importe 10 itens
3. Atualize 5 para 50%
4. Atualize 3 para 100%
5. Veja os indicadores visuais

## 🛠️ Desenvolvimento Futuro

Para estender o projeto:

1. **Adicionar filtros**: Veja `useWorkOrderFilters()` em `app/hooks/useWorkOrder.ts`

2. **Adicionar exportação**: Crie novo componente em `app/components/`

3. **Adicionar autenticação**: Configure Firebase Auth

4. **Adicionar relatórios**: Crie página em `app/` com gráficos

## 📞 Suporte

- Verifique `README.md` para mais informações
- Leia `ARCHITECTURE.md` para entender a estrutura
- Abra uma issue no GitHub para problemas

---

**Próximos passos sugeridos:**
1. Testar com dados reais
2. Configurar autenticação Firebase Auth
3. Adicionar filtros avançados
4. Implementar exportação de relatórios
5. Customizar tema/branding

# Arquitetura do Sistema Paradas Caldeira

## Visão Geral

O sistema é dividido em três camadas:

1. **Camada de Apresentação** (React Components + Next.js Pages)
2. **Camada de Lógica** (Hooks, Serviços Firestore)
3. **Camada de Dados** (Firebase Firestore)

## Estrutura de Pacotes e Dados

```
Pacote (Package)
├── nome: "Parada Caldeira 2024"
├── status: "in_progress"
├── subPackages: [ID1, ID2, ID3]
├── totalWorkOrders: 150
├── completedWorkOrders: 45
└── totalProgress: 30%
    │
    ├── Subpacote 1 (SubPackage)
    │   ├── name: "Mecânica"
    │   ├── type: "team"
    │   ├── workOrders: [W1, W2, W3, ...]
    │   ├── totalWorkOrders: 50
    │   ├── completedWorkOrders: 20
    │   └── averageProgress: 40%
    │       │
    │       ├── Ordem de Serviço (WorkOrder)
    │       │   ├── tag: "BOMB-001"
    │       │   ├── currentMachineName: "Bomba Principal"
    │       │   ├── description: "Substituir rolamento"
    │       │   ├── currentPercentage: 75%
    │       │   ├── previousPercentage: 50%
    │       │   ├── status: "in_progress"
    │       │   ├── lastModifiedAt: "2024-12-04 14:30"
    │       │   ├── lastModifiedBy: "João Silva"
    │       │   └── [logs de histórico]
    │       │
    │       └── Ordem de Serviço
    │           └── ...
    │
    └── Subpacote 2 (SubPackage)
        └── ...
```

## Fluxo de Dados

### 1. Importação de Excel

```
Arquivo Excel
     ↓
ExcelImporter.parseExcelFile()
     ↓
ExcelImporter.validateData()
     ↓
Agrupa por equipe
     ↓
SubPackageService.createSubPackage()
     ↓
WorkOrderService.createWorkOrder() [para cada linha]
     ↓
PackageService.updatePackageProgress()
     ↓
Firestore
```

### 2. Atualização de Progresso

```
User digita porcentagem em WorkOrderItem
     ↓
handlePercentageChange()
     ↓
debounce de 2 segundos
     ↓
WorkOrderService.updateWorkOrderPercentage()
     ↓
Registra em WorkOrderLog
     ↓
SubPackageService.updateSubPackageProgress()
     ↓
PackageService.updatePackageProgress()
     ↓
Firestore atualizado
     ↓
Toast de sucesso "✓"
```

## Componentes

### WorkOrderItem
- **Props**: workOrder, userId, onUpdate
- **Estado**: percentage, isSaved, updating
- **Funcionalidades**:
  - Edição de porcentagem com debounce
  - Auto-save ao sair do campo (blur)
  - Feedback visual de salvamento (✓)
  - Indicadores de status com emoji

### SubPackageView
- **Props**: subPackage, userId
- **Estado**: workOrders, loading
- **Funcionalidades**:
  - Carrega O.S. associadas
  - Exibe estatísticas
  - Mostra barra de progresso
  - Lista todas as O.S. do subpacote

### ImportExcelModal
- **Props**: packageId, userId, onSuccess, onClose
- **Estado**: step, file, data, validationResult, importing, progress
- **Etapas**:
  1. Upload - Seleção do arquivo
  2. Preview - Visualização dos dados
  3. Validation - Verificação de erros
  4. Importing - Importação com barra de progresso

### PackageList
- **Props**: userId
- **Estado**: packages, loading, showNewPackageForm
- **Funcionalidades**:
  - Lista todos os pacotes
  - Criação de novos pacotes
  - Cards com informações resumidas

### Page (home)
- **Estado**: userId, userName
- **Funcionalidades**:
  - Carrega dados do usuário
  - Exibe navbar e PackageList

### PackagePage
- **Params**: id (packageId)
- **Estado**: pkg, subPackages, loading, userId
- **Funcionalidades**:
  - Carrega dados do pacote
  - Exibe subpacotes
  - Gerencia modal de importação

## Services (Firestore)

### PackageService
- `createPackage(data)` - Cria novo pacote
- `getPackage(packageId)` - Obtém pacote por ID
- `getAllPackages()` - Lista todos os pacotes
- `updatePackage(packageId, data)` - Atualiza pacote
- `deletePackage(packageId)` - Deleta pacote
- `updatePackageProgress(packageId)` - Recalcula progresso

### SubPackageService
- `createSubPackage(data)` - Cria novo subpacote
- `getSubPackage(subPackageId)` - Obtém subpacote
- `getSubPackagesByPackage(packageId)` - Lista subpacotes de um pacote
- `updateSubPackage(subPackageId, data)` - Atualiza subpacote
- `updateSubPackageProgress(subPackageId)` - Recalcula progresso

### WorkOrderService
- `createWorkOrder(data)` - Cria nova O.S.
- `getWorkOrder(workOrderId)` - Obtém O.S.
- `getWorkOrdersBySubPackage(subPackageId)` - Lista O.S. de um subpacote
- `updateWorkOrder(workOrderId, data)` - Atualiza O.S.
- `updateWorkOrderPercentage(workOrderId, newPercentage, modifiedBy)` - Atualiza porcentagem e cria log
- `getSubPackagesByWorkOrder(workOrderId)` - Encontra subpacotes que contêm a O.S.

### WorkOrderLogService
- `createLog(data)` - Cria log de modificação
- `getLogsByWorkOrder(workOrderId)` - Obtém histórico de uma O.S.

## Hooks

### useWorkOrderUpdate()
- Gerencia atualização de O.S.
- Implementa debounce
- Cuida do auto-save
- Retorna: `updatePercentage`, `updating`

### useWorkOrderFilters()
- Gerencia estado de filtros
- Retorna: `filters`, setters para cada filtro, `resetFilters`

### useFilteredWorkOrders()
- Aplica filtros a uma lista de O.S.
- Retorna: lista filtrada

## Utilitários

### ExcelImporter
- `parseExcelFile(file)` - Parse do Excel
- `validateData(data)` - Validação completa
- `groupByTeam(data)` - Agrupa por equipe
- `detectColumns(headers)` - Detecta colunas automaticamente

## Fluxo de Autenticação (Futuro)

Atualmente usa identificação local via localStorage.

Integração Firebase Auth (planejado):
```
Login com email/senha ou OAuth
     ↓
Firebase Auth
     ↓
Token JWT
     ↓
Usado em chamadas Firestore
```

## Regras Firestore

### Desenvolvimento
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

### Produção
```javascript
match /packages/{packageId} {
  allow read, write: if request.auth != null;
}

match /subPackages/{subPackageId} {
  allow read, write: if request.auth != null;
}

match /workOrders/{workOrderId} {
  allow read, write: if request.auth != null;
}

match /workOrderLogs/{logId} {
  allow read: if request.auth != null;
  allow write: if false;
}
```

## Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Vercel
- Deploy automático ao fazer push para main
- Environment variables configuradas no Vercel Dashboard

## Melhorias Futuras

1. **Autenticação**
   - Firebase Auth com múltiplos provedores
   - Controle de permissões por role

2. **Funcionalidades Avançadas**
   - Filtros e busca avançada
   - Exportação de relatórios
   - Agendamento de O.S.
   - Notificações em tempo real
   - Anexos de documentos

3. **Performance**
   - Paginação de O.S.
   - Lazy loading de dados
   - Cache local

4. **UX/UI**
   - Temas personalizáveis
   - Modo escuro
   - Responsividade mobile melhorada
   - Gráficos e dashboards

5. **Dados**
   - Backup automático
   - Exportação/Importação completa
   - Versionamento de dados

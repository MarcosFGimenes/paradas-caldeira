# Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

- Repositório GitHub com o projeto
- Conta Vercel (gratuita)
- Conta Firebase com Firestore configurado

## 🚀 Passo a Passo

### 1. Preparar o Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Projeto Paradas Caldeira - Pronto para deploy"
git push origin main
```

### 2. Conectar ao Vercel

1. Acesse https://vercel.com
2. Clique em "New Project"
3. Conecte sua conta GitHub
4. Selecione o repositório `paradas-caldeira`
5. Clique em "Import"

### 3. Configurar Variáveis de Ambiente

No Vercel, na página de configuração do projeto:

1. Clique em "Environment Variables"
2. Adicione as seguintes variáveis (use os valores do Firebase):

```
NEXT_PUBLIC_FIREBASE_API_KEY = seu_valor_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = seu_id
NEXT_PUBLIC_FIREBASE_APP_ID = seu_app_id
```

3. Clique em "Save"

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build (cerca de 2-3 minutos)
3. Quando terminar, você receberá uma URL como:
   - `https://paradas-caldeira.vercel.app`

## 🔄 Deploys Automáticos

Após configurar inicial:
- Cada push para `main` gera um novo deploy automaticamente
- Você pode ver o progresso no dashboard do Vercel
- Deploys anteriores ficam disponíveis em "Deployments"

## 🔒 Configurar CORS Firebase

Para evitar problemas de CORS, configure no Firebase:

1. Firebase Console > Firestore Database > Rules
2. Defina regras apropriadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas quando autenticado
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // OU para testes (não recomendado em produção):
    // match /{document=**} {
    //   allow read, write: if true;
    // }
  }
}
```

## 🔐 Adicionar Firebase Auth (Recomendado)

1. Firebase Console > Authentication
2. Clique em "Enable"
3. Selecione "Email/Password" ou OAuth provedores
4. Ao projeto React, adicione:

```bash
npm install firebase-ui-react
```

Exemplo de componente Login:
```typescript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export async function handleLogin(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userId", result.user.uid);
    localStorage.setItem("userName", result.user.email || "Usuário");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
}
```

## 📊 Monitorar Aplicação

No Vercel Dashboard:

1. **Analytics** - Veja estatísticas de tráfego
2. **Logs** - Monitore erros em tempo real
3. **Deployments** - Histórico de deploys
4. **Settings** - Configurações da aplicação

## 🆘 Troubleshooting

### Erro "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Erro "Firestore credentials not found"
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Redeploy após adicionar variáveis

### Erro CORS
- Configure corretamente as regras Firestore
- Firebase precisa estar configurado para aceitar o domínio

### Build falha
- Verifique logs no Vercel
- Certifique-se de que `npm run build` funciona localmente
- Verifique TypeScript errors: `npm run lint`

## 🎯 Checklist de Deploy

- [ ] Código em repositório GitHub
- [ ] `.env.example` com template das variáveis
- [ ] `.gitignore` contém `.env.local`
- [ ] Firebase Firestore configurado
- [ ] Conta Vercel criada
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Teste a aplicação em produção
- [ ] Configure domínio customizado (opcional)

## 📱 Domínio Customizado (Opcional)

1. Vercel Dashboard > Project > Settings > Domains
2. Clique em "Add"
3. Digite seu domínio (ex: paradas.seudominio.com)
4. Siga as instruções de DNS
5. Aguarde propagação (até 48h)

## 🔄 Pipeline CI/CD

Seu pipeline automático:

```
git push main
    ↓
GitHub webhook
    ↓
Vercel detecção
    ↓
Build: npm run build
    ↓
Test: npm run lint
    ↓
Deploy automático
    ↓
URL disponível
```

## 📈 Performance

Para otimizar:

1. **Images**: Use Next.js Image component
2. **Code Splitting**: Automático com Next.js
3. **Caching**: Configure em `next.config.ts`
4. **Database**: Firestore é otimizado automaticamente

## 🔒 Segurança em Produção

1. **Ativar autenticação Firebase Auth**
2. **Configurar HTTPS** (automático no Vercel)
3. **Revisar Firestore Rules**
4. **Usar variáveis de ambiente** para dados sensíveis
5. **Habilitar 2FA** no GitHub

## 📚 Recursos Úteis

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment

---

**Status**: Deploy pronto! 🚀

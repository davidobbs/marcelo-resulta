# 🚀 Guia de Instalação - Club Finance Pilot

Este guia fornece instruções detalhadas para instalar e configurar o Club Finance Pilot em React/Next.js.

## 📋 Pré-requisitos

### Sistema Operacional
- Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 18.04+)

### Software Necessário
- **Node.js** 18.0.0 ou superior [Download](https://nodejs.org/)
- **npm** 8.0.0 ou superior (incluído com Node.js)
- **Git** [Download](https://git-scm.com/)

### Verificação dos Pré-requisitos

```bash
# Verificar versão do Node.js
node --version
# Deve retornar v18.0.0 ou superior

# Verificar versão do npm
npm --version
# Deve retornar 8.0.0 ou superior

# Verificar Git
git --version
# Deve retornar a versão instalada
```

## 🔧 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
# Clone via HTTPS
git clone https://github.com/your-org/club-finance-pilot.git

# OU clone via SSH (se configurado)
git clone git@github.com:your-org/club-finance-pilot.git

# Entre no diretório
cd club-finance-pilot
```

### 2. Instale as Dependências

```bash
# Instalar todas as dependências
npm install

# OU usar yarn (alternativa)
yarn install
```

**⚠️ Nota**: A instalação pode demorar alguns minutos dependendo da sua conexão.

### 3. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o arquivo conforme necessário
# No Windows: notepad .env.local
# No macOS/Linux: nano .env.local
```

### 4. Execute o Projeto

```bash
# Modo desenvolvimento
npm run dev

# OU usando yarn
yarn dev
```

### 5. Acesse a Aplicação

Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

## 🔍 Verificação da Instalação

Se a instalação foi bem-sucedida, você deve ver:

1. ✅ A página inicial do Club Finance Pilot
2. ✅ Menu lateral funcionando
3. ✅ Dashboard com métricas de exemplo
4. ✅ Navegação entre páginas

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting
npm run lint:fix     # Corrige problemas de lint
npm run type-check   # Verifica tipos TypeScript
```

### Testes
```bash
npm run test         # Executa testes
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
```

## 🔧 Configuração Avançada

### Configuração do Editor (VS Code)

1. Instale as extensões recomendadas:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Hero
   - Prettier - Code formatter
   - ESLint

2. Crie `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Configuração de Hooks Git

```bash
# Instalar Husky (já configurado no package.json)
npx husky install

# Tornar executável (Linux/macOS)
chmod +x .husky/pre-commit
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"
```bash
# Usar porta diferente
npm run dev -- -p 3001
```

### Erro de Permissão (Linux/macOS)
```bash
# Dar permissões corretas
sudo chown -R $(whoami) ~/.npm
```

### Erro de TypeScript
```bash
# Verificar configuração TypeScript
npm run type-check
```

### Problemas com ESLint
```bash
# Corrigir automaticamente
npm run lint:fix
```

## 🔄 Atualização

### Atualizar Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependências principais (cuidado!)
npm install package@latest
```

### Atualizar o Projeto
```bash
# Fazer backup de mudanças locais
git stash

# Buscar últimas mudanças
git pull origin main

# Restaurar mudanças locais (se necessário)
git stash pop

# Reinstalar dependências
npm install
```

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Instale Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Netlify

1. Build do projeto:
```bash
npm run build
```

2. Conecte repositório no painel Netlify

### Docker (Opcional)

1. Crie `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Build e execução:
```bash
docker build -t club-finance-pilot .
docker run -p 3000:3000 club-finance-pilot
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Documentação**: Consulte o [README.md](README.md)
2. **Issues**: [GitHub Issues](https://github.com/your-org/club-finance-pilot/issues)
3. **Discussões**: [GitHub Discussions](https://github.com/your-org/club-finance-pilot/discussions)

## ✅ Lista de Verificação

- [ ] Node.js 18+ instalado
- [ ] npm 8+ instalado
- [ ] Git instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação rodando em localhost:3000
- [ ] Navegação funcionando
- [ ] Nenhum erro no console

---

🎉 **Parabéns!** O Club Finance Pilot está instalado e pronto para uso! 
# Club Finance Pilot 🚀⚽

Sistema completo de análise financeira para clubes de futebol desenvolvido em React/Next.js 14 com TypeScript.

## 📋 Sobre o Projeto

O Club Finance Pilot é uma ferramenta profissional para análise de viabilidade financeira de projetos de clubes de futebol. O sistema oferece:

- **Análise DRE Completa**: Demonstração do Resultado do Exercício detalhada
- **Projeções Financeiras**: Análises até 2035 com cenários otimista, realista e pessimista
- **Análise de Viabilidade**: ROI, TIR, VPL, Payback e análise de sensibilidade
- **Capital de Giro**: Necessidades e gestão de capital de giro
- **KPIs Dinâmicos**: Indicadores-chave de performance em tempo real
- **Multi-mercado**: Suporte para Brasil, Europa e Emirados Árabes
- **Exportação**: Excel e PDF com relatórios completos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **Framer Motion** - Animações suaves
- **Lucide React** - Ícones modernos

### Estado e Dados
- **Zustand** - Gerenciamento de estado global
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Gráficos e Visualização
- **Chart.js** - Gráficos interativos
- **React Chart.js 2** - Wrapper React para Chart.js
- **Recharts** - Gráficos alternativos

### Utilitários
- **Date-fns** - Manipulação de datas
- **Lodash** - Utilitários JavaScript
- **Math.js** - Cálculos matemáticos avançados
- **Numeral** - Formatação de números

### Exportação
- **XLSX** - Exportação para Excel
- **jsPDF** - Geração de PDFs
- **jsPDF AutoTable** - Tabelas em PDF

### Qualidade de Código
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **Lint-staged** - Linting em staged files

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18.0.0 ou superior
- npm 8.0.0 ou superior
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/your-org/club-finance-pilot.git
cd club-finance-pilot
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações da aplicação
NEXT_PUBLIC_APP_NAME="Club Finance Pilot"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# URLs da API (para futuras integrações)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Configurações de analytics (opcional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

### 4. Execute o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar versão de produção
npm start

# Executar testes
npm test

# Linting
npm run lint
npm run lint:fix

# Verificação de tipos
npm run type-check
```

### 5. Acesse a Aplicação

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── dashboard/         # Páginas do dashboard
│   │   ├── dre/          # DRE Gerencial
│   │   ├── capital-giro/ # Capital de Giro
│   │   ├── fluxo-caixa/  # Fluxo de Caixa
│   │   ├── impostos/     # Impostos & Tributação
│   │   ├── projecoes/    # Projeções 2035
│   │   ├── kpis/         # Dashboard KPIs
│   │   ├── viabilidade/  # Análise de Viabilidade
│   │   ├── valuation/    # Valuation
│   │   └── layout.tsx    # Layout do dashboard
│   ├── globals.css       # Estilos globais
│   └── layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI base
│   ├── charts/           # Componentes de gráficos
│   ├── forms/            # Componentes de formulário
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks
│   ├── useFinancialCalculations.ts
│   └── useExport.ts
├── stores/               # Estado global (Zustand)
│   └── useAppStore.ts
├── types/                # Definições TypeScript
│   └── index.ts
├── utils/                # Utilitários financeiros
│   ├── financial-calculations.ts
│   ├── format.ts
│   └── export.ts
└── lib/                  # Bibliotecas e configurações
    └── constants.ts
```

## 🎯 Funcionalidades Principais

### 1. Dashboard Principal
- Visão geral do projeto
- Métricas principais (ROI, Payback, Margem EBITDA)
- Características do mercado selecionado
- Ações rápidas para navegação

### 2. DRE Gerencial
- Demonstração do Resultado do Exercício completa
- Projeções anuais detalhadas
- Gráficos de receitas, custos e lucros
- Análise de margem e rentabilidade

### 3. Análise de Viabilidade
- Cálculo de NPV, IRR, ROI e Payback
- Análise de sensibilidade univariada
- Simulação Monte Carlo
- Cenários otimista, realista e pessimista

### 4. Projeções Financeiras
- Projeções até 2035
- Consideração de sazonalidade
- Múltiplos cenários de crescimento
- Análise de tendências

### 5. Capital de Giro
- Necessidades de capital circulante
- Ciclo de conversão de caixa
- Gestão de fluxo de caixa

### 6. KPIs e Dashboards
- Indicadores-chave de performance
- Comparação com benchmarks da indústria
- Alertas e notificações
- Metas e acompanhamento

### 7. Exportação de Dados
- Relatórios em Excel com múltiplas abas
- PDFs formatados profissionalmente
- Gráficos e tabelas exportáveis

## 🌍 Configurações de Mercado

O sistema suporta três mercados principais:

### Brasil 🇧🇷
- Moeda: Real (R$)
- Taxa de imposto: 16.3% (Simples Nacional + ISS)
- Inflação: 6.5% ao ano
- Taxa de desconto: 12% (Selic + risco)
- Encargos trabalhistas: 70%

### Europa 🇪🇺
- Moeda: Euro (€)
- Taxa de imposto: 25% (Corporate tax médio)
- Inflação: 3% ao ano
- Taxa de desconto: 8%
- Encargos sociais: 45%

### Emirados Árabes 🇦🇪
- Moeda: Dirham (AED)
- Taxa de imposto: 5% (VAT)
- Inflação: 2% ao ano
- Taxa de desconto: 6%
- Encargos trabalhistas: 15%

## 📊 Métricas e Cálculos

### Indicadores Financeiros
- **NPV (Valor Presente Líquido)**: Valor atual dos fluxos de caixa futuros
- **IRR (Taxa Interna de Retorno)**: Taxa que zera o NPV
- **ROI (Retorno sobre Investimento)**: Percentual de retorno do capital
- **Payback**: Tempo para recuperar o investimento inicial
- **Break-even**: Ponto de equilíbrio operacional

### Análises Avançadas
- **Simulação Monte Carlo**: Análise probabilística de cenários
- **Análise de Sensibilidade**: Impacto de variações nos parâmetros
- **DCF Valuation**: Avaliação por fluxo de caixa descontado
- **Múltiplos de Mercado**: Comparação com benchmarks

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia versão de produção
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas de lint automaticamente
npm run type-check   # Verifica tipos TypeScript
npm run test         # Executa testes
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
```

### Configuração do Editor

#### VS Code (Recomendado)
Instale as extensões:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Hero
- Prettier - Code formatter
- ESLint

#### Configurações recomendadas (`.vscode/settings.json`):
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

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros Provedores

- **Netlify**: Suporte nativo para Next.js
- **Railway**: Deploy com PostgreSQL
- **DigitalOcean App Platform**: Infraestrutura escalável
- **AWS Amplify**: Integração com serviços AWS

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudanças funcionais
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## 📞 Suporte

- **Documentação**: [docs.club-finance-pilot.com](https://docs.club-finance-pilot.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/club-finance-pilot/issues)
- **Discussões**: [GitHub Discussions](https://github.com/your-org/club-finance-pilot/discussions)
- **Email**: support@club-finance-pilot.com

## 🎉 Créditos

Desenvolvido com ❤️ por [Club Finance Pilot Team](https://github.com/your-org)

### Sistema Enterprise React/Next.js
- Análises financeiras robustas
- Cálculos validados pela indústria
- Interface moderna e responsiva
- Performance otimizada

---

**Disclaimer**: Este sistema é uma ferramenta de apoio à decisão. Consulte sempre um profissional qualificado para validação das análises financeiras. 
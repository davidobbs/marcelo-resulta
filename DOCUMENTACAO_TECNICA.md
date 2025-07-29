# Documentação Técnica - Sistema de Análise de Investimento em Clubes de Futebol

## Visão Geral

O ClubFinancePilot foi expandido para oferecer uma análise profissional e completa de viabilidade de investimento em clubes de futebol, incluindo:

- ✅ **Entrada de dados estratégicos detalhados (Ano 0)**
- ✅ **Análise financeira avançada com fórmulas específicas**
- ✅ **KPIs estratégicos especializados**
- ✅ **Análise de sensibilidade e Monte Carlo**
- ✅ **Sistema de campos customizáveis**
- ✅ **Dashboard executivo com métricas estratégicas**

## Arquitetura e Estrutura

### Novos Tipos de Dados (src/types/index.ts)

#### 1. Dados Estratégicos Iniciais
```typescript
interface StrategicInputData {
  clubInfo: ClubBasicInfo;           // Informações básicas do clube
  infrastructure: ClubInfrastructure; // Infraestrutura física
  initialFinancials: InitialFinancialData; // Dados financeiros iniciais
  marketStrategy: MarketStrategy;     // Estratégia de mercado
  humanResources: HumanResourcesData; // Recursos humanos
  compliance: ComplianceData;         // Compliance e regulamentação
}
```

#### 2. Infraestrutura Detalhada
```typescript
interface FootballField {
  id: string;
  name: string;
  type: 'Society 5x5' | 'Society 7x7' | 'Futsal' | 'Campo 11x11' | 'Campo Reduzido';
  dimensions: { length: number; width: number };
  surfaceType: 'Grama Natural' | 'Grama Sintética' | 'Quadra' | 'Saibro';
  lighting: boolean;
  covered: boolean;
  capacity: number;
  hourlyRate: number;
  maintenanceCost: number;
  utilizationRate: number;
}
```

#### 3. Receitas Expandidas
```typescript
interface DetailedRevenue {
  fieldRental: FieldRentalRevenue;     // Aluguel de campos
  membership: MembershipRevenue;       // Mensalidades
  soccerSchool: SoccerSchoolRevenue;   // Escolinha
  sponsorship: SponsorshipRevenue;     // Patrocínios
  merchandise: MerchandiseRevenue;     // Merchandising
  events: EventsRevenue;               // Eventos
  foodBeverage: FoodBeverageRevenue;   // Alimentação
  broadcastRights?: BroadcastRevenue;  // Direitos de transmissão
  playerTransfers?: PlayerTransferRevenue; // Transferências
  other: OtherRevenue[];               // Outras receitas
  total: number;
}
```

#### 4. KPIs Estratégicos
```typescript
interface StrategicKPIs {
  financial: FinancialKPIs;           // KPIs financeiros
  operational: OperationalKPIs;       // KPIs operacionais
  customer: CustomerKPIs;             // KPIs de clientes
  growth: GrowthKPIs;                 // KPIs de crescimento
  sustainability: SustainabilityKPIs; // KPIs de sustentabilidade
}
```

### Funções de Cálculo Avançadas (src/utils/financial-calculations.ts)

#### 1. Receita de Campos
```typescript
export function calculateFieldRentalRevenue(
  fields: FootballField[],
  market: Market,
  seasonalFactors: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
): { monthly: number; annual: number; byField: Record<string, number> }
```

**Fórmula:**
- Horas disponíveis/mês = Horas/dia × 30 dias
- Horas utilizadas/mês = Horas disponíveis × Taxa de utilização
- Receita mensal = Horas utilizadas × Valor/hora
- Receita anual = Σ(Receita mensal × Fator sazonal)

#### 2. Custos Operacionais Detalhados
```typescript
export function calculateDetailedOperationalCosts(
  fields: FootballField[],
  staff: StaffMember[],
  market: Market,
  facilities: any[] = [],
  year: number = 1
): DetailedOperationalCosts
```

**Componentes de Custo:**
- **Pessoal:** Salários + Encargos (70%) + Benefícios (15%) + Treinamento + Recrutamento
- **Instalações:** Manutenção + Limpeza + Segurança + Paisagismo + Reparos
- **Utilidades:** Energia + Água + Gás + Internet + Telefone + Resíduos
- **Seguros:** Patrimonial + Responsabilidade + Equipamentos + Trabalhista
- **Marketing:** Digital + Mídia tradicional + Eventos + Materiais
- **Administrativo:** Contabilidade + Jurídico + Consultoria + Software

#### 3. Análise de Sensibilidade Avançada
```typescript
export function enhancedSensitivityAnalysis(
  baseCase: Record<string, number>,
  variables: Record<string, number>,
  changeRange: number = 0.2
): EnhancedSensitivityAnalysis
```

**Inclui:**
- Gráfico Tornado (impacto das variáveis no VPL)
- Gráfico Spider (sensibilidade multivariada)
- Simulação Monte Carlo com estatísticas

#### 4. Análise Monte Carlo
```typescript
export function advancedMonteCarloAnalysis(
  baseScenario: Record<string, number>,
  uncertainties: Record<string, number>,
  numSimulations: number = 10000
): MonteCarloAnalysis
```

**Estatísticas Calculadas:**
- Média, Mediana, Desvio Padrão
- Percentis (P5, P25, P75, P95)
- Probabilidade de VPL > 0

## Páginas Implementadas

### 1. Dados Estratégicos (/dashboard/strategic-data)

**Funcionalidades:**
- Entrada de dados básicos do clube
- Configuração detalhada dos campos
- Dados financeiros iniciais
- Estrutura de recursos humanos
- Compliance e licenças

**Fórmulas de Validação:**
- Investimento total = Σ(todos os investimentos)
- Folha mensal = Σ(salários) × (1 + encargos)

### 2. Análise Estratégica (/dashboard/strategic-analysis)

**Componentes:**
- Dashboard executivo
- KPIs estratégicos por categoria
- Análise de sensibilidade (Tornado Chart)
- Gestão de riscos
- Simulações Monte Carlo

**KPIs Calculados:**

#### Financeiros:
- **Margem de Lucro:** (Receita - Custos) / Receita
- **ROA:** Lucro Líquido / Ativos
- **ROE:** Lucro Líquido / Patrimônio
- **Debt/Equity:** Passivos / Patrimônio

#### Operacionais:
- **Taxa de Utilização:** Média das taxas de ocupação dos campos
- **Receita por Campo:** Receita total / Número de campos
- **Produtividade:** Receita / Custos de pessoal

#### Clientes:
- **ARPU:** Receita / Número de clientes
- **Churn Rate:** Taxa de cancelamento mensal
- **NPS:** Net Promoter Score

### 3. Campos Customizáveis (/dashboard/custom-fields)

**Funcionalidades:**
- Criação de campos personalizados
- Tipos suportados: texto, número, moeda, percentual, data, booleano
- Categorias: receita, custo, ativo, passivo, KPI, outros
- Fórmulas calculadas automaticamente
- Validação de dados
- Importação/exportação

**Exemplo de Campo Calculado:**
```typescript
{
  name: 'energyCostPerField',
  label: 'Custo de Energia por Campo',
  formula: 'totalEnergyCost / numberOfFields',
  dependencies: ['totalEnergyCost', 'numberOfFields']
}
```

## Fórmulas Financeiras Implementadas

### 1. Valuation

#### VPL (Valor Presente Líquido)
```
VPL = Σ[FCt / (1 + r)^t]
onde:
- FCt = Fluxo de caixa no período t
- r = Taxa de desconto
- t = Período
```

#### TIR (Taxa Interna de Retorno)
```
0 = Σ[FCt / (1 + TIR)^t]
Resolvido por Newton-Raphson
```

#### DCF (Discounted Cash Flow)
```
Valor da Empresa = VP(Fluxos Explícitos) + VP(Valor Terminal)
Valor Terminal = FC_terminal × (1 + g) / (r - g)
```

### 2. Métricas Operacionais

#### Receita de Campos
```
Receita Anual = Σ[Horas/dia × 30 × Taxa_utilização × Valor/hora × Fator_sazonal]
```

#### Ponto de Equilíbrio
```
Break-even = Custos Fixos / (Preço Unitário - Custo Variável Unitário)
```

#### Payback Period
```
Payback = n + (Investimento - Σ FC(1 a n)) / FC(n+1)
```

### 3. Análise de Risco

#### Value at Risk (VaR)
```
VaR = Percentil(distribuição_retornos, nível_confiança)
```

#### Análise de Sensibilidade
```
Sensibilidade = (VPL_novo - VPL_base) / (Variável_nova - Variável_base)
```

## Benchmarks da Indústria

### Brasil
- Receita média por campo: R$ 150.000/ano
- Margem de lucro média: 15%
- Taxa de ocupação média: 60%
- Payback esperado: 3,5 anos
- ROI esperado: 25%

### Europa
- Receita média por campo: € 85.000/ano
- Margem de lucro média: 18%
- Taxa de ocupação média: 70%
- Payback esperado: 4,0 anos
- ROI esperado: 20%

### Emirados Árabes
- Receita média por campo: AED 220.000/ano
- Margem de lucro média: 22%
- Taxa de ocupação média: 75%
- Payback esperado: 3,0 anos
- ROI esperado: 30%

## Modelos de Receita

### 1. Aluguel de Campos
- Preços por hora variáveis (manhã/tarde/noite)
- Fatores sazonais (verão/inverno)
- Descontos por volume
- Eventos corporativos

### 2. Mensalidades
- Planos básico/premium/VIP
- Membros corporativos
- Horas incluídas
- Benefícios adicionais

### 3. Escolinha de Futebol
- Mensalidades por categoria (infantil/juvenil/adulto)
- Taxa de matrícula
- Camps e clínicas
- Aulas particulares

### 4. Patrocínios
- Patrocínio master
- Naming rights
- Patrocínio de uniformes
- Patrocínio digital

## Gestão de Riscos

### Riscos Identificados

#### Financeiros
- Fluxo de caixa insuficiente
- Inadimplência de clientes
- Variação cambial (equipamentos importados)
- Inflação de custos operacionais

#### Operacionais
- Baixa taxa de ocupação
- Problemas de manutenção
- Falta de pessoal qualificado
- Condições climáticas adversas

#### Estratégicos
- Entrada de novos concorrentes
- Mudanças no mercado
- Obsolescência de instalações
- Perda de patrocinadores

#### Regulatórios
- Mudanças na legislação
- Licenças e alvarás
- Questões trabalhistas
- Normas de segurança

### Estratégias de Mitigação

1. **Diversificação de receitas**
2. **Reserva de contingência (6 meses)**
3. **Seguro abrangente**
4. **Contratos de longo prazo**
5. **Monitoramento contínuo**

## Tecnologias Utilizadas

### Frontend
- **Next.js 14** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **Lucide React** para ícones

### Estrutura de Arquivos
```
src/
├── app/dashboard/
│   ├── strategic-data/      # Entrada de dados Ano 0
│   ├── strategic-analysis/  # Análise estratégica avançada
│   └── custom-fields/       # Campos customizáveis
├── types/index.ts          # Tipos TypeScript expandidos
├── utils/
│   └── financial-calculations.ts # Cálculos financeiros
└── stores/useAppStore.ts   # Estado global
```

### Padrões de Desenvolvimento

1. **Separação de responsabilidades**
2. **Componentes reutilizáveis**
3. **Tipagem forte com TypeScript**
4. **Validação de dados**
5. **Tratamento de erros**
6. **Performance otimizada**

## Como Usar o Sistema

### 1. Configuração Inicial
1. Acesse `/dashboard/strategic-data`
2. Preencha os dados básicos do clube
3. Configure os campos e instalações
4. Defina investimentos iniciais
5. Configure a equipe

### 2. Análise Estratégica
1. Acesse `/dashboard/strategic-analysis`
2. Execute a análise automática
3. Revise os KPIs por categoria
4. Analise a sensibilidade das variáveis
5. Avalie os riscos identificados

### 3. Campos Customizados
1. Acesse `/dashboard/custom-fields`
2. Crie campos específicos do negócio
3. Defina fórmulas de cálculo
4. Configure validações
5. Organize por categorias

### 4. Interpretação dos Resultados

#### VPL Positivo (> R$ 0)
- ✅ Projeto adiciona valor
- ✅ Investimento recomendado

#### TIR > Taxa de Desconto
- ✅ Retorno superior ao mínimo exigido
- ✅ Projeto atrativo

#### Payback < 4 anos
- ✅ Recuperação rápida do investimento
- ✅ Menor risco

#### Probabilidade VPL > 0 > 70%
- ✅ Alta probabilidade de sucesso
- ✅ Risco controlado

## Expansões Futuras

### Funcionalidades Planejadas
1. **Integração com APIs** de dados de mercado
2. **Dashboard mobile** responsivo
3. **Relatórios automatizados** em PDF
4. **Módulo de cash flow** mensal
5. **Análise comparativa** entre clubes
6. **Machine Learning** para previsões

### Melhorias Técnicas
1. **Testes automatizados** (Jest/Cypress)
2. **CI/CD pipeline** completo
3. **Monitoramento** de performance
4. **Backup** automático de dados
5. **Multi-tenancy** para múltiplos clubes

## Conclusão

O sistema foi desenvolvido para fornecer uma análise profissional e abrangente de investimentos em clubes de futebol, com:

- **Dados estratégicos detalhados** para análise precisa
- **Fórmulas financeiras específicas** da indústria
- **KPIs estratégicos especializados** para gestão
- **Análises probabilísticas** para tomada de decisão
- **Flexibilidade total** com campos customizáveis

A plataforma permite uma avaliação completa da viabilidade do investimento, identificação de riscos e oportunidades, e acompanhamento contínuo da performance do negócio. 
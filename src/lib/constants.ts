import type { Market } from '@/types';

// Novas interfaces para tipagem
interface IndustryBenchmark {
  avgRevenuePerField: number;
  avgProfitMargin: number;
  avgOccupancy: number;
  paybackPeriod: number;
  roiExpected: number;
}

interface InvestmentCost {
  fieldConstruction: number;
  equipment: number;
  facilitySetup: number;
  workingCapital: number;
  licensing: number;
}

// Configurações de mercado (convertidas do Python)
export const MARKETS: Record<string, Market> = {
  Brasil: {
    name: 'Brasil',
    currency: 'R$',
    taxRate: 0.163, // Simples Nacional + ISS aproximado
    inflationRate: 0.065, // 6.5% ao ano
    discountRate: 0.12, // Taxa Selic + risco
    avgHourlyRate: 80.0, // Preço médio por hora de quadra
    expectedOccupancy: 0.65, // 65% de ocupação esperada
    hoursPerDay: 12, // Horário de funcionamento
    daysPerWeek: 7,
    salaryBurden: 0.70, // Encargos trabalhistas (70% sobre salário)
    rentPerSqm: 25.0, // Aluguel por m² mensal
    utilityCostFactor: 0.08, // 8% da receita em custos de utilities
    maintenanceFactor: 0.05, // 5% da receita em manutenção
    marketingFactor: 0.03, // 3% da receita em marketing
    workingCapitalDays: 30, // Dias de capital de giro
    depreciationRate: 0.10, // 10% ao ano para equipamentos
    corporateTax: 0.25, // Imposto de renda pessoa jurídica
    socialContribution: 0.09, // CSLL
    pisCofins: 0.0365, // PIS/COFINS sobre faturamento
    issRate: 0.05, // ISS sobre serviços
    vatRate: 0, // Não aplicável diretamente no Simples Nacional
    socialSecurity: 0.20, // INSS
    growthPotential: 0.15, // Potencial de crescimento anual
    marketSizeFactor: 1.0, // Fator de tamanho de mercado (base)
    competitionLevel: 'Alto',
    regulatoryComplexity: 'Alta',
  },
  Europa: {
    name: 'Europa',
    currency: '€',
    taxRate: 0.25, // Corporate tax médio europeu
    inflationRate: 0.03, // 3% ao ano
    discountRate: 0.08, // Taxa de juros européia + risco
    avgHourlyRate: 45.0, // Preço médio por hora em euros
    expectedOccupancy: 0.75, // Maior ocupação esperada
    hoursPerDay: 14, // Horário estendido
    daysPerWeek: 7,
    salaryBurden: 0.45, // Encargos sociais europeus
    rentPerSqm: 18.0, // Aluguel por m² mensal
    utilityCostFactor: 0.12, // Custos de energia mais altos
    maintenanceFactor: 0.06, // Manutenção mais cara
    marketingFactor: 0.04, // Marketing mais caro
    workingCapitalDays: 45, // Mais dias de capital de giro
    depreciationRate: 0.08, // Depreciação mais conservadora
    corporateTax: 0.25,
    vatRate: 0.20, // IVA médio
    socialSecurity: 0.15, // Contribuições sociais
    socialContribution: 0, // Não aplicável
    pisCofins: 0, // Não aplicável
    issRate: 0, // Não aplicável
    growthPotential: 0.08, // Crescimento mais moderado
    marketSizeFactor: 2.5, // Mercado maior
    competitionLevel: 'Médio',
    regulatoryComplexity: 'Média',
  },
  'Emirados Árabes': {
    name: 'Emirados Árabes',
    currency: 'AED',
    taxRate: 0.05, // VAT nos Emirados
    inflationRate: 0.02, // Inflação baixa
    discountRate: 0.06, // Taxa de juros baixa
    avgHourlyRate: 180.0, // Preço premium em AED
    expectedOccupancy: 0.80, // Alta ocupação esperada
    hoursPerDay: 16, // Funcionamento estendido
    daysPerWeek: 7,
    salaryBurden: 0.15, // Baixos encargos trabalhistas
    rentPerSqm: 35.0, // Aluguel premium
    utilityCostFactor: 0.15, // Ar condicionado custoso
    maintenanceFactor: 0.08, // Manutenção em clima árido
    marketingFactor: 0.05, // Marketing premium
    workingCapitalDays: 60, // Ciclo de pagamento mais longo
    depreciationRate: 0.12, // Depreciação acelerada pelo clima
    corporateTax: 0.09, // Imposto corporativo recentemente introduzido
    vatRate: 0.05, // VAT
    socialSecurity: 0, // Não aplicável
    socialContribution: 0, // Não aplicável
    pisCofins: 0, // Não aplicável
    issRate: 0, // Não aplicável
    growthPotential: 0.12, // Alto potencial de crescimento
    marketSizeFactor: 1.8, // Mercado em crescimento
    competitionLevel: 'Baixo', // Mercado em desenvolvimento
    regulatoryComplexity: 'Baixa',
  },
};

// Tipos de quadra disponíveis
export const FIELD_TYPES = [
  'Society 5x5',
  'Society 7x7',
  'Futsal',
  'Campo 11x11',
] as const;

// Fatores de sazonalidade por mercado (12 meses)
export const SEASONAL_FACTORS: Record<string, number[]> = {
  Brasil: [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0], // Verão forte
  Europa: [0.6, 0.7, 0.9, 1.1, 1.3, 1.4, 1.2, 1.1, 1.0, 0.9, 0.7, 0.6], // Verão europeu
  'Emirados Árabes': [1.1, 1.2, 1.3, 1.1, 0.8, 0.6, 0.5, 0.6, 0.9, 1.2, 1.3, 1.1], // Evita verão extremo
};

// Benchmarks da indústria por mercado
export const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  Brasil: {
    avgRevenuePerField: 150000, // R$ por quadra/ano
    avgProfitMargin: 0.15,
    avgOccupancy: 0.60,
    paybackPeriod: 3.5, // anos
    roiExpected: 0.25,
  },
  Europa: {
    avgRevenuePerField: 85000, // € por quadra/ano
    avgProfitMargin: 0.18,
    avgOccupancy: 0.70,
    paybackPeriod: 4.0,
    roiExpected: 0.20,
  },
  'Emirados Árabes': {
    avgRevenuePerField: 220000, // AED por quadra/ano
    avgProfitMargin: 0.22,
    avgOccupancy: 0.75,
    paybackPeriod: 3.0,
    roiExpected: 0.30,
  },
};

// Custos de investimento base por mercado
export const INVESTMENT_COSTS: Record<string, InvestmentCost> = {
  Brasil: {
    fieldConstruction: 120000, // R$ por quadra
    equipment: 25000, // Equipamentos por quadra
    facilitySetup: 80000, // Vestiários, recepção, etc.
    workingCapital: 50000, // Capital de giro inicial
    licensing: 15000, // Licenças e documentação
  },
  Europa: {
    fieldConstruction: 75000, // € por quadra
    equipment: 18000,
    facilitySetup: 55000,
    workingCapital: 35000,
    licensing: 12000,
  },
  'Emirados Árabes': {
    fieldConstruction: 180000, // AED por quadra
    equipment: 35000,
    facilitySetup: 120000,
    workingCapital: 80000,
    licensing: 25000,
  },
};

// Configurações de formatação
export const FORMAT_CONFIG = {
  currency: {
    'R$': { locale: 'pt-BR', currency: 'BRL' },
    '€': { locale: 'de-DE', currency: 'EUR' },
    'AED': { locale: 'ar-AE', currency: 'AED' },
  },
  number: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  percentage: {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
};

// Cores do tema
export const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

// Configurações de gráficos
export const CHART_CONFIG = {
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  },
  colors: {
    revenue: '#22c55e',
    costs: '#ef4444',
    profit: '#3b82f6',
    cashFlow: '#06b6d4',
    assets: '#8b5cf6',
    liabilities: '#f59e0b',
  },
};

// Configurações de validação
export const VALIDATION_RULES = {
  clubName: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  numFields: {
    min: 1,
    max: 50,
    required: true,
  },
  hourlyRate: {
    min: 10,
    max: 1000,
    required: true,
  },
  occupancy: {
    min: 0.1,
    max: 1.0,
    required: true,
  },
  projectionYears: {
    min: 1,
    max: 20,
    required: true,
  },
};

// Configurações de exportação
export const EXPORT_CONFIG = {
  excel: {
    maxRows: 10000,
    maxColumns: 50,
    defaultSheetName: 'Análise Financeira',
  },
  pdf: {
    format: 'A4',
    margin: 20,
    fontSize: 12,
  },
};

// Mensagens do sistema
export const MESSAGES = {
  errors: {
    generic: 'Ocorreu um erro inesperado. Tente novamente.',
    validation: 'Por favor, verifique os dados informados.',
    network: 'Erro de conexão. Verifique sua internet.',
    calculation: 'Erro nos cálculos financeiros.',
    export: 'Erro ao exportar os dados.',
  },
  success: {
    saved: 'Dados salvos com sucesso!',
    exported: 'Dados exportados com sucesso!',
    calculated: 'Cálculos realizados com sucesso!',
  },
  warnings: {
    unsavedChanges: 'Há alterações não salvas. Deseja continuar?',
    lowOccupancy: 'Taxa de ocupação baixa pode afetar a viabilidade.',
    highInvestment: 'Investimento elevado. Revise os valores.',
  },
};

// URLs e endpoints (para futuras integrações)
export const API_ENDPOINTS = {
  base: typeof window !== 'undefined' ? 'http://localhost:3000/api' : 'http://localhost:3000/api',
  markets: '/markets',
  calculations: '/calculations',
  export: '/export',
  reports: '/reports',
};

// Configurações locais
export const LOCAL_STORAGE_KEYS = {
  clubData: 'club-finance-pilot:club-data',
  userPreferences: 'club-finance-pilot:user-preferences',
  calculations: 'club-finance-pilot:calculations',
  theme: 'club-finance-pilot:theme',
};
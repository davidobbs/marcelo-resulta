// @ts-nocheck
import type {
  Market,
  FootballField,
  StaffMember,
  ValuationMetrics,
  ComprehensiveViabilityAnalysis,
} from '@/types';
import { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateROI } from './metrics';
import { calculateDCFValuation } from './valuation';
import { calculateFieldRentalRevenue, calculateDetailedOperationalCosts } from './club-specific';
import { generateCashFlows } from './helpers';
import { enhancedSensitivityAnalysis } from './simulations';

/**
 * Calcula métricas de viabilidade completas
 */
export function calculateViabilityMetrics(
  cashFlows: number[],
  discountRate: number,
  terminalGrowthRate = 0.02
): ValuationMetrics {
  const npv = calculateNPV(cashFlows, discountRate);
  const irr = calculateIRR(cashFlows);
  const paybackPeriod = calculatePaybackPeriod(cashFlows);
  const roi = calculateROI(Math.abs(cashFlows[0]), cashFlows.slice(1).reduce((a, b) => a + b, 0));
  
  // Calcula break-even simplificado (em anos)
  let breakEvenPoint = 0;
  let cumulative = cashFlows[0]; // Investimento inicial
  for (let i = 1; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      breakEvenPoint = i;
      break;
    }
  }
  
  const dcf = calculateDCFValuation(cashFlows, terminalGrowthRate, discountRate);
  
  return {
    npv,
    irr: irr || 0,
    roi,
    paybackPeriod: paybackPeriod || 0,
    breakEvenPoint,
    enterpriseValue: dcf.enterpriseValue,
    terminalValue: dcf.pvTerminal,
  };
}

/**
 * Análise de viabilidade abrangente específica para clubes de futebol
 */
export function comprehensiveFootballClubAnalysis(
  fields: FootballField[],
  staff: StaffMember[],
  market: Market,
  initialInvestment: number,
  projectionYears: number = 12
): ComprehensiveViabilityAnalysis {
  // Calcular receitas e custos detalhados
  const fieldRevenue = calculateFieldRentalRevenue(fields, market);
  const operationalCosts = calculateDetailedOperationalCosts(fields, staff, market);
  
  // Receita total anual (simplificada)
  const annualRevenue = fieldRevenue.annual + 50000; // + outras receitas estimadas
  const annualCosts = operationalCosts.total;
  
  // Gerar fluxos de caixa
  const scenario = {
    years: projectionYears,
    initialInvestment,
    annualRevenue,
    annualCosts,
    growthRate: market.growthPotential,
    discountRate: market.discountRate
  };
  
  const cashFlows = generateCashFlows(scenario);
  
  // Análise financeira
  const financialViability = {
    npv: calculateNPV(cashFlows, market.discountRate),
    irr: calculateIRR(cashFlows) || 0,
    paybackPeriod: calculatePaybackPeriod(cashFlows) || 0,
    profitabilityIndex: calculateNPV(cashFlows, market.discountRate) / initialInvestment,
    modifiedIRR: calculateIRR(cashFlows) || 0, // Simplificado
    discountedPayback: calculatePaybackPeriod(cashFlows) || 0, // Simplificado
    valueAtRisk: calculateNPV(cashFlows, market.discountRate) * 0.1, // 10% do NPV
    expectedValue: calculateNPV(cashFlows, market.discountRate)
  };
  
  // Análise de mercado
  const marketViability = {
    marketSize: 1000000, // Estimativa
    marketGrowthRate: market.growthPotential,
    competitivPosition: 'Seguidor' as const,
    marketShareProjection: 0.05,
    customerDemandForecast: [
      { period: 'Ano 1', demandLevel: 'Média' as const, estimatedVolume: 500, confidence: 0.8 },
      { period: 'Ano 2', demandLevel: 'Alta' as const, estimatedVolume: 650, confidence: 0.7 },
      { period: 'Ano 3', demandLevel: 'Alta' as const, estimatedVolume: 800, confidence: 0.6 }
    ],
    competitivePressure: market.competitionLevel as 'Baixa' | 'Média' | 'Alta'
  };
  
  // Análise operacional
  const operationalViability = {
    locationScore: 8.0,
    infrastructureScore: 7.5,
    staffingScore: 8.5,
    operationalEfficiency: 0.75,
    scalabilityScore: 7.0,
    overallScore: 7.8
  };
  
  // Análise estratégica
  const strategicViability = {
    competitiveAdvantage: ['Localização privilegiada', 'Infraestrutura moderna', 'Equipe qualificada'],
    marketPosition: 'Novo entrante com diferencial',
    swotAnalysis: {
      strengths: ['Investimento em infraestrutura', 'Equipe experiente'],
      weaknesses: ['Marca nova', 'Capital limitado'],
      opportunities: ['Mercado em crescimento', 'Demanda reprimida'],
      threats: ['Concorrência estabelecida', 'Regulamentação']
    },
    strategicFit: 8.0,
    longTermSustainability: 7.5
  };
  
  // Análise de riscos
  const riskAnalysis = {
    risks: [
      {
        id: '1',
        category: 'Financeiro' as const,
        description: 'Fluxo de caixa insuficiente nos primeiros anos',
        probability: 0.3,
        impact: 0.8,
        riskScore: 0.24,
        timeframe: 'Curto Prazo' as const
      },
      {
        id: '2',
        category: 'Operacional' as const,
        description: 'Baixa taxa de ocupação dos campos',
        probability: 0.4,
        impact: 0.6,
        riskScore: 0.24,
        timeframe: 'Médio Prazo' as const
      }
    ],
    overallRiskLevel: 'Médio' as const,
    mitigationStrategies: [
      {
        riskId: '1',
        strategy: 'Manter reserva de caixa para 6 meses',
        cost: 50000,
        effectiveness: 0.8,
        timeframe: 'Imediato'
      }
    ],
    contingencyPlans: [
      {
        trigger: 'Receita 20% abaixo do previsto',
        actions: ['Reduzir custos variáveis', 'Intensificar marketing'],
        resources: 20000,
        responsibleParty: 'Administração'
      }
    ]
  };
  
  // Análise de sensibilidade avançada
  const variables = {
    utilizationRate: 0.65,
    hourlyRate: 80,
    growthRate: market.growthPotential,
    operationalCosts: annualCosts
  };
  
  const sensitivityAnalysis = enhancedSensitivityAnalysis(scenario, variables, 0.2);
  
  return {
    financialViability,
    marketViability,
    operationalViability,
    strategicViability,
    riskAnalysis,
    sensitivityAnalysis
  };
} 
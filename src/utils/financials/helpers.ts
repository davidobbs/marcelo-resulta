import type { Market, InvestmentBreakdown } from '@/types';

/**
 * Projeta receita com crescimento e sazonalidade
 */
export function projectRevenue(
  baseRevenue: number,
  growthRate: number,
  years: number,
  seasonalityFactors?: number[]
): number[][] | number[] {
  const projections: number[][] | number[] = [];
  
  for (let year = 0; year < years; year++) {
    const annualBase = baseRevenue * Math.pow(1 + growthRate, year);
    
    if (seasonalityFactors && seasonalityFactors.length === 12) {
      const monthlyRevenues = seasonalityFactors.map(factor => 
        annualBase * factor / 12
      );
      (projections as number[][]).push(monthlyRevenues);
    } else {
      (projections as number[]).push(annualBase);
    }
  }
  
  return projections;
}

/**
 * Calcula depreciação
 */
export function calculateDepreciation(
  assetValue: number,
  usefulLife: number,
  method: 'straight_line' | 'declining_balance' = 'straight_line'
): number {
  if (method === 'straight_line') {
    return assetValue / usefulLife;
  } else if (method === 'declining_balance') {
    const rate = 2 / usefulLife;
    return assetValue * rate;
  }
  return assetValue / usefulLife;
}

/**
 * Calcula carga tributária baseada na configuração do mercado
 */
export function calculateTaxBurden(revenue: number, profit: number, market: Market) {
  const taxes: Record<string, number> = {};
  
  if (market.name === 'Brasil') {
    taxes.simplesNacional = revenue * 0.08; // Aproximação Simples Nacional
    taxes.iss = revenue * (market.issRate || 0.05);
    taxes.pisCofins = revenue * (market.pisCofins || 0.0365);
    taxes.irpj = profit > 0 ? profit * market.corporateTax : 0;
    taxes.csll = profit > 0 ? profit * (market.socialContribution || 0.09) : 0;
  } else if (market.name === 'Europa') {
    taxes.vat = revenue * (market.vatRate || 0.20);
    taxes.corporateTax = profit > 0 ? profit * market.corporateTax : 0;
    taxes.socialSecurity = revenue * (market.socialSecurity || 0.15);
  } else if (market.name === 'Emirados Árabes') {
    taxes.vat = revenue * (market.vatRate || 0.05);
    taxes.corporateTax = profit > 0 ? profit * market.corporateTax : 0;
  }
  
  taxes.total = Object.values(taxes).reduce((sum: number, tax: number) => sum + tax, 0);
  return taxes;
}

/**
 * Gera fluxos de caixa baseado no cenário
 */
export function generateCashFlows(scenario: Record<string, number>): number[] {
  const years = scenario.years || 12;
  const initialInvestment = scenario.initialInvestment || 0;
  const annualRevenue = scenario.annualRevenue || 0;
  const annualCosts = scenario.annualCosts || 0;
  const growthRate = scenario.growthRate || 0.05;
  
  const cashFlows = [-initialInvestment]; // Investimento inicial negativo
  
  for (let year = 1; year <= years; year++) {
    const revenue = annualRevenue * Math.pow(1 + growthRate, year - 1);
    const costs = annualCosts * Math.pow(1 + growthRate * 0.8, year - 1); // Custos crescem menos
    const netCashFlow = revenue - costs;
    cashFlows.push(netCashFlow);
  }
  
  return cashFlows;
}

/**
 * Calcula pagamento de empréstimo (PMT)
 */
export function calculateLoanPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

/**
 * Calcula investimentos necessários por mercado
 */
export function calculateInvestmentRequirements(
  market: Market,
  numFields: number
): InvestmentBreakdown {
  const baseCosts = {
    Brasil: {
      fieldConstruction: 120000,
      equipment: 25000,
      facilitySetup: 80000,
      workingCapital: 50000,
      licensing: 15000,
    },
    Europa: {
      fieldConstruction: 75000,
      equipment: 18000,
      facilitySetup: 55000,
      workingCapital: 35000,
      licensing: 12000,
    },
    'Emirados Árabes': {
      fieldConstruction: 180000,
      equipment: 35000,
      facilitySetup: 120000,
      workingCapital: 80000,
      licensing: 25000,
    },
  };
  
  const costs = baseCosts[market.name as keyof typeof baseCosts] || baseCosts.Brasil;
  
  const fieldConstruction = costs.fieldConstruction * numFields;
  const equipment = costs.equipment * numFields;
  const facilityCosts = costs.facilitySetup;
  const workingCapital = costs.workingCapital;
  const licensing = costs.licensing;
  
  const total = fieldConstruction + equipment + facilityCosts + workingCapital + licensing;
  
  return {
    construction: fieldConstruction,
    equipment,
    licenses: licensing,
    workingCapital,
    marketing: facilityCosts,
    other: 0,
    total
};
} 
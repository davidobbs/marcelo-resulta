/**
 * Calcula o Valor Presente Líquido (VPL/NPV)
 */
export function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((npv, cashFlow, index) => {
    return npv + cashFlow / Math.pow(1 + discountRate, index);
  }, 0);
}

/**
 * Calcula a Taxa Interna de Retorno (TIR/IRR) usando método de Newton-Raphson
 */
export function calculateIRR(
  cashFlows: number[],
  guess = 0.1,
  maxIterations = 1000,
  tolerance = 1e-6
): number | null {
  const npvFunction = (rate: number, flows: number[]): number => {
    return flows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  };

  const npvDerivative = (rate: number, flows: number[]): number => {
    return flows.reduce((sum, cf, i) => sum - i * cf / Math.pow(1 + rate, i + 1), 0);
  };

  let rate = guess;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const npv = npvFunction(rate, cashFlows);
    
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    const derivative = npvDerivative(rate, cashFlows);
    if (derivative === 0) break;
    
    rate = rate - npv / derivative;
  }
  
  return Math.abs(npvFunction(rate, cashFlows)) < tolerance ? rate : null;
}

/**
 * Calcula o Retorno sobre Investimento (ROI)
 */
export function calculateROI(initialInvestment: number, finalValue: number): number {
  return (finalValue - initialInvestment) / initialInvestment;
}

/**
 * Calcula o período de payback
 */
export function calculatePaybackPeriod(cashFlows: number[]): number | null {
  let cumulative = 0;
  
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      // Interpolação para obter valor mais preciso
      const previousCumulative = cumulative - cashFlows[i];
      return i + Math.abs(previousCumulative) / cashFlows[i];
    }
  }
  
  return null; // Payback não alcançado no período
}

/**
 * Calcula ponto de equilíbrio em unidades
 */
export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number
): number | null {
  if (pricePerUnit <= variableCostPerUnit) {
    return null; // Não é viável
  }
  return fixedCosts / (pricePerUnit - variableCostPerUnit);
}

/**
 * Calcula capital de giro
 */
export function calculateWorkingCapital(currentAssets: number, currentLiabilities: number): number {
  return currentAssets - currentLiabilities;
}

/**
 * Calcula principais índices financeiros
 */
export function calculateFinancialRatios(
  revenue: number,
  costs: number,
  assets: number,
  liabilities: number,
  equity: number,
  taxRate = 0.15
) {
  const grossProfit = revenue - costs;
  const netProfit = grossProfit * (1 - taxRate);
  
  return {
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    netMargin: revenue > 0 ? netProfit / revenue : 0,
    roa: assets > 0 ? netProfit / assets : 0,
    roe: equity > 0 ? netProfit / equity : 0,
    debtToEquity: equity > 0 ? liabilities / equity : 0,
    currentRatio: liabilities > 0 ? assets / liabilities : 0,
    ebitda: grossProfit,
    ebit: grossProfit,
    netProfit,
  };
} 
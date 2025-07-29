/**
 * Calcula múltiplos de valuation
 */
export function calculateValuationMultiples(
  revenue: number,
  ebitda: number,
  netIncome: number,
  industryMultiples: Record<string, number>
) {
  const valuations: Record<string, number> = {};
  
  if (industryMultiples.evRevenue) {
    valuations.enterpriseValueRevenue = revenue * industryMultiples.evRevenue;
  }
  
  if (industryMultiples.evEbitda) {
    valuations.enterpriseValueEbitda = ebitda * industryMultiples.evEbitda;
  }
  
  if (industryMultiples.peRatio) {
    valuations.marketValuePe = netIncome * industryMultiples.peRatio;
  }
  
  return valuations;
}

/**
 * Calcula valuation por fluxo de caixa descontado (DCF)
 */
export function calculateDCFValuation(
  cashFlows: number[],
  terminalGrowthRate: number,
  discountRate: number
): { enterpriseValue: number; pvExplicit: number; pvTerminal: number } {
  // Valor presente dos fluxos explícitos
  const pvExplicit = cashFlows
    .slice(1) // Remove investimento inicial
    .reduce((sum, cf, index) => sum + cf / Math.pow(1 + discountRate, index + 1), 0);
  
  // Valor terminal
  let pvTerminal = 0;
  if (cashFlows.length > 1) {
    const terminalCF = cashFlows[cashFlows.length - 1] * (1 + terminalGrowthRate);
    const terminalValue = terminalCF / (discountRate - terminalGrowthRate);
    pvTerminal = terminalValue / Math.pow(1 + discountRate, cashFlows.length - 1);
  }
  
  const enterpriseValue = pvExplicit + pvTerminal;
  
  return { enterpriseValue, pvExplicit, pvTerminal };
} 
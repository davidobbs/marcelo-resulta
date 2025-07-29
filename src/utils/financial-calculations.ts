import type { 
  Market, 
  FinancialProjection, 
  InvestmentBreakdown, 
  ValuationMetrics,
  DetailedRevenue,
  DetailedOperationalCosts,
  FootballField,
  StaffMember,
  StrategicKPIs,
  ComprehensiveViabilityAnalysis,
  EnhancedSensitivityAnalysis,
  MonteCarloAnalysis
} from '@/types';

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

/**
 * NOVAS FUNÇÕES ESPECÍFICAS PARA CLUBES DE FUTEBOL
 */

/**
 * Calcula receita detalhada de aluguel de campos
 */
export function calculateFieldRentalRevenue(
  fields: FootballField[],
  market: Market,
  seasonalFactors: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
): { monthly: number; annual: number; byField: Record<string, number> } {
  const byField: Record<string, number> = {};
  let totalMonthly = 0;

  fields.forEach(field => {
    const hoursPerDay = market.hoursPerDay;
    const daysPerMonth = 30;
    const availableHours = hoursPerDay * daysPerMonth;
    const utilizedHours = availableHours * field.utilizationRate;
    const monthlyRevenue = utilizedHours * field.hourlyRate;
    
    byField[field.id] = monthlyRevenue;
    totalMonthly += monthlyRevenue;
  });

  // Aplicar fatores sazonais para receita anual
  const annualRevenue = seasonalFactors.reduce((total, factor) => 
    total + (totalMonthly * factor), 0
  );

  return {
    monthly: totalMonthly,
    annual: annualRevenue,
    byField
  };
}

/**
 * Calcula receitas de escolinha de futebol
 */
export function calculateSoccerSchoolRevenue(
  students: number,
  monthlyTuition: number,
  retentionRate: number = 0.9,
  growthRate: number = 0.05,
  years: number = 12
): number[] {
  const revenues: number[] = [];
  let currentStudents = students;

  for (let year = 0; year < years; year++) {
    const yearlyRevenue = currentStudents * monthlyTuition * 12;
    revenues.push(yearlyRevenue);
    
    // Aplicar crescimento e retenção
    currentStudents = Math.round(currentStudents * retentionRate * (1 + growthRate));
  }

  return revenues;
}

/**
 * Calcula receitas de patrocínio baseado em exposição e performance
 */
export function calculateSponsorshipRevenue(
  baseValue: number,
  exposureMultiplier: number = 1,
  performanceBonus: number = 0,
  contractYears: number = 3,
  inflationRate: number = 0.05
): number[] {
  const revenues: number[] = [];
  let currentValue = baseValue * exposureMultiplier + performanceBonus;

  for (let year = 0; year < contractYears; year++) {
    revenues.push(currentValue);
    currentValue *= (1 + inflationRate);
  }

  return revenues;
}

/**
 * Calcula custos operacionais detalhados do clube
 */
export function calculateDetailedOperationalCosts(
  fields: FootballField[],
  staff: StaffMember[],
  market: Market,
  facilities: any[] = [],
  year: number = 1
): DetailedOperationalCosts {
  // Custos de pessoal
  const totalSalaries = staff.reduce((sum, member) => sum + member.monthlySalary * 12, 0);
  const socialCharges = totalSalaries * market.salaryBurden;
  const benefits = totalSalaries * 0.15; // 15% em benefícios
  const training = staff.length * 2000; // R$ 2000 por funcionário/ano
  const recruitment = staff.length * 1000; // R$ 1000 por funcionário/ano

  const personnel = {
    salaries: totalSalaries,
    socialCharges,
    benefits,
    training,
    recruitment,
    total: totalSalaries + socialCharges + benefits + training + recruitment
  };

  // Custos das instalações
  const fieldMaintenance = fields.reduce((sum, field) => sum + field.maintenanceCost * 12, 0);
  const cleaning = fields.length * 800 * 12; // R$ 800/campo/mês
  const security = 2000 * 12; // R$ 2000/mês
  const landscaping = fields.length * 300 * 12; // R$ 300/campo/mês
  const repairs = fieldMaintenance * 0.3; // 30% da manutenção

  const facilitiesCosts = {
    maintenance: fieldMaintenance,
    cleaning,
    security,
    landscaping,
    repairs,
    total: fieldMaintenance + cleaning + security + landscaping + repairs
  };

  // Custos de utilidades
  const electricity = fields.length * 800 * 12; // R$ 800/campo/mês
  const water = fields.length * 300 * 12;
  const gas = 200 * 12;
  const internet = 150 * 12;
  const phone = 100 * 12;
  const waste = fields.length * 100 * 12;

  const utilities = {
    electricity,
    water,
    gas,
    internet,
    phone,
    waste,
    total: electricity + water + gas + internet + phone + waste
  };

  // Seguros
  const property = 15000; // Anual
  const liability = 8000;
  const equipmentInsurance = 5000;
  const workersCompensation = totalSalaries * 0.02;

  const insurance = {
    property,
    liability,
    equipmentInsurance,
    workersCompensation,
    other: 3000,
    total: property + liability + equipmentInsurance + workersCompensation + 3000
  };

  // Marketing
  const digitalMarketing = 3000 * 12;
  const traditionalMedia = 2000 * 12;
  const events = 15000;
  const sponsorships = 5000;
  const materials = 3000;

  const marketing = {
    digitalMarketing,
    traditionalMedia,
    events,
    sponsorships,
    materials,
    total: digitalMarketing + traditionalMedia + events + sponsorships + materials
  };

  // Administrativo
  const accounting = 2000 * 12;
  const legal = 1000 * 12;
  const consulting = 5000;
  const software = 500 * 12;
  const officeSupplies = 300 * 12;
  const banking = 100 * 12;

  const administrative = {
    accounting,
    legal,
    consulting,
    software,
    officeSupplies,
    banking,
    total: accounting + legal + consulting + software + officeSupplies + banking
  };

  // Manutenção de equipamentos
  const fieldsEquipment = fieldMaintenance * 0.2;
  const sportsEquipment = 5000;
  const technology = 3000;
  const vehicles = 8000;

  const equipment = {
    fieldsEquipment,
    sportsEquipment,
    technology,
    vehicles,
    other: 2000,
    total: fieldsEquipment + sportsEquipment + technology + vehicles + 2000
  };

  // Regulatório
  const licenses = 5000;
  const inspections = 2000;
  const compliance = 3000;
  const taxes = 8000;

  const regulatory = {
    licenses,
    inspections,
    compliance,
    taxes,
    other: 2000,
    total: licenses + inspections + compliance + taxes + 2000
  };

  const totalCosts = personnel.total + facilitiesCosts.total + utilities.total + 
                    insurance.total + marketing.total + administrative.total + 
                    equipment.total + regulatory.total;

  return {
    personnel,
    facilities: facilitiesCosts,
    equipment,
    utilities,
    insurance,
    marketing,
    administrative,
    regulatory,
    other: [],
    total: totalCosts
  };
}

/**
 * Calcula KPIs estratégicos específicos para clubes
 */
export function calculateStrategicKPIs(
  revenue: DetailedRevenue,
  costs: DetailedOperationalCosts,
  fields: FootballField[],
  members: number = 0
): StrategicKPIs {
  const totalRevenue = revenue.total;
  const totalCosts = costs.total;
  const netProfit = totalRevenue - totalCosts;

  // KPIs Financeiros
  const financial = {
    revenueGrowthRate: { name: 'Taxa de Crescimento da Receita', value: 0.15, unit: '%', trend: 'up' as const, target: 0.15, benchmark: 0.12 },
    profitMargin: { name: 'Margem de Lucro', value: netProfit / totalRevenue, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.15 },
    cashFlowMargin: { name: 'Margem de Fluxo de Caixa', value: (netProfit * 0.9) / totalRevenue, unit: '%', trend: 'up' as const, target: 0.18, benchmark: 0.12 },
    returnOnAssets: { name: 'Retorno sobre Ativos', value: 0.25, unit: '%', trend: 'up' as const, target: 0.25, benchmark: 0.20 },
    returnOnEquity: { name: 'Retorno sobre Patrimônio', value: 0.30, unit: '%', trend: 'up' as const, target: 0.30, benchmark: 0.25 },
    debtToEquityRatio: { name: 'Dívida/Patrimônio', value: 0.4, unit: 'x', trend: 'down' as const, target: 0.3, benchmark: 0.5 },
    breakEvenPoint: { name: 'Ponto de Equilíbrio', value: 18, unit: 'meses', trend: 'down' as const, target: 18, benchmark: 24 }
  };

  // KPIs Operacionais
  const avgUtilization = fields.reduce((sum, field) => sum + field.utilizationRate, 0) / fields.length;
  const avgRevenuePerField = revenue.fieldRental.total / fields.length;

  const operational = {
    fieldUtilizationRate: { name: 'Taxa de Utilização dos Campos', value: avgUtilization, unit: '%', trend: 'up' as const, target: 0.75, benchmark: 0.65 },
    averageRevenuePerField: { name: 'Receita Média por Campo', value: avgRevenuePerField / 12, unit: 'R$/mês', trend: 'up' as const, target: 15000, benchmark: 12000 },
    membershipRetentionRate: { name: 'Taxa de Retenção de Membros', value: 0.85, unit: '%', trend: 'up' as const, target: 0.90, benchmark: 0.80 },
    staffProductivity: { name: 'Produtividade da Equipe', value: totalRevenue / costs.personnel.total, unit: 'x', trend: 'up' as const, target: 3.0, benchmark: 2.5 },
    maintenanceCostRatio: { name: 'Custo de Manutenção / Receita', value: costs.facilities.maintenance / totalRevenue, unit: '%', trend: 'down' as const, target: 0.08, benchmark: 0.12 },
    energyEfficiency: { name: 'Eficiência Energética', value: 0.75, unit: '%', trend: 'up' as const, target: 0.80, benchmark: 0.70 }
  };

  // KPIs de Clientes
  const customer = {
    customerSatisfactionScore: { name: 'Satisfação do Cliente', value: 8.5, unit: '/10', trend: 'up' as const, target: 9.0, benchmark: 8.0 },
    netPromoterScore: { name: 'Net Promoter Score', value: 65, unit: 'pontos', trend: 'up' as const, target: 70, benchmark: 50 },
    averageCustomerLifetime: { name: 'Tempo Médio de Permanência', value: 24, unit: 'meses', trend: 'up' as const, target: 30, benchmark: 18 },
    membershipGrowthRate: { name: 'Crescimento de Membros', value: 0.10, unit: '%/mês', trend: 'up' as const, target: 0.12, benchmark: 0.08 },
    churnRate: { name: 'Taxa de Cancelamento', value: 0.05, unit: '%/mês', trend: 'down' as const, target: 0.03, benchmark: 0.08 },
    averageRevenuePerCustomer: { name: 'Receita Média por Cliente', value: totalRevenue / Math.max(members, 100), unit: 'R$/ano', trend: 'up' as const, target: 2000, benchmark: 1500 }
  };

  // KPIs de Crescimento
  const growth = {
    membershipGrowth: { name: 'Crescimento de Membros', value: 0.15, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.10 },
    revenueGrowth: { name: 'Crescimento da Receita', value: 0.18, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.12 },
    marketExpansion: { name: 'Expansão de Mercado', value: 0.05, unit: '%', trend: 'up' as const, target: 0.10, benchmark: 0.03 },
    facilityExpansion: { name: 'Expansão de Instalações', value: 0, unit: 'novos campos', trend: 'stable' as const, target: 1, benchmark: 0 }
  };

  // KPIs de Sustentabilidade
  const sustainability = {
    energyEfficiency: { name: 'Eficiência Energética', value: 0.78, unit: '%', trend: 'up' as const, target: 0.85, benchmark: 0.70 },
    waterUsage: { name: 'Uso de Água', value: 150, unit: 'm³/campo/mês', trend: 'down' as const, target: 120, benchmark: 180 },
    wasteReduction: { name: 'Redução de Resíduos', value: 0.30, unit: '%', trend: 'up' as const, target: 0.50, benchmark: 0.20 },
    carbonFootprint: { name: 'Pegada de Carbono', value: 8.5, unit: 'tCO2/ano', trend: 'down' as const, target: 6.0, benchmark: 12.0 }
  };

  return {
    financial,
    operational,
    customer,
    growth,
    sustainability
  };
}

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
 * Simulação Monte Carlo para análise de sensibilidade
 */
export function monteCarloSimulation(
  baseValues: Record<string, number>,
  uncertainties: Record<string, number>,
  numSimulations = 1000
): Array<Record<string, number>> {
  const results: Array<Record<string, number>> = [];
  
  for (let i = 0; i < numSimulations; i++) {
    const scenario: Record<string, number> = {};
    
    for (const [key, baseValue] of Object.entries(baseValues)) {
      const uncertainty = uncertainties[key] || 0.1;
      // Gera valor aleatório com distribuição normal (aproximada)
      const randomFactor = generateNormalRandom(1, uncertainty);
      scenario[key] = baseValue * randomFactor;
    }
    
    results.push(scenario);
  }
  
  return results;
}

/**
 * Análise Monte Carlo avançada com estatísticas
 */
export function advancedMonteCarloAnalysis(
  baseScenario: Record<string, number>,
  uncertainties: Record<string, number>,
  numSimulations: number = 10000
): MonteCarloAnalysis {
  const results: any[] = [];
  
  for (let i = 0; i < numSimulations; i++) {
    const scenario: Record<string, number> = {};
    
    // Gerar cenário aleatório
    for (const [key, baseValue] of Object.entries(baseScenario)) {
      const uncertainty = uncertainties[key] || 0.1;
      const randomFactor = generateNormalRandom(1, uncertainty);
      scenario[key] = baseValue * Math.max(0.1, randomFactor); // Evitar valores negativos extremos
    }
    
    // Calcular NPV para este cenário
    const cashFlows = generateCashFlows(scenario);
    const npv = calculateNPV(cashFlows, scenario.discountRate || 0.1);
    const irr = calculateIRR(cashFlows) || 0;
    const payback = calculatePaybackPeriod(cashFlows) || 0;
    
    results.push({
      iteration: i + 1,
      npv,
      irr,
      payback
    });
  }
  
  // Calcular estatísticas
  const npvValues = results.map(r => r.npv).sort((a, b) => a - b);
  const mean = npvValues.reduce((sum, val) => sum + val, 0) / npvValues.length;
  const median = npvValues[Math.floor(npvValues.length / 2)];
  
  const variance = npvValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / npvValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  const statistics = {
    mean,
    median,
    standardDeviation,
    percentiles: {
      p5: npvValues[Math.floor(npvValues.length * 0.05)],
      p25: npvValues[Math.floor(npvValues.length * 0.25)],
      p75: npvValues[Math.floor(npvValues.length * 0.75)],
      p95: npvValues[Math.floor(npvValues.length * 0.95)]
    }
  };
  
  return {
    iterations: numSimulations,
    results,
    statistics
  };
}

/**
 * Gera número aleatório com distribuição normal (aproximada)
 */
function generateNormalRandom(mean: number, stdDev: number): number {
  // Box-Muller transform para distribuição normal
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Análise de sensibilidade univariada
 */
export function calculateSensitivityAnalysis(
  baseCase: Record<string, number>,
  variables: Record<string, number>,
  changeRange = 0.2
) {
  const results: Record<string, any[]> = {};
  
  for (const [varName, baseValue] of Object.entries(variables)) {
    const varResults = [];
    const changes = [];
    
    // Gera range de mudanças
    for (let change = -changeRange; change <= changeRange; change += 0.05) {
      changes.push(change);
    }
    
    for (const change of changes) {
      const modifiedCase = { ...baseCase };
      modifiedCase[varName] = baseValue * (1 + change);
      
      // Recalcula o resultado (NPV como exemplo)
      const cashFlows = generateCashFlows(modifiedCase);
      const npv = calculateNPV(cashFlows, modifiedCase.discountRate || 0.1);
      
      varResults.push({
        changePercent: change * 100,
        newValue: modifiedCase[varName],
        npv,
      });
    }
    
    results[varName] = varResults;
  }
  
  return results;
}

/**
 * Análise de sensibilidade avançada com gráficos tornado e spider
 */
export function enhancedSensitivityAnalysis(
  baseCase: Record<string, number>,
  variables: Record<string, number>,
  changeRange: number = 0.2
): EnhancedSensitivityAnalysis {
  // Análise básica
  const basicResults = calculateSensitivityAnalysis(baseCase, variables, changeRange);
  
  // Tornado Chart Data - mostra o impacto de cada variável
  const tornadoChart = Object.entries(variables).map(([varName, baseValue]) => {
    const modifiedCaseLow = { ...baseCase, [varName]: baseValue * (1 - changeRange) };
    const modifiedCaseHigh = { ...baseCase, [varName]: baseValue * (1 + changeRange) };
    
    const npvLow = calculateNPV(generateCashFlows(modifiedCaseLow), baseCase.discountRate || 0.1);
    const npvHigh = calculateNPV(generateCashFlows(modifiedCaseHigh), baseCase.discountRate || 0.1);
    const baseNPV = calculateNPV(generateCashFlows(baseCase), baseCase.discountRate || 0.1);
    
    return {
      variable: varName,
      lowImpact: npvLow - baseNPV,
      highImpact: npvHigh - baseNPV,
      range: Math.abs(npvHigh - npvLow)
    };
  }).sort((a, b) => b.range - a.range);
  
  // Spider Chart Data
  const spiderChart = Object.entries(variables).map(([varName]) => ({
    variable: varName,
    baseCase: 100,
    sensitivity: [-20, -10, 0, 10, 20].map(change => {
      const modifiedCase = { ...baseCase, [varName]: variables[varName] * (1 + change / 100) };
      const npv = calculateNPV(generateCashFlows(modifiedCase), baseCase.discountRate || 0.1);
      const baseNPV = calculateNPV(generateCashFlows(baseCase), baseCase.discountRate || 0.1);
      return ((npv / baseNPV) - 1) * 100;
    })
  }));
  
  // Monte Carlo
  const uncertainties: Record<string, number> = {};
  Object.keys(variables).forEach(key => {
    uncertainties[key] = changeRange; // Usar o mesmo range como incerteza
  });
  const monteCarlo = advancedMonteCarloAnalysis(baseCase, uncertainties, 5000);
  
  return {
    variables: Object.entries(variables).map(([name, baseValue]) => ({
      name,
      baseValue,
      range: [-changeRange * 100, changeRange * 100],
      impact: basicResults[name]?.map(r => r.npv) || []
    })),
    results: Object.entries(basicResults).flatMap(([variable, results]) =>
      results.map(r => ({
        variable,
        changePercent: r.changePercent,
        newValue: r.newValue,
        npvImpact: r.npv
      }))
    ),
    tornadoChart,
    spiderChart,
    monteCarlo
  };
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
    fieldConstruction,
    equipment,
    facilityCosts,
    workingCapital,
    licensing,
    total,
  };
}

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
  
  const uncertainties = {
    utilizationRate: 0.2,
    hourlyRate: 0.15,
    growthRate: 0.3,
    operationalCosts: 0.15
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
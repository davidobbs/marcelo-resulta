// @ts-nocheck
import type { MonteCarloAnalysis, EnhancedSensitivityAnalysis, MonteCarloResult, SensitivityResult } from '@/types';
import { calculateNPV, calculateIRR, calculatePaybackPeriod } from './metrics';
import { generateCashFlows } from '../financials';

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
  const results: MonteCarloResult[] = [];
  
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
 * Análise de sensibilidade univariada
 */
export function calculateSensitivityAnalysis(
  baseCase: Record<string, number>,
  variables: Record<string, number>,
  changeRange = 0.2
): Record<string, SensitivityResult[]> {
  const results: Record<string, SensitivityResult[]> = {};
  
  for (const [varName, baseValue] of Object.entries(variables)) {
    const varResults: SensitivityResult[] = [];
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
        npvImpact: npv, // Corrigido para npvImpact
        variable: varName, // Adicionando a variável
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
      impact: basicResults[name]?.map(r => r.npvImpact) || []
    })),
    results: Object.entries(basicResults).flatMap(([variable, results]) =>
      results.map(r => ({
        variable,
        changePercent: r.changePercent,
        newValue: r.newValue,
        npvImpact: r.npvImpact
      }))
    ),
    tornadoChart,
    spiderChart,
    monteCarlo
  };
} 
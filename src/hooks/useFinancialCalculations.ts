import { useMemo, useCallback, useEffect } from 'react';

import { useAppStore, useAnalysisPeriod, useCountry, useValuationParams } from '@/stores/useAppStore';
import {
  calculateFinancialRatios,
  calculateInvestmentRequirements,
  calculateViabilityMetrics,
} from '@/utils/financials/index';
import { 
  FinancialProjection, 
  InvestmentAnalysis, 
  KPIData, 
  StrategicKPIs, 
  QuantifiableItem, 
  ValuationMetrics,
  FinancialData
} from '@/types';

// Função auxiliar para somar valores de uma categoria de forma recursiva e segura
const sumCategoryValues = (data: unknown): number => {
    if (typeof data === 'number') {
        return data;
    }
    if (typeof data === 'object' && data !== null) {
        if ('total' in data && typeof (data as QuantifiableItem).total === 'number') {
            return (data as QuantifiableItem).total;
        }
        if (Array.isArray(data)) {
            return data.reduce((sum, item) => sum + sumCategoryValues(item), 0);
        }
        if('value' in data && typeof (data as {value: unknown}).value === 'number') {
            return (data as {value: number}).value;
        }
        return Object.values(data).reduce((sum, value) => sum + sumCategoryValues(value), 0);
    }
    return 0;
};


export function useFinancialCalculations() {
  const { 
    club, 
    market, 
    financialData,
    setProjections, 
    setKPIs, 
    setAnalysis,
    setStrategicKPIs 
  } = useAppStore();

  const totals = useMemo(() => {
    const revenueTotal = sumCategoryValues(financialData.revenues);
    const costTotal = sumCategoryValues(financialData.costs);
    return {
      revenueTotal, costTotal, profit: revenueTotal - costTotal
    };
  }, [financialData]);
  const analysisPeriod = useAnalysisPeriod();
  const { countryProfile } = useCountry();
  const valuationParams = useValuationParams();

  const periodMultiplier = useMemo(() => {
    switch (analysisPeriod) {
      case 'bimonthly': return 2;
      case 'quarterly': return 3;
      case 'annual': return 12;
      case 'monthly':
      default:
        return 1;
    }
  }, [analysisPeriod]);

  const activeMarketParams = useMemo(() => {
    if (valuationParams.updateOnline) {
      return {
        ...market,
        discountRate: valuationParams.discountRate ?? market.discountRate,
        growthPotential: valuationParams.growthPotential ?? market.growthPotential,
        marketSizeFactor: valuationParams.marketSizeFactor ?? market.marketSizeFactor,
      };
    }
    return market;
  }, [market, valuationParams]);
  
  const revenueCalculations = useMemo(() => {
    if (!financialData?.revenues) return { monthly: 0, period: 0, annual: 0, breakdown: {} };
    
    const monthlyTotal = sumCategoryValues(financialData.revenues);
    const periodTotal = monthlyTotal * periodMultiplier;
    const annualTotal = monthlyTotal * 12;

    const createBreakdown = (value: number) => ({ 
        value: value * periodMultiplier, 
        percentage: monthlyTotal > 0 ? (value / monthlyTotal) * 100 : 0 
    });
    
    const revenues = financialData.revenues;

    return {
      monthly: monthlyTotal,
      period: periodTotal,
      annual: annualTotal,
      breakdown: {
        fieldRental: createBreakdown(sumCategoryValues(revenues.fieldRental)),
        membership: createBreakdown(sumCategoryValues(revenues.membership)),
        sponsorship: createBreakdown(sumCategoryValues(revenues.sponsorship)),
        soccerSchool: createBreakdown(sumCategoryValues(revenues.soccerSchool)),
        other: createBreakdown(
            sumCategoryValues(revenues.merchandise) + 
            sumCategoryValues(revenues.events) + 
            sumCategoryValues(revenues.foodBeverage) +
            sumCategoryValues(revenues.customRevenues)
        ),
      }
    };
  }, [financialData?.revenues, periodMultiplier]);
  
  const costCalculations = useMemo(() => {
    if (!financialData?.costs) return { monthly: 0, period: 0, annual: 0, breakdown: {} };
    
    const monthlyTotal = sumCategoryValues(financialData.costs);
    const periodTotal = monthlyTotal * periodMultiplier;
    const annualTotal = monthlyTotal * 12;

    const breakdown: Record<string, { value: number; percentage: number }> = {};
    for (const key in financialData.costs) {
        const categoryKey = key as keyof FinancialData['costs'];
        const categoryValue = financialData.costs[categoryKey];
        const categoryTotal = sumCategoryValues(categoryValue);
        breakdown[key] = { 
            value: categoryTotal * periodMultiplier, 
            percentage: monthlyTotal > 0 ? (categoryTotal / monthlyTotal) * 100 : 0 
        };
    }

    return { monthly: monthlyTotal, period: periodTotal, annual: annualTotal, breakdown };
  }, [financialData?.costs, periodMultiplier]);

  const dreCalculations = useMemo(() => {
    const receitaBruta = revenueCalculations.period;
    const custosOperacionais = costCalculations.period;
    const lucroOperacional = receitaBruta - custosOperacionais;
    
    const annualRevenue = revenueCalculations.annual;
    const annualProfit = annualRevenue - costCalculations.annual;

    let totalAnnualTaxes = 0;
    const taxBreakdown: { [key: string]: number } = {};

    countryProfile.taxes.forEach(tax => {
        let taxBase = 0;
        if (tax.appliesTo?.includes('profits')) {
            taxBase = annualProfit > 0 ? annualProfit : 0;
        } else if (tax.appliesTo?.includes('revenues')) {
            taxBase = annualRevenue;
        }
        
        const taxValue = taxBase * tax.rate;
        totalAnnualTaxes += taxValue;
        taxBreakdown[tax.name] = taxValue;
    });
    
    const periodTaxes = (totalAnnualTaxes / 12) * periodMultiplier;
    
    const lucroLiquido = lucroOperacional - periodTaxes;
    const depreciacao = costCalculations.breakdown.depreciation?.value || 0;
    const ebitda = lucroOperacional + depreciacao;
    const ebit = lucroOperacional;
    
    const createMargin = (value: number) => receitaBruta > 0 ? (value / receitaBruta) * 100 : 0;

    return {
      receitaBruta, custosOperacionais, lucroOperacional, impostos: periodTaxes, lucroLiquido, ebitda, ebit,
      margemBruta: createMargin(lucroOperacional),
      margemLiquida: createMargin(lucroLiquido),
      margemEbitda: createMargin(ebitda),
      breakdown: {
        receitas: revenueCalculations.breakdown,
        custos: costCalculations.breakdown
      }
    };
  }, [revenueCalculations, costCalculations, countryProfile, periodMultiplier]);

  const cashFlowCalculations = useMemo(() => {
    const lucroLiquido = dreCalculations.lucroLiquido;
    const depreciacao = costCalculations.breakdown.depreciation?.value || 0;
    const fluxoOperacional = lucroLiquido + depreciacao;
    return { fluxoOperacional, investimentos: 0, financiamentos: 0, fluxoLivre: fluxoOperacional, saldoInicial: 0, saldoFinal: fluxoOperacional };
  }, [dreCalculations, costCalculations]);
  
  const investmentRequirements = useMemo(() => {
    return calculateInvestmentRequirements(activeMarketParams, club.numFields);
  }, [activeMarketParams, club.numFields]);

  const projectionCalculations = useMemo((): FinancialProjection[] => {
    if (!revenueCalculations.annual || !costCalculations.annual) return [];

    const currentYear = new Date().getFullYear();
    const projections: FinancialProjection[] = [];
    const growthRate = activeMarketParams.growthPotential;
    const inflationRate = activeMarketParams.inflationRate;

    for (let year = 0; year < 12; year++) {
      const annualRevenue = revenueCalculations.annual * Math.pow(1 + growthRate, year);
      const annualCosts = costCalculations.annual * Math.pow(1 + inflationRate, year);
      const annualProfit = annualRevenue - annualCosts;
      
      let annualTaxes = 0;
      countryProfile.taxes.forEach(tax => {
          let taxBase = 0;
          if (tax.appliesTo?.includes('profits')) taxBase = annualProfit > 0 ? annualProfit : 0;
          else if (tax.appliesTo?.includes('revenues')) taxBase = annualRevenue;
          annualTaxes += taxBase * tax.rate;
      });
      
      const netProfit = annualProfit - annualTaxes;

      const cashFlow = {
        operational: netProfit,
        investment: year === 0 ? -investmentRequirements.total : 0,
        financing: 0,
        net: year === 0 ? netProfit - investmentRequirements.total : netProfit,
        accumulated: 0
      };
      
      const corporateTaxRate = countryProfile.taxes.find(t => t.type === 'corporate')?.rate || 0;
      const metrics = calculateFinancialRatios(annualRevenue, annualCosts, investmentRequirements.total, 0, 0, corporateTaxRate);

      projections.push({
        month: year * 12,
        year: currentYear + year,
        revenue: annualRevenue,
        costs: annualCosts,
        profit: netProfit,
        cumulativeProfit: 0,
        cashFlow
      });
    }
    
    let accumulated = 0;
    projections.forEach(p => {
      if (p.cashFlow) {
        accumulated += p.cashFlow.net;
        p.cashFlow.accumulated = accumulated;
      }
    });

    return projections;
  }, [revenueCalculations.annual, costCalculations.annual, activeMarketParams, investmentRequirements, countryProfile]);

  const viabilityAnalysis = useMemo((): ValuationMetrics => {
    if(projectionCalculations.length === 0) {
      return { npv: 0, irr: 0, paybackPeriod: 0, profitabilityIndex: 0, breakEvenPoint: 0, roi: 0 };
    }
    const cashFlows = [-investmentRequirements.total, ...projectionCalculations.map(p => p.cashFlow?.net || 0)];
    const discountRate = activeMarketParams.discountRate;
    return calculateViabilityMetrics(cashFlows, discountRate);
  }, [projectionCalculations, investmentRequirements, activeMarketParams]);

  const kpiCalculations = useMemo(() => {
    const revenue = revenueCalculations.annual;
    const assets = investmentRequirements.total;
    const netProfit = dreCalculations.lucroLiquido / periodMultiplier * 12;
    const currencySymbol = countryProfile.currency.symbol;

    const financial: KPIData = {
      revenue: { name: 'Receita Anual', value: revenue, unit: currencySymbol, trend: 'stable', target: 0, benchmark: 0 },
      profitability: { name: 'Margem Líquida', value: dreCalculations.margemLiquida, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
      efficiency: { name: 'Giro do Ativo', value: assets > 0 ? revenue / assets : 0, unit: 'x', trend: 'stable', target: 0, benchmark: 0 },
      financial: { name: 'ROE', value: assets > 0 ? netProfit / (assets * 0.7) : 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
    };
    
    return { financial, strategic: {} as StrategicKPIs };
  }, [revenueCalculations.annual, dreCalculations, investmentRequirements.total, periodMultiplier, countryProfile]);

  const recalculate = useCallback(() => {
    setProjections(projectionCalculations);
    setKPIs(kpiCalculations.financial);
    setStrategicKPIs(kpiCalculations.strategic);

    const analysis: InvestmentAnalysis = {
      valuation: viabilityAnalysis,
      sensitivity: { variables: [], results: [] },
      scenarios: { optimistic: {} as FinancialProjection, realistic: {} as FinancialProjection, pessimistic: {} as FinancialProjection },
    };
    
    setAnalysis(analysis);
  }, [projectionCalculations, kpiCalculations, investmentRequirements, viabilityAnalysis, setProjections, setKPIs, setStrategicKPIs, setAnalysis]);

  useEffect(() => {
    if (financialData && Object.keys(financialData).length > 0) {
      const timeoutId = setTimeout(() => {
        recalculate();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [financialData, activeMarketParams, club, countryProfile, recalculate]);

  const calculateScenarios = useCallback(() => {
    const baseGrowth = activeMarketParams.growthPotential;
    return {
      pessimistic: { growth: baseGrowth * 0.5, description: 'Cenário conservador' },
      realistic: { growth: baseGrowth, description: 'Cenário base' },
      optimistic: { growth: baseGrowth * 1.5, description: 'Cenário otimista' }
    };
  }, [activeMarketParams.growthPotential]);

  return useMemo(() => ({
    totals,
    revenues: revenueCalculations,
    costs: costCalculations,
    dre: dreCalculations,
    cashFlow: cashFlowCalculations,
    projections: projectionCalculations,
    viability: viabilityAnalysis,
    kpis: kpiCalculations,
    investment: investmentRequirements,
    recalculate,
    calculateScenarios,
  }), [
    totals, revenueCalculations, costCalculations, dreCalculations, cashFlowCalculations,
    projectionCalculations, viabilityAnalysis, kpiCalculations, investmentRequirements,
    recalculate, calculateScenarios
  ]);
}

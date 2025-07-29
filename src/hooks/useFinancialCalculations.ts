import { useMemo, useEffect } from 'react';
import { useAppStore, useFinancialData } from '@/stores/useAppStore';
import {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod,
  calculateROI,
  calculateFinancialRatios,
  calculateTaxBurden,
  calculateInvestmentRequirements,
  calculateViabilityMetrics,
  generateCashFlows,
  enhancedSensitivityAnalysis,
  advancedMonteCarloAnalysis
} from '@/utils/financial-calculations';

export function useFinancialCalculations() {
  const { club, market, setProjections, setKPIs, setAnalysis } = useAppStore();
  const financialData = useFinancialData();

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE RECEITAS
  // =====================================================
  
  // Receita total detalhada com cálculos automáticos
  const revenueCalculations = useMemo(() => {
    if (!financialData?.revenues) {
      return {
        fieldRental: 0,
        membership: 0,
        sponsorship: 0,
        soccerSchool: 0,
        merchandise: 0,
        events: 0,
        foodBeverage: 0,
        other: 0,
        monthly: 0,
        annual: 0
      };
    }

    // Aluguel de Campos - Cálculos automáticos
    const fieldRental = Object.values(financialData.revenues.fieldRental || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    // Mensalidades e Associações
    const membership = Object.values(financialData.revenues.membership || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    // Patrocínios
    const sponsorship = Object.values(financialData.revenues.sponsorship || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    // Escolinha de Futebol
    const soccerSchool = Object.values(financialData.revenues.soccerSchool || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    // Outras categorias
    const merchandise = Object.values(financialData.revenues.merchandise || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    const events = Object.values(financialData.revenues.events || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    const foodBeverage = Object.values(financialData.revenues.foodBeverage || {})
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    const other = Array.isArray(financialData.revenues.customRevenues) 
      ? financialData.revenues.customRevenues.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
      : 0;

    const monthly = fieldRental + membership + sponsorship + soccerSchool + merchandise + events + foodBeverage + other;
    const annual = monthly * 12;

    return {
      fieldRental,
      membership,
      sponsorship,
      soccerSchool,
      merchandise,
      events,
      foodBeverage,
      other,
      monthly,
      annual,
      breakdown: {
        fieldRental: { value: fieldRental, percentage: monthly > 0 ? (fieldRental / monthly) * 100 : 0 },
        membership: { value: membership, percentage: monthly > 0 ? (membership / monthly) * 100 : 0 },
        sponsorship: { value: sponsorship, percentage: monthly > 0 ? (sponsorship / monthly) * 100 : 0 },
        soccerSchool: { value: soccerSchool, percentage: monthly > 0 ? (soccerSchool / monthly) * 100 : 0 },
        other: { value: merchandise + events + foodBeverage + other, percentage: monthly > 0 ? ((merchandise + events + foodBeverage + other) / monthly) * 100 : 0 }
      }
    };
  }, [financialData?.revenues]);

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE CUSTOS
  // =====================================================
  
  const costCalculations = useMemo(() => {
    if (!financialData?.costs) {
      return {
        personnel: 0,
        operational: 0,
        monthly: 0,
        annual: 0,
        breakdown: {}
      };
    }

    // Custos de Pessoal
    const personnel = Object.values(financialData.costs.personnel || {}).reduce((total: number, category: any) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: any) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total + (typeof category === 'number' ? category : 0);
    }, 0);

    // Custos Operacionais (todas as outras categorias)
    const operationalCategories = [
      'facilities', 'utilities', 'medical', 'transportation', 'equipment',
      'marketing', 'administrative', 'insurance', 'regulatory', 'technology',
      'competitions', 'transfers', 'depreciation', 'hospitalityCosts'
    ];

    const operational = operationalCategories.reduce((total: number, categoryKey: string) => {
      const category = (financialData.costs as any)[categoryKey];
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: any) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total + (typeof category === 'number' ? category : 0);
    }, 0);

    const monthly = personnel + operational;
    const annual = monthly * 12;

    // Breakdown detalhado por categoria
    const breakdown: any = {
      personnel: { value: personnel, percentage: monthly > 0 ? (personnel / monthly) * 100 : 0 }
    };

    operationalCategories.forEach(categoryKey => {
      const category = (financialData.costs as any)[categoryKey];
      let categoryTotal = 0;
      if (typeof category === 'object' && category !== null) {
        categoryTotal = Object.values(category).reduce((sum: number, val: any) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      } else if (typeof category === 'number') {
        categoryTotal = category;
      }
      breakdown[categoryKey] = { 
        value: categoryTotal, 
        percentage: monthly > 0 ? (categoryTotal / monthly) * 100 : 0 
      };
    });

    return {
      personnel,
      operational,
      monthly,
      annual,
      breakdown
    };
  }, [financialData?.costs]);

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE DRE
  // =====================================================
  
  const dreCalculations = useMemo(() => {
    const receita = revenueCalculations.annual;
    const custos = costCalculations.annual;
    
    // DRE Simplificada
    const receitaBruta = receita;
    const custosOperacionais = custos;
    const lucroOperacional = receitaBruta - custosOperacionais;
    
    // Impostos
    const taxes = calculateTaxBurden(receitaBruta, lucroOperacional, market);
    const impostos = taxes.total || (lucroOperacional > 0 ? lucroOperacional * (market?.taxRate || 0.163) : 0);
    
    // Resultado final
    const lucroLiquido = lucroOperacional - impostos;
    const ebitda = lucroOperacional;
    const ebit = lucroOperacional;
    
    // Margens
    const margemBruta = receitaBruta > 0 ? (lucroOperacional / receitaBruta) * 100 : 0;
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
    const margemEbitda = receitaBruta > 0 ? (ebitda / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      custosOperacionais,
      lucroOperacional,
      impostos,
      lucroLiquido,
      ebitda,
      ebit,
      margemBruta,
      margemLiquida,
      margemEbitda,
      breakdown: {
        receitas: revenueCalculations.breakdown,
        custos: costCalculations.breakdown
      }
    };
  }, [revenueCalculations, costCalculations, market]);

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE FLUXO DE CAIXA
  // =====================================================
  
  const cashFlowCalculations = useMemo(() => {
    const lucroLiquido = dreCalculations.lucroLiquido;
    
    // Fluxo operacional
    const depreciacao = costCalculations.breakdown.depreciation?.value || 0;
    const fluxoOperacional = lucroLiquido + depreciacao;
    
    // Investimentos
    const investimentos = 0; // Será preenchido conforme necessário
    
    // Financiamentos
    const financiamentos = 0; // Será preenchido conforme necessário
    
    // Fluxo livre
    const fluxoLivre = fluxoOperacional - investimentos + financiamentos;
    
    return {
      fluxoOperacional,
      investimentos,
      financiamentos,
      fluxoLivre,
      saldoInicial: 0,
      saldoFinal: fluxoLivre
    };
  }, [dreCalculations, costCalculations]);

  // =====================================================
  // CÁLCULOS DE INVESTIMENTO E VIABILIDADE
  // =====================================================
  
  const investmentRequirements = useMemo(() => {
    return calculateInvestmentRequirements(market, club.numFields);
  }, [market, club.numFields]);

  // =====================================================
  // PROJEÇÕES AUTOMÁTICAS
  // =====================================================
  
  const projectionCalculations = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const projections = [];
    const growthRate = market?.growthPotential || 0.12;
    const inflationRate = market?.inflationRate || 0.06;

    for (let year = 0; year < 12; year++) {
      const projectedYear = currentYear + year;
      
      // Receitas com crescimento
      const annualRevenue = revenueCalculations.annual * Math.pow(1 + growthRate, year);
      
      // Custos com inflação
      const annualCosts = costCalculations.annual * Math.pow(1 + inflationRate, year);
      
      // Lucros
      const ebitda = annualRevenue - annualCosts;
      const taxes = Math.max(0, ebitda * (market?.taxRate || 0.163));
      const netProfit = ebitda - taxes;
      
      // Fluxo de caixa
      const cashFlow = {
        operational: netProfit,
        investment: year === 0 ? -investmentRequirements.total : 0,
        financing: 0,
        net: year === 0 ? netProfit - investmentRequirements.total : netProfit,
        accumulated: 0 // Será calculado depois
      };

      // Métricas financeiras
      const metrics = calculateFinancialRatios(
        annualRevenue,
        annualCosts,
        investmentRequirements.total,
        investmentRequirements.total * 0.3,
        investmentRequirements.total * 0.7,
        market?.taxRate || 0.163
      );

      projections.push({
        year: projectedYear,
        revenue: {
          total: annualRevenue,
          breakdown: {
            fieldRental: revenueCalculations.fieldRental * Math.pow(1 + growthRate, year),
            membership: revenueCalculations.membership * Math.pow(1 + growthRate, year),
            sponsorship: revenueCalculations.sponsorship * Math.pow(1 + growthRate, year),
            soccerSchool: revenueCalculations.soccerSchool * Math.pow(1 + growthRate, year),
            other: (revenueCalculations.merchandise + revenueCalculations.events + 
                   revenueCalculations.foodBeverage + revenueCalculations.other) * Math.pow(1 + growthRate, year)
          }
        },
        costs: {
          total: annualCosts,
          personnel: costCalculations.personnel * Math.pow(1 + inflationRate, year),
          operational: costCalculations.operational * Math.pow(1 + inflationRate, year)
        },
        taxes: {
          total: taxes,
          rate: market?.taxRate || 0.163
        },
        cashFlow,
        metrics: {
          ...metrics,
          ebitda,
          ebitdaMargin: annualRevenue > 0 ? ebitda / annualRevenue : 0,
          netMargin: annualRevenue > 0 ? netProfit / annualRevenue : 0,
          grossMargin: annualRevenue > 0 ? (annualRevenue - annualCosts) / annualRevenue : 0
        }
      });
    }

    // Calcular fluxo de caixa acumulado
    let accumulated = 0;
    projections.forEach(projection => {
      accumulated += projection.cashFlow.net;
      projection.cashFlow.accumulated = accumulated;
    });

    return projections;
  }, [revenueCalculations, costCalculations, market, investmentRequirements]);

  // =====================================================
  // ANÁLISE DE VIABILIDADE AUTOMÁTICA
  // =====================================================
  
  const viabilityAnalysis = useMemo(() => {
    const cashFlows = [-investmentRequirements.total, ...projectionCalculations.map(p => p.cashFlow.net)];
    const discountRate = market?.discountRate || 0.12;
    
    return calculateViabilityMetrics(cashFlows, discountRate);
  }, [projectionCalculations, investmentRequirements, market]);

  // =====================================================
  // KPIs AUTOMÁTICOS
  // =====================================================
  
  const kpiCalculations = useMemo(() => {
    const revenue = revenueCalculations.annual;
    const costs = costCalculations.annual;
    const assets = investmentRequirements.total;
    const currentProjection = projectionCalculations[0];

    return {
      financial: {
        totalRevenue: revenue,
        totalCosts: costs,
        netProfit: dreCalculations.lucroLiquido,
        ebitda: dreCalculations.ebitda,
        grossMargin: dreCalculations.margemBruta / 100,
        netMargin: dreCalculations.margemLiquida / 100,
        ebitdaMargin: dreCalculations.margemEbitda / 100,
        roa: assets > 0 ? dreCalculations.lucroLiquido / assets : 0,
        roe: assets > 0 ? dreCalculations.lucroLiquido / (assets * 0.7) : 0
      },
      operational: {
        fieldUtilization: 0.65, // Estimativa
        averageTicket: revenue > 0 ? revenue / (club.numFields * 365 * 8) : 0,
        occupancyRate: 0.65,
        revenuePerField: revenue / Math.max(club.numFields, 1),
        costPerField: costs / Math.max(club.numFields, 1)
      },
      investment: {
        npv: viabilityAnalysis.npv,
        irr: viabilityAnalysis.irr,
        paybackPeriod: viabilityAnalysis.paybackPeriod,
        roi: viabilityAnalysis.roi,
        breakEvenPoint: viabilityAnalysis.breakEvenPoint
      }
    };
  }, [revenueCalculations, costCalculations, dreCalculations, viabilityAnalysis, investmentRequirements, club.numFields]);

  // =====================================================
  // FUNÇÃO DE RECÁLCULO AUTOMÁTICO
  // =====================================================
  
  const recalculate = () => {
    console.log('🔄 Executando recálculo automático...');
    
    // Atualizar projeções no store
    setProjections(projectionCalculations as any);
    
    // Atualizar KPIs no store
    setKPIs(kpiCalculations as any);
    
    // Criar análise completa
    const analysis = {
      projections: projectionCalculations,
      viability: viabilityAnalysis,
      investment: investmentRequirements,
      dre: dreCalculations,
      cashFlow: cashFlowCalculations,
      kpis: kpiCalculations
    };
    
    setAnalysis(analysis as any);
    
    console.log('✅ Recálculo automático concluído');
    
    return {
      projections: projectionCalculations,
      analysis,
      kpis: kpiCalculations,
      revenues: revenueCalculations,
      costs: costCalculations,
      dre: dreCalculations,
      cashFlow: cashFlowCalculations,
      viability: viabilityAnalysis,
      investment: investmentRequirements
    };
  };

  // =====================================================
  // AUTO-RECÁLCULO QUANDO DADOS MUDAM
  // =====================================================
  
  useEffect(() => {
    // Recalcular automaticamente quando os dados financeiros mudarem
    if (financialData && Object.keys(financialData).length > 0) {
      const timeoutId = setTimeout(() => {
        recalculate();
      }, 500); // Debounce de 500ms para evitar recálculos excessivos

      return () => clearTimeout(timeoutId);
    }
  }, [financialData, market, club]);

  // =====================================================
  // FUNÇÕES DE CENÁRIOS
  // =====================================================
  
  const calculateScenarios = () => {
    const baseGrowth = market?.growthPotential || 0.12;
    
    return {
      pessimistic: { growth: baseGrowth * 0.5, description: 'Cenário conservador' },
      realistic: { growth: baseGrowth, description: 'Cenário base' },
      optimistic: { growth: baseGrowth * 1.5, description: 'Cenário otimista' }
    };
  };

  return {
    // Dados calculados
    revenues: revenueCalculations,
    costs: costCalculations,
    dre: dreCalculations,
    cashFlow: cashFlowCalculations,
    projections: projectionCalculations,
    viability: viabilityAnalysis,
    kpis: kpiCalculations,
    investment: investmentRequirements,
    
    // Funções
    recalculate,
    calculateScenarios,
    
    // Valores legados para compatibilidade
    baseFieldRevenue: revenueCalculations.annual,
    operationalCosts: costCalculations.annual,
    investmentRequirements,
    monthlyBreakEven: costCalculations.monthly
  };
} 
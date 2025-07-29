import { useMemo, useEffect, useCallback } from 'react';
import { useAppStore, useFinancialData } from '@/stores/useAppStore';
import {
  calculateFinancialRatios,
  calculateTaxBurden,
  calculateInvestmentRequirements,
  calculateViabilityMetrics,
} from '@/utils/financials/index';
import { FinancialProjection, InvestmentAnalysis, KPIData, StrategicKPIs, DetailedRevenue, DetailedOperationalCosts } from '@/types';
import type { CustomField } from '@/types';

export function useFinancialCalculations() {
  const { 
    club, 
    market, 
    setProjections, 
    setKPIs, 
    setAnalysis,
    setStrategicKPIs 
  } = useAppStore();
  const financialData = useFinancialData();

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE RECEITAS
  // =====================================================
  
  const revenueCalculations = useMemo(() => {
    if (!financialData?.revenues) {
      return {
        fieldRental: 0, membership: 0, sponsorship: 0, soccerSchool: 0,
        merchandise: 0, events: 0, foodBeverage: 0, other: 0,
        monthly: 0, annual: 0,
        breakdown: {}
      };
    }

    const getCategoryTotal = (category: Record<string, number>): number => 
      Object.values(category || {}).reduce((sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0), 0);

    const fieldRental = getCategoryTotal(financialData.revenues.fieldRental);
    const membership = getCategoryTotal(financialData.revenues.membership);
    const sponsorship = getCategoryTotal(financialData.revenues.sponsorship);
    const soccerSchool = getCategoryTotal(financialData.revenues.soccerSchool);
    const merchandise = getCategoryTotal(financialData.revenues.merchandise);
    const events = getCategoryTotal(financialData.revenues.events);
    const foodBeverage = getCategoryTotal(financialData.revenues.foodBeverage);
    
    const other = Array.isArray(financialData.revenues.customRevenues)
      ? (financialData.revenues.customRevenues as CustomField[])
          .reduce((sum: number, item: CustomField) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
      : 0;

    const monthly = fieldRental + membership + sponsorship + soccerSchool + merchandise + events + foodBeverage + other;
    const annual = monthly * 12;

    const createBreakdown = (value: number) => ({ value, percentage: monthly > 0 ? (value / monthly) * 100 : 0 });

    return {
      fieldRental, membership, sponsorship, soccerSchool, merchandise, events, foodBeverage, other,
      monthly, annual,
      breakdown: {
        fieldRental: createBreakdown(fieldRental),
        membership: createBreakdown(membership),
        sponsorship: createBreakdown(sponsorship),
        soccerSchool: createBreakdown(soccerSchool),
        other: createBreakdown(merchandise + events + foodBeverage + other)
      }
    };
  }, [financialData?.revenues]);

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE CUSTOS
  // =====================================================
  
  const costCalculations = useMemo(() => {
    if (!financialData?.costs) {
      return {
        personnel: 0, operational: 0, monthly: 0, annual: 0,
        breakdown: {}
      };
    }

    const personnel = Object.values(financialData.costs.personnel || {}).reduce((total: number, category: unknown) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: unknown) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total + (typeof category === 'number' ? category : 0);
    }, 0);

    const operationalCategories = [
      'facilities', 'utilities', 'medical', 'transportation', 'equipment',
      'marketing', 'administrative', 'insurance', 'regulatory', 'technology',
      'competitions', 'transfers', 'depreciation', 'hospitalityCosts'
    ];

    const operational = operationalCategories.reduce((total: number, categoryKey: string) => {
      const category = (financialData.costs as Record<string, unknown>)[categoryKey];
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: unknown) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total + (typeof category === 'number' ? category : 0);
    }, 0);

    const monthly = personnel + operational;
    const annual = monthly * 12;

    const breakdown: Record<string, { value: number; percentage: number }> = {
      personnel: { value: personnel, percentage: monthly > 0 ? (personnel / monthly) * 100 : 0 }
    };

    operationalCategories.forEach(categoryKey => {
      const category = (financialData.costs as Record<string, unknown>)[categoryKey];
      let categoryTotal = 0;
      if (typeof category === 'object' && category !== null) {
        categoryTotal = Object.values(category).reduce((sum: number, val: unknown) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      } else if (typeof category === 'number') {
        categoryTotal = category;
      }
      breakdown[categoryKey] = { 
        value: categoryTotal, 
        percentage: monthly > 0 ? (categoryTotal / monthly) * 100 : 0 
      };
    });

    return { personnel, operational, monthly, annual, breakdown };
  }, [financialData?.costs]);

  // =====================================================
  // CÁLCULOS AUTOMÁTICOS DE DRE
  // =====================================================
  
  const dreCalculations = useMemo(() => {
    const receita = revenueCalculations.annual;
    const custos = costCalculations.annual;
    
    const receitaBruta = receita;
    const custosOperacionais = custos;
    const lucroOperacional = receitaBruta - custosOperacionais;
    
    const taxes = calculateTaxBurden(receitaBruta, lucroOperacional, market);
    const impostos = taxes.total || (lucroOperacional > 0 ? lucroOperacional * (market?.taxRate || 0.163) : 0);
    
    const lucroLiquido = lucroOperacional - impostos;
    const ebitda = lucroOperacional;
    const ebit = lucroOperacional;
    
    const createMargin = (value: number) => receitaBruta > 0 ? (value / receitaBruta) * 100 : 0;

    return {
      receitaBruta, custosOperacionais, lucroOperacional, impostos, lucroLiquido, ebitda, ebit,
      margemBruta: createMargin(lucroOperacional),
      margemLiquida: createMargin(lucroLiquido),
      margemEbitda: createMargin(ebitda),
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
    const depreciacao = costCalculations.breakdown.depreciation?.value || 0;
    const fluxoOperacional = lucroLiquido + depreciacao;
    const investimentos = 0;
    const financiamentos = 0;
    const fluxoLivre = fluxoOperacional - investimentos + financiamentos;
    
    return { fluxoOperacional, investimentos, financiamentos, fluxoLivre, saldoInicial: 0, saldoFinal: fluxoLivre };
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
  
  const projectionCalculations = useMemo((): FinancialProjection[] => {
    const currentYear = new Date().getFullYear();
    const projections: FinancialProjection[] = [];
    const growthRate = market?.growthPotential || 0.12;
    const inflationRate = market?.inflationRate || 0.06;

    for (let year = 0; year < 12; year++) {
      const annualRevenue = revenueCalculations.annual * Math.pow(1 + growthRate, year);
      const annualCosts = costCalculations.annual * Math.pow(1 + inflationRate, year);
      const ebitda = annualRevenue - annualCosts;
      const taxes = Math.max(0, ebitda * (market?.taxRate || 0.163));
      const netProfit = ebitda - taxes;

      const cashFlow = {
        operational: netProfit,
        investment: year === 0 ? -investmentRequirements.total : 0,
        financing: 0,
        net: year === 0 ? netProfit - investmentRequirements.total : netProfit,
        accumulated: 0
      };

      const metrics = calculateFinancialRatios(
        annualRevenue, annualCosts, investmentRequirements.total,
        investmentRequirements.total * 0.3, investmentRequirements.total * 0.7, market?.taxRate || 0.163
      );
      
      const revenueBreakdown = revenueCalculations.breakdown;
      const detailedRevenue: DetailedRevenue = {
        fieldRental: { total: (revenueBreakdown.fieldRental?.value || 0), regularRentals: 0, tournaments: 0, corporateEvents: 0, seasonalAdjustment: 0 },
        membership: { total: (revenueBreakdown.membership?.value || 0), monthlyFees: 0, annualFees: 0, initationFees: 0, familyPackages: 0, corporateMembers: 0 },
        sponsorship: { total: (revenueBreakdown.sponsorship?.value || 0), mainSponsor: 0, jerseySponsors: 0, facilityNaming: 0, equipmentSponsors: 0, eventSponsors: 0, digitalSponsors: 0 },
        soccerSchool: { total: (revenueBreakdown.soccerSchool?.value || 0), monthlyTuition: 0, enrollmentFees: 0, camps: 0, privateClasses: 0, tournaments: 0 },
        merchandise: { total: (revenueBreakdown.other?.value || 0), jerseys: 0, accessories: 0, souvenirs: 0, equipment: 0 },
        events: { total: 0, corporateEvents: 0, privateParties: 0, tournaments: 0, camps: 0, other: 0 },
        foodBeverage: { total: 0, restaurant: 0, bar: 0, snackBar: 0, catering: 0, vending: 0 },
        other: [],
        total: annualRevenue,
      };

      const costBreakdown = costCalculations.breakdown;
      const detailedCosts: DetailedOperationalCosts = {
          personnel: { total: (costBreakdown.personnel?.value || 0), technicalStaff: { total: 0, headCoach: 0, assistantCoaches: 0, physicalTrainer: 0, goalkeeper: 0, analyst: 0, other: 0 }, players: { total: 0, salaries: 0, bonuses: 0, benefits: 0, laborCharges: 0, medicalInsurance: 0 }, administrativeStaff: { total: 0, management: 0, accounting: 0, legal: 0, hr: 0, marketing: 0, other: 0 }, supportStaff: { total: 0, security: 0, cleaning: 0, maintenance: 0, reception: 0, other: 0 } },
          facilities: { total: (costBreakdown.facilities?.value || 0), maintenance: 0, cleaning: 0, security: 0, landscaping: 0, repairs: 0 },
          utilities: { total: (costBreakdown.utilities?.value || 0), electricity: 0, water: 0, gas: 0, internet: 0, phone: 0, waste: 0 },
          equipment: { total: (costBreakdown.equipment?.value || 0), fieldsEquipment: 0, sportsEquipment: 0, technology: 0, vehicles: 0, other: 0 },
          marketing: { total: (costBreakdown.marketing?.value || 0), digitalMarketing: 0, traditionalMedia: 0, events: 0, sponsorships: 0, materials: 0 },
          administrative: { total: (costBreakdown.administrative?.value || 0), accounting: 0, legal: 0, consulting: 0, software: 0, officeSupplies: 0, banking: 0 },
          insurance: { total: (costBreakdown.insurance?.value || 0), property: 0, liability: 0, equipmentInsurance: 0, workersCompensation: 0, other: 0 },
          regulatory: { total: (costBreakdown.regulatory?.value || 0), licenses: 0, inspections: 0, compliance: 0, taxes: 0, other: 0 },
          medical: { total: 0, teamDoctor: 0, physiotherapy: 0, supplements: 0, medicalExams: 0, treatments: 0 },
          transportation: { total: 0, teamTransport: 0, accommodation: 0, meals: 0, fuel: 0, vehicleMaintenance: 0 },
          hospitality: { total: 0, guestMeals: 0, entertainment: 0, gifts: 0, events: 0 },
          maintenance: { total: 0, preventive: 0, corrective: 0, supplies: 0, contracts: 0 },
          technology: { total: 0, software: 0, hardware: 0, telecommunications: 0, support: 0 },
          other: [],
          total: annualCosts,
      };

      projections.push({
        year: currentYear + year,
        revenue: detailedRevenue,
        costs: detailedCosts,
        taxes: { total: taxes, corporateTax: taxes, vat: 0, socialContributions: 0, municipalTaxes: 0 },
        cashFlow,
        metrics: { ...metrics, ebitda, netProfit }
      });
    }

    let accumulated = 0;
    projections.forEach(p => {
      accumulated += p.cashFlow.net;
      p.cashFlow.accumulated = accumulated;
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
    const assets = investmentRequirements.total;

    const financial: KPIData = {
      revenue: { name: 'Receita Anual', value: revenue, unit: 'R$', trend: 'stable', target: 0, benchmark: 0 },
      profitability: { name: 'Margem Líquida', value: dreCalculations.margemLiquida, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
      efficiency: { name: 'Giro do Ativo', value: assets > 0 ? revenue / assets : 0, unit: 'x', trend: 'stable', target: 0, benchmark: 0 },
      financial: { name: 'ROE', value: assets > 0 ? dreCalculations.lucroLiquido / (assets * 0.7) : 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
    };

    const strategic: StrategicKPIs = {
      financial: {
        revenueGrowthRate: { name: 'Crescimento da Receita', value: market.growthPotential, unit: '%', trend: 'up', target: 0.1, benchmark: 0.08 },
        profitMargin: { name: 'Margem de Lucro', value: dreCalculations.margemLiquida / 100, unit: '%', trend: 'up', target: 0.15, benchmark: 0.12 },
        cashFlowMargin: { name: 'Margem de Fluxo de Caixa', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        returnOnAssets: { name: 'ROA', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        returnOnEquity: { name: 'ROE', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        debtToEquityRatio: { name: 'Dívida/PL', value: 0, unit: 'x', trend: 'stable', target: 0, benchmark: 0 },
        breakEvenPoint: { name: 'Ponto de Equilíbrio', value: 0, unit: 'meses', trend: 'stable', target: 0, benchmark: 0 },
      },
      operational: {
        fieldUtilizationRate: { name: 'Taxa de Ocupação', value: 0.65, unit: '%', trend: 'up', target: 0.75, benchmark: 0.7 },
        averageRevenuePerField: { name: 'Receita por Campo', value: 0, unit: 'R$', trend: 'stable', target: 0, benchmark: 0 },
        membershipRetentionRate: { name: 'Retenção de Membros', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        staffProductivity: { name: 'Produtividade Equipe', value: 0, unit: 'x', trend: 'stable', target: 0, benchmark: 0 },
        maintenanceCostRatio: { name: 'Custo Manut./Receita', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        energyEfficiency: { name: 'Eficiência Energética', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
      },
      customer: {
        customerSatisfactionScore: { name: 'CSAT', value: 85, unit: '%', trend: 'up', target: 90, benchmark: 80 },
        netPromoterScore: { name: 'NPS', value: 0, unit: '', trend: 'stable', target: 0, benchmark: 0 },
        averageCustomerLifetime: { name: 'LTV', value: 0, unit: 'meses', trend: 'stable', target: 0, benchmark: 0 },
        membershipGrowthRate: { name: 'Cresc. Membros', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        churnRate: { name: 'Churn', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        averageRevenuePerCustomer: { name: 'ARPU', value: 0, unit: 'R$', trend: 'stable', target: 0, benchmark: 0 },
      },
      growth: {
        membershipGrowth: { name: 'Crescimento de Membros', value: 0.1, unit: '%', trend: 'up', target: 0.12, benchmark: 0.09 },
        revenueGrowth: { name: 'Cresc. Receita', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        marketExpansion: { name: 'Expansão de Mercado', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        facilityExpansion: { name: 'Expansão de Campos', value: 0, unit: 'un', trend: 'stable', target: 0, benchmark: 0 },
      },
      sustainability: {
        energyEfficiency: { name: 'Eficiência Energética', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        wasteReduction: { name: 'Redução de Resíduos', value: 0, unit: '%', trend: 'stable', target: 0, benchmark: 0 },
        waterUsage: { name: 'Uso de Água', value: 0, unit: 'm3', trend: 'stable', target: 0, benchmark: 0 },
        carbonFootprint: { name: 'Pegada de Carbono', value: 0, unit: 'tCO2', trend: 'stable', target: 0, benchmark: 0 },
      }
    };
    
    return { financial, strategic };
  }, [revenueCalculations, dreCalculations, investmentRequirements, market.growthPotential]);

  // =====================================================
  // FUNÇÃO DE RECÁLCULO AUTOMÁTICO
  // =====================================================
  
  const recalculate = useCallback(() => {
    setProjections(projectionCalculations);
    setKPIs(kpiCalculations.financial);
    setStrategicKPIs(kpiCalculations.strategic);

    const analysis: InvestmentAnalysis = {
      initialInvestment: investmentRequirements,
      projections: projectionCalculations,
      valuation: viabilityAnalysis,
      sensitivity: { variables: [], results: [] },
      scenarios: { optimistic: [], realistic: [], pessimistic: [], monteCarloResults: [] },
    };
    
    setAnalysis(analysis);
  }, [projectionCalculations, kpiCalculations, investmentRequirements, viabilityAnalysis, setProjections, setKPIs, setStrategicKPIs, setAnalysis]);

  // =====================================================
  // AUTO-RECÁLCULO QUANDO DADOS MUDAM
  // =====================================================
  
  useEffect(() => {
    if (financialData && Object.keys(financialData).length > 0) {
      const timeoutId = setTimeout(() => {
        recalculate();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [financialData, market, club, recalculate]);

  // =====================================================
  // FUNÇÕES DE CENÁRIOS
  // =====================================================
  
  const calculateScenarios = useCallback(() => {
    const baseGrowth = market?.growthPotential || 0.12;
    return {
      pessimistic: { growth: baseGrowth * 0.5, description: 'Cenário conservador' },
      realistic: { growth: baseGrowth, description: 'Cenário base' },
      optimistic: { growth: baseGrowth * 1.5, description: 'Cenário otimista' }
    };
  }, [market?.growthPotential]);

  return useMemo(() => ({
    revenues: revenueCalculations,
    costs: costCalculations,
    dre: dreCalculations,
    cashFlow: cashFlowCalculations,
    projections: projectionCalculations,
    viability: viabilityAnalysis,
    kpis: {
      financial: kpiCalculations.financial,
      strategic: kpiCalculations.strategic
    },
    investment: investmentRequirements,
    recalculate,
    calculateScenarios,
  }), [
    revenueCalculations, costCalculations, dreCalculations, cashFlowCalculations,
    projectionCalculations, viabilityAnalysis, kpiCalculations, investmentRequirements,
    recalculate, calculateScenarios
  ]);
} 
import { useState, useEffect, useCallback } from 'react';
import { financialEngine } from '@/lib/financial-engine';
import { FinancialVariable, FinancialMetrics, FinancialProjection, ValidationResult } from '@/types';

export const useFinancialEngine = () => {
  const [variables, setVariables] = useState<FinancialVariable[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({ totalRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: 0, breakEvenPoint: 0, roi: 0 });
  const [projections, setProjections] = useState<FinancialProjection[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isCalculating, setIsCalculating] = useState(false);

  const recalculate = useCallback(async (force: boolean = false) => {
    if (!financialEngine) return;
    setIsCalculating(true);
    try {
      const result = await financialEngine.recalculate(force);
      if (result) {
        setVariables(result.variables);
        setMetrics(result.metrics);
        setProjections(result.projections);
        setValidation(result.validation);
      }
    } finally {
      setIsCalculating(false);
    }
  }, []);

  useEffect(() => {
    if (financialEngine) {
      recalculate(true);
    }
  }, [recalculate]);

  const summary = {
    totalRevenue: metrics.totalRevenue,
    netProfit: metrics.netProfit,
    monthlyRevenue: projections.map(p => p.revenue),
    monthlyCosts: projections.map(p => p.costs),
    monthlyProfit: projections.map(p => p.profit),
    annualProjection: { growth: 0.1, revenue: 1200000 }, // Exemplo
    averageGrowthRate: 0.1, // Exemplo
  };

  const hasValidData = validation.isValid;
  const isProfitable = metrics.netProfit > 0;

  const getVariable = (id: string) => variables.find(v => v.id === id);
  const generateScenarios = (options: any) => { /* Lógica de Cenários */ };
  const sensitivityAnalysis = (options: any) => { /* Lógica de Análise de Sensibilidade */ };
  const calculateBreakEven = () => ({ hoursNeeded: 100, daysToBreakEven: 12 }); // Exemplo

  return {
    variables,
    metrics,
    projections,
    validation,
    isCalculating,
    recalculate,
    summary,
    hasValidData,
    isProfitable,
    getVariable,
    generateScenarios,
    sensitivityAnalysis,
    calculateBreakEven,
  };
};

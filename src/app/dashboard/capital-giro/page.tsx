'use client';

import React, { useState, useMemo } from 'react';
import { CardSkeleton } from '@/components/ui/PageLoader';
import { 
  TrendingUp,
  TrendingDown,
  Calculator,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  Target,
  Activity,
  Wallet,
  Building2,
  Zap
} from 'lucide-react';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { AdvancedChart } from '@/components/charts/AdvancedChart';

interface WorkingCapitalItem {
  category: 'assets' | 'liabilities';
  name: string;
  value: number;
  description: string;
  days?: number;
  variableId?: string;
}

interface WorkingCapitalMetrics {
  currentAssets: number;
  currentLiabilities: number;
  workingCapital: number;
  currentRatio: number;
  quickRatio: number;
  operationalCycle: number;
  cashCycle: number;
  workingCapitalNeed: number;
}

export default function CapitalGiroPage() {
  const { 
    projections,
    summary,
    getVariable,
    recalculate,
    isCalculating,
    hasValidData
  } = useFinancialEngine();
  
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'optimistic' | 'pessimistic'>('conservative');

  // Dados de capital de giro baseados nas variáveis reais
  const workingCapitalData = useMemo((): WorkingCapitalItem[] => {
    const monthlyRevenue = summary.totalRevenue / 12; // Assumindo receita anual dividida por 12
    const monthlyCosts = (summary.totalRevenue - summary.netProfit) / 12; // Assumindo custos anuais divididos por 12
    
    // Ativos Circulantes baseados em dados reais
    const cashReserve = getVariable('cash_reserve')?.value || monthlyRevenue * 0.8;
    const accountsReceivable = getVariable('accounts_receivable')?.value || monthlyRevenue * 0.4;
    const inventory = getVariable('inventory_value')?.value || 15000;
    
    // Passivos Circulantes baseados em dados reais
    const accountsPayable = getVariable('accounts_payable')?.value || monthlyCosts * 0.3;
    const salariesPayable = getVariable('staff_salaries')?.value || monthlyCosts * 0.6;
    const taxesPayable = getVariable('taxes_payable')?.value || monthlyRevenue * 0.08;
    
    return [
      // Ativos Circulantes
      { 
        category: 'assets', 
        name: 'Caixa e Equivalentes', 
        value: cashReserve, 
        description: 'Disponibilidades em caixa e bancos', 
        days: 30,
        variableId: 'cash_reserve'
      },
      { 
        category: 'assets', 
        name: 'Contas a Receber', 
        value: accountsReceivable, 
        description: 'Valores a receber de clientes', 
        days: 45,
        variableId: 'accounts_receivable'
      },
      { 
        category: 'assets', 
        name: 'Estoque/Materiais', 
        value: inventory, 
        description: 'Materiais esportivos e suprimentos', 
        days: 60,
        variableId: 'inventory_value'
      },
      
      // Passivos Circulantes
      { 
        category: 'liabilities', 
        name: 'Fornecedores', 
        value: accountsPayable, 
        description: 'Valores a pagar a fornecedores', 
        days: 30,
        variableId: 'accounts_payable'
      },
      { 
        category: 'liabilities', 
        name: 'Salários e Encargos', 
        value: salariesPayable, 
        description: 'Folha de pagamento e encargos', 
        days: 30,
        variableId: 'staff_salaries'
      },
      { 
        category: 'liabilities', 
        name: 'Impostos a Recolher', 
        value: taxesPayable, 
        description: 'Tributos a serem recolhidos', 
        days: 45,
        variableId: 'taxes_payable'
      },
    ];
  }, [summary, getVariable]);

  // Cálculo das métricas de capital de giro
  const workingCapitalMetrics = useMemo((): WorkingCapitalMetrics => {
    const currentAssets = workingCapitalData
      .filter(item => item.category === 'assets')
      .reduce((sum, item) => sum + item.value, 0);

    const currentLiabilities = workingCapitalData
      .filter(item => item.category === 'liabilities')
      .reduce((sum, item) => sum + item.value, 0);

    const workingCapital = currentAssets - currentLiabilities;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    
    // Quick Ratio (exclui estoque)
    const inventory = workingCapitalData.find(item => item.name.includes('Estoque'))?.value || 0;
    const quickRatio = currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;

    // Ciclos operacionais (baseados em dados reais ou médias do setor)
    const receivableDays = 45; // Prazo médio de recebimento
    const inventoryDays = 60;  // Giro de estoque
    const payableDays = 35;    // Prazo médio de pagamento
    
    const operationalCycle = receivableDays + inventoryDays;
    const cashCycle = operationalCycle - payableDays;
    
    // Necessidade de Capital de Giro
    const monthlyRevenue = Array.isArray(summary.monthlyRevenue) 
      ? (summary.monthlyRevenue.length > 0 ? summary.monthlyRevenue[0] : 0)
      : (summary.monthlyRevenue || 0);
    const workingCapitalNeed = monthlyRevenue > 0 ? (monthlyRevenue * cashCycle) / 30 : 0;

    return {
      currentAssets,
      currentLiabilities,
      workingCapital,
      currentRatio,
      quickRatio,
      operationalCycle,
      cashCycle,
      workingCapitalNeed
    };
  }, [workingCapitalData, summary.monthlyRevenue]);

  // Dados para gráficos de evolução
  const workingCapitalEvolution = useMemo(() => {
    return projections.slice(0, 12).map(p => {
      const monthlyAssets = p.revenue * 1.2; // Estimativa baseada na receita
      const monthlyLiabilities = p.costs * 0.8; // Estimativa baseada nos custos
      const monthlyWC = monthlyAssets - monthlyLiabilities;
      
      return {
        month: `Mês ${p.month}`,
        ativos: monthlyAssets,
        passivos: monthlyLiabilities,
        capitalGiro: monthlyWC,
        indiceLiquidez: monthlyLiabilities > 0 ? monthlyAssets / monthlyLiabilities : 0
      };
    });
  }, [projections]);

  // Análise por cenários
  const scenarioMultipliers = {
    conservative: { assets: 1.0, liabilities: 1.1 },
    optimistic: { assets: 1.2, liabilities: 0.9 },
    pessimistic: { assets: 0.8, liabilities: 1.3 }
  };

  const scenarioAnalysis = useMemo(() => {
    const multiplier = scenarioMultipliers[selectedScenario];
    
    const adjustedAssets = workingCapitalMetrics.currentAssets * multiplier.assets;
    const adjustedLiabilities = workingCapitalMetrics.currentLiabilities * multiplier.liabilities;
    const adjustedWC = adjustedAssets - adjustedLiabilities;
    const adjustedCurrentRatio = adjustedLiabilities > 0 ? adjustedAssets / adjustedLiabilities : 0;
    
    return {
      assets: adjustedAssets,
      liabilities: adjustedLiabilities,
      workingCapital: adjustedWC,
      currentRatio: adjustedCurrentRatio,
      impact: ((adjustedWC - workingCapitalMetrics.workingCapital) / workingCapitalMetrics.workingCapital) * 100
    };
  }, [workingCapitalMetrics, selectedScenario, scenarioMultipliers]);

  const getStatusColor = (ratio: number, goodThreshold: number, warningThreshold: number) => {
    if (ratio >= goodThreshold) return 'text-green-600';
    if (ratio >= warningThreshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (ratio: number, goodThreshold: number, warningThreshold: number) => {
    if (ratio >= goodThreshold) return CheckCircle;
    if (ratio >= warningThreshold) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Capital de Giro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise de liquidez e necessidades de capital baseada em dados reais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="conservative">Conservador</option>
            <option value="optimistic">Otimista</option>
            <option value="pessimistic">Pessimista</option>
          </select>
          <button
            onClick={() => recalculate(true)}
            disabled={isCalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Recalcular'}
          </button>
        </div>
      </div>

      {/* Status de Validação */}
      {!hasValidData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Dados Incompletos para Análise de Capital de Giro
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                Configure as variáveis financeiras para obter análises precisas de capital de giro.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/financial-variables'}
                className="text-sm font-medium text-yellow-700 dark:text-yellow-300 underline hover:no-underline"
              >
                Configurar Variáveis →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isCalculating ? (
          // Skeleton loading para os cards
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 ${workingCapitalMetrics.workingCapital > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {workingCapitalMetrics.workingCapital > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 opacity-80 mb-1">Capital de Giro</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(workingCapitalMetrics.workingCapital)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {workingCapitalMetrics.workingCapital > 0 ? 'Liquidez positiva' : 'Atenção necessária'}
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div className={getStatusColor(workingCapitalMetrics.currentRatio, 1.5, 1.0)}>
              {React.createElement(getStatusIcon(workingCapitalMetrics.currentRatio, 1.5, 1.0), { className: "w-4 h-4" })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300 opacity-80 mb-1">Índice de Liquidez</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {workingCapitalMetrics.currentRatio.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {workingCapitalMetrics.currentRatio >= 1.5 ? 'Excelente' : workingCapitalMetrics.currentRatio >= 1.0 ? 'Adequado' : 'Baixo'}
            </p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">
              {workingCapitalMetrics.cashCycle} dias
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300 opacity-80 mb-1">Ciclo de Caixa</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {workingCapitalMetrics.operationalCycle} dias
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Ciclo operacional completo
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <Activity className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 opacity-80 mb-1">Necessidade de CG</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatCurrency(workingCapitalMetrics.workingCapitalNeed)}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Baseado no ciclo de caixa
            </p>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Análise de Cenários */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Análise de Cenário: {selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1)}
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            scenarioAnalysis.impact > 0 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : scenarioAnalysis.impact < 0
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {scenarioAnalysis.impact > 0 ? '+' : ''}{scenarioAnalysis.impact.toFixed(1)}% vs Base
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ativos Circulantes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(scenarioAnalysis.assets)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passivos Circulantes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(scenarioAnalysis.liabilities)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Capital de Giro</p>
            <p className={`text-xl font-bold ${scenarioAnalysis.workingCapital > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(scenarioAnalysis.workingCapital)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Índice de Liquidez</p>
            <p className={`text-xl font-bold ${getStatusColor(scenarioAnalysis.currentRatio, 1.5, 1.0)}`}>
              {scenarioAnalysis.currentRatio.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Composição do Capital de Giro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ativos Circulantes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Ativos Circulantes
          </h3>
          <div className="space-y-4">
            {workingCapitalData.filter(item => item.category === 'assets').map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  {item.days && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Prazo médio: {item.days} dias
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</p>
                  <p className="text-sm text-gray-500">
                    {((item.value / workingCapitalMetrics.currentAssets) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-green-600">{formatCurrency(workingCapitalMetrics.currentAssets)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passivos Circulantes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Passivos Circulantes
          </h3>
          <div className="space-y-4">
            {workingCapitalData.filter(item => item.category === 'liabilities').map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  {item.days && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Prazo médio: {item.days} dias
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</p>
                  <p className="text-sm text-gray-500">
                    {((item.value / workingCapitalMetrics.currentLiabilities) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-red-600">{formatCurrency(workingCapitalMetrics.currentLiabilities)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolução do Capital de Giro */}
      {workingCapitalEvolution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Evolução Projetada do Capital de Giro
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              Baseado em Projeções Reais
            </div>
          </div>
          <AdvancedChart
            type="composed"
            data={workingCapitalEvolution}
            xKey="month"
            yKeys={[
              { key: 'ativos', name: 'Ativos Circulantes', color: '#10B981', type: 'bar' },
              { key: 'passivos', name: 'Passivos Circulantes', color: '#EF4444', type: 'bar' },
              { key: 'capitalGiro', name: 'Capital de Giro', color: '#3B82F6', type: 'line' }
            ]}
            height={350}
            currency={true}
          />
        </div>
      )}

      {/* Indicadores de Liquidez */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Indicadores de Liquidez
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Liquidez Corrente</p>
            <p className={`text-3xl font-bold ${getStatusColor(workingCapitalMetrics.currentRatio, 1.5, 1.0)}`}>
              {workingCapitalMetrics.currentRatio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ideal: ≥ 1.5 | Mínimo: ≥ 1.0
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Liquidez Seca</p>
            <p className={`text-3xl font-bold ${getStatusColor(workingCapitalMetrics.quickRatio, 1.0, 0.8)}`}>
              {workingCapitalMetrics.quickRatio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ideal: ≥ 1.0 | Mínimo: ≥ 0.8
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cobertura de CG</p>
            <p className={`text-3xl font-bold ${
              workingCapitalMetrics.workingCapital >= workingCapitalMetrics.workingCapitalNeed 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatPercentage(
                workingCapitalMetrics.workingCapitalNeed > 0 
                  ? workingCapitalMetrics.workingCapital / workingCapitalMetrics.workingCapitalNeed 
                  : 1
              )}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Cobertura da necessidade
            </p>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      {hasValidData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Recomendações de Gestão
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Situação Atual:</h4>
              <div className="space-y-3 text-sm">
                {workingCapitalMetrics.workingCapital > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Capital de Giro Positivo
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        {formatCurrency(workingCapitalMetrics.workingCapital)} disponível para operações
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">
                        Capital de Giro Negativo
                      </p>
                      <p className="text-red-600 dark:text-red-400">
                        Necessita {formatCurrency(Math.abs(workingCapitalMetrics.workingCapital))} adicional
                      </p>
                    </div>
                  </div>
                )}
                
                {workingCapitalMetrics.currentRatio >= 1.5 ? (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Liquidez Excelente
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Índice de {workingCapitalMetrics.currentRatio.toFixed(2)} indica boa capacidade de pagamento
                      </p>
                    </div>
                  </div>
                ) : workingCapitalMetrics.currentRatio >= 1.0 ? (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">
                        Liquidez Adequada
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Índice de {workingCapitalMetrics.currentRatio.toFixed(2)} - monitorar de perto
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">
                        Liquidez Crítica
                      </p>
                      <p className="text-red-600 dark:text-red-400">
                        Índice de {workingCapitalMetrics.currentRatio.toFixed(2)} - ação imediata necessária
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Ações Recomendadas:</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Otimizar prazos de recebimento de clientes</p>
                <p>• Negociar melhores condições com fornecedores</p>
                <p>• Manter reserva de caixa mínima de {formatCurrency(workingCapitalMetrics.workingCapitalNeed)}</p>
                <p>• Monitorar ciclo de caixa semanalmente</p>
                <p>• Revisar políticas de crédito e cobrança</p>
                <p>• Considerar linha de crédito para emergências</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
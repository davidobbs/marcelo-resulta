'use client';

import { useState } from 'react';
import { 
  Banknote,
  TrendingUp,
  TrendingDown,
  Calculator,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  RefreshCw,
  BarChart3,
  Download,
  PieChart,
  Clock,
  Target
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface CapitalGiroItem {
  category: 'assets' | 'liabilities';
  name: string;
  value: number;
  description: string;
  days?: number;
}

export default function CapitalGiroPage() {
  const { recalculate } = useFinancialCalculations();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [scenario, setScenario] = useState<'conservative' | 'optimistic' | 'pessimistic'>('conservative');

  // Dados de exemplo para demonstração
  const workingCapitalData: CapitalGiroItem[] = [
    // Ativos Circulantes
    { category: 'assets', name: 'Caixa e Equivalentes', value: 85000, description: 'Disponibilidades em conta corrente e aplicações', days: 30 },
    { category: 'assets', name: 'Contas a Receber', value: 45000, description: 'Mensalidades e patrocínios a receber', days: 45 },
    { category: 'assets', name: 'Estoque', value: 12000, description: 'Materiais esportivos e equipamentos', days: 60 },
    
    // Passivos Circulantes
    { category: 'liabilities', name: 'Fornecedores', value: 28000, description: 'Contas a pagar para fornecedores', days: 30 },
    { category: 'liabilities', name: 'Salários e Encargos', value: 52000, description: 'Folha de pagamento e benefícios', days: 30 },
    { category: 'liabilities', name: 'Impostos a Recolher', value: 15000, description: 'Tributos municipais, estaduais e federais', days: 45 },
    { category: 'liabilities', name: 'Empréstimos CP', value: 25000, description: 'Financiamentos de curto prazo', days: 90 }
  ];

  const currentAssets = workingCapitalData
    .filter(item => item.category === 'assets')
    .reduce((sum, item) => sum + item.value, 0);

  const currentLiabilities = workingCapitalData
    .filter(item => item.category === 'liabilities')
    .reduce((sum, item) => sum + item.value, 0);

  const workingCapital = currentAssets - currentLiabilities;
  const currentRatio = currentAssets / currentLiabilities;
  const quickRatio = (currentAssets - workingCapitalData.find(item => item.name === 'Estoque')!.value) / currentLiabilities;

  // Cálculo do ciclo operacional
  const averageReceivableDays = 45;
  const averageInventoryDays = 60;
  const averagePayableDays = 35;
  const operationalCycle = averageReceivableDays + averageInventoryDays;
  const cashCycle = operationalCycle - averagePayableDays;

  // Necessidade de Capital de Giro
  const monthlyRevenue = 108000;
  const workingCapitalNeed = (monthlyRevenue * cashCycle) / 30;

  const getScenarioMultiplier = () => {
    switch (scenario) {
      case 'optimistic': return 0.8;
      case 'pessimistic': return 1.3;
      default: return 1.0;
    }
  };

  const adjustedWorkingCapitalNeed = workingCapitalNeed * getScenarioMultiplier();

  const getStatusColor = (ratio: number, threshold: number) => {
    if (ratio >= threshold) return 'text-green-600';
    if (ratio >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (ratio: number, threshold: number) => {
    if (ratio >= threshold) return CheckCircle;
    if (ratio >= threshold * 0.8) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Banknote className="h-8 w-8 text-blue-600" />
              Capital de Giro
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise e gestão do capital de giro operacional do clube
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={recalculate} className="btn-primary flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recalcular
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="form-group">
                <label className="form-label">Período de Análise</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="form-select"
                >
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cenário</label>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as any)}
                  className="form-select"
                >
                  <option value="conservative">Conservador</option>
                  <option value="optimistic">Otimista</option>
                  <option value="pessimistic">Pessimista</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </button>
              <button className="btn-outline flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Gráficos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Capital de Giro</p>
              <p className={`metric-value ${workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(workingCapital)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {workingCapital >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Índice de Liquidez</p>
              <p className={`metric-value ${getStatusColor(currentRatio, 1.5)}`}>
                {currentRatio.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ideal: ≥ 1,5
              </p>
            </div>
            {getStatusIcon(currentRatio, 1.5) === CheckCircle ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Liquidez Seca</p>
              <p className={`metric-value ${getStatusColor(quickRatio, 1.0)}`}>
                {quickRatio.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ideal: ≥ 1,0
              </p>
            </div>
            {getStatusIcon(quickRatio, 1.0) === CheckCircle ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Ciclo de Caixa</p>
              <p className="metric-value text-blue-600">{cashCycle} dias</p>
              <p className="text-xs text-gray-500 mt-1">
                {cashCycle <= 30 ? 'Excelente' : cashCycle <= 60 ? 'Bom' : 'Atenção'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Working Capital Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ativos Circulantes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-green-700">Ativos Circulantes</h2>
            <p className="text-sm text-gray-600">Total: {formatCurrency(currentAssets)}</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {workingCapitalData
                .filter(item => item.category === 'assets')
                .map((item, index) => (
                  <div key={index} className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-green-800 dark:text-green-200">
                        {item.name}
                      </h3>
                      <span className="font-bold text-green-600">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">
                        {formatPercentage(item.value / currentAssets)} do total
                      </span>
                      {item.days && (
                        <span className="text-green-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.days} dias
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Passivos Circulantes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-red-700">Passivos Circulantes</h2>
            <p className="text-sm text-gray-600">Total: {formatCurrency(currentLiabilities)}</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {workingCapitalData
                .filter(item => item.category === 'liabilities')
                .map((item, index) => (
                  <div key={index} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-red-800 dark:text-red-200">
                        {item.name}
                      </h3>
                      <span className="font-bold text-red-600">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-600">
                        {formatPercentage(item.value / currentLiabilities)} do total
                      </span>
                      {item.days && (
                        <span className="text-red-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.days} dias
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operating Cycle Analysis */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Análise do Ciclo Operacional</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Ciclo Operacional
              </h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {operationalCycle} dias
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Recebimento + Estoque
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Ciclo de Caixa
              </h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {cashCycle} dias
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Operacional - Pagamento
              </p>
            </div>

            <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Necessidade CDG
              </h3>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {formatCurrency(adjustedWorkingCapitalNeed)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Cenário {scenario}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Fórmulas dos Ciclos:
            </h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Ciclo Operacional:</strong> Prazo Médio Recebimento + Prazo Médio Estoque</p>
              <p><strong>Ciclo de Caixa:</strong> Ciclo Operacional - Prazo Médio Pagamento</p>
              <p><strong>Necessidade CDG:</strong> (Receita Mensal × Ciclo de Caixa) ÷ 30 dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Análise de Cenários</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Cenário</th>
                  <th className="table-header-cell text-right">Necessidade CDG</th>
                  <th className="table-header-cell text-right">Gap Atual</th>
                  <th className="table-header-cell text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Otimista</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium">
                    {formatCurrency(workingCapitalNeed * 0.8)}
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-medium ${workingCapital - (workingCapitalNeed * 0.8) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(workingCapital - (workingCapitalNeed * 0.8))}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    {workingCapital - (workingCapitalNeed * 0.8) >= 0 ? (
                      <span className="status-indicator success">Adequado</span>
                    ) : (
                      <span className="status-indicator error">Insuficiente</span>
                    )}
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Conservador</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium">
                    {formatCurrency(workingCapitalNeed)}
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-medium ${workingCapital - workingCapitalNeed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(workingCapital - workingCapitalNeed)}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    {workingCapital - workingCapitalNeed >= 0 ? (
                      <span className="status-indicator success">Adequado</span>
                    ) : (
                      <span className="status-indicator warning">Atenção</span>
                    )}
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Pessimista</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium">
                    {formatCurrency(workingCapitalNeed * 1.3)}
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-medium ${workingCapital - (workingCapitalNeed * 1.3) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(workingCapital - (workingCapitalNeed * 1.3))}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    {workingCapital - (workingCapitalNeed * 1.3) >= 0 ? (
                      <span className="status-indicator success">Adequado</span>
                    ) : (
                      <span className="status-indicator error">Crítico</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Recomendações</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-4">Pontos Positivos</h3>
              <div className="space-y-3">
                {currentRatio >= 1.5 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Índice de liquidez corrente adequado ({currentRatio.toFixed(2)})
                    </p>
                  </div>
                )}
                {workingCapital > 0 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Capital de giro positivo garante liquidez operacional
                    </p>
                  </div>
                )}
                {cashCycle <= 45 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Ciclo de caixa eficiente ({cashCycle} dias)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-orange-700 mb-4">Oportunidades de Melhoria</h3>
              <div className="space-y-3">
                {currentRatio < 1.5 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Aumentar liquidez corrente para acima de 1,5
                    </p>
                  </div>
                )}
                {cashCycle > 45 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Reduzir ciclo de caixa através de negociação de prazos
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Implementar controle diário de fluxo de caixa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
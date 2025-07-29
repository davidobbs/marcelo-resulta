'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface CashFlowItem {
  month: string;
  inflows: {
    membership: number;
    sponsorship: number;
    fieldRental: number;
    events: number;
    other: number;
    total: number;
  };
  outflows: {
    personnel: number;
    facilities: number;
    utilities: number;
    marketing: number;
    administrative: number;
    taxes: number;
    other: number;
    total: number;
  };
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export default function FluxoCaixaPage() {
  const { recalculate } = useFinancialCalculations();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');
  const [showDetails, setShowDetails] = useState(true);
  const [scenario, setScenario] = useState<'conservative' | 'optimistic' | 'pessimistic'>('conservative');

  // Dados de exemplo para 12 meses
  const generateCashFlowData = (): CashFlowItem[] => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    let cumulativeFlow = 85000; // Saldo inicial

    return months.map((month, index) => {
      // Variações sazonais
      const seasonalFactor = index >= 5 && index <= 8 ? 1.2 : // Jun-Set (alta temporada)
                           index >= 11 || index <= 1 ? 0.8 : 1.0; // Dez-Fev (baixa temporada)

      const scenarioMultiplier = scenario === 'optimistic' ? 1.15 : 
                                scenario === 'pessimistic' ? 0.85 : 1.0;

      const baseInflows = {
        membership: 45000 * seasonalFactor * scenarioMultiplier,
        sponsorship: 25000 * (index % 3 === 0 ? 1.5 : 1.0), // Patrocínios trimestrais
        fieldRental: 18000 * seasonalFactor * scenarioMultiplier,
        events: 12000 * seasonalFactor * scenarioMultiplier,
        other: 8000 * seasonalFactor * scenarioMultiplier
      };

      const baseOutflows = {
        personnel: 52000,
        facilities: 15000,
        utilities: 8000 * (seasonalFactor > 1 ? 1.3 : 1.0), // Maior consumo na alta temporada
        marketing: 12000 * seasonalFactor,
        administrative: 8000,
        taxes: 15000 * (index % 4 === 2 ? 1.0 : 0.3), // Trimestral concentrado
        other: 5000
      };

      const inflows = {
        ...baseInflows,
        total: Object.values(baseInflows).reduce((a, b) => a + b, 0)
      };

      const outflows = {
        ...baseOutflows,
        total: Object.values(baseOutflows).reduce((a, b) => a + b, 0)
      };

      const netCashFlow = inflows.total - outflows.total;
      cumulativeFlow += netCashFlow;

      return {
        month,
        inflows,
        outflows,
        netCashFlow,
        cumulativeCashFlow: cumulativeFlow
      };
    });
  };

  const cashFlowData = generateCashFlowData();

  const totalInflows = cashFlowData.reduce((sum, item) => sum + item.inflows.total, 0);
  const totalOutflows = cashFlowData.reduce((sum, item) => sum + item.outflows.total, 0);
  const totalNetFlow = totalInflows - totalOutflows;
  const initialBalance = 85000;
  const finalBalance = cashFlowData[cashFlowData.length - 1].cumulativeCashFlow;

  const minCashFlow = Math.min(...cashFlowData.map(item => item.cumulativeCashFlow));
  const maxCashFlow = Math.max(...cashFlowData.map(item => item.cumulativeCashFlow));

  const positiveMonths = cashFlowData.filter(item => item.netCashFlow > 0).length;
  const negativeMonths = cashFlowData.filter(item => item.netCashFlow < 0).length;

  const burnRate = cashFlowData
    .filter(item => item.netCashFlow < 0)
    .reduce((sum, item) => sum + Math.abs(item.netCashFlow), 0) / negativeMonths || 0;

  const runwayMonths = minCashFlow > 0 ? Infinity : 
                      burnRate > 0 ? Math.floor(initialBalance / burnRate) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              Fluxo de Caixa
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Projeção e controle do fluxo de caixa mensal do clube
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
                <label className="form-label">Período</label>
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
              <div className="form-group">
                <label className="form-label">Visualização</label>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="table">Tabela</option>
                  <option value="chart">Gráfico</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="btn-outline flex items-center gap-2"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
              </button>
              <button className="btn-outline flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
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
              <p className="metric-label">Entradas Totais</p>
              <p className="metric-value text-green-600">{formatCurrency(totalInflows)}</p>
              <p className="text-xs text-gray-500 mt-1">12 meses</p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Saídas Totais</p>
              <p className="metric-value text-red-600">{formatCurrency(totalOutflows)}</p>
              <p className="text-xs text-gray-500 mt-1">12 meses</p>
            </div>
            <ArrowDownRight className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Fluxo Líquido</p>
              <p className={`metric-value ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetFlow)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalNetFlow >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Saldo Final</p>
              <p className={`metric-value ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(finalBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Dezembro 2024
              </p>
            </div>
            <Target className={`h-8 w-8 ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      {viewType === 'table' && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Fluxo de Caixa Projetado - 2024</h2>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Mês</th>
                    <th className="table-header-cell text-right">Entradas</th>
                    <th className="table-header-cell text-right">Saídas</th>
                    <th className="table-header-cell text-right">Fluxo Líquido</th>
                    <th className="table-header-cell text-right">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row bg-gray-50 dark:bg-gray-800">
                    <td className="table-cell font-medium">Saldo Inicial</td>
                    <td className="table-cell"></td>
                    <td className="table-cell"></td>
                    <td className="table-cell"></td>
                    <td className="table-cell text-right font-bold text-blue-600">
                      {formatCurrency(initialBalance)}
                    </td>
                  </tr>
                  {cashFlowData.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell font-medium">{item.month}</td>
                      <td className="table-cell text-right text-green-600 font-medium">
                        {formatCurrency(item.inflows.total)}
                      </td>
                      <td className="table-cell text-right text-red-600 font-medium">
                        {formatCurrency(item.outflows.total)}
                      </td>
                      <td className={`table-cell text-right font-medium ${
                        item.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.netCashFlow)}
                      </td>
                      <td className={`table-cell text-right font-bold ${
                        item.cumulativeCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.cumulativeCashFlow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Entradas Detalhadas */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-green-700">Entradas por Categoria</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {['membership', 'sponsorship', 'fieldRental', 'events', 'other'].map((category) => {
                  const total = cashFlowData.reduce((sum, item) => sum + item.inflows[category as keyof typeof item.inflows], 0);
                  const percentage = (total / totalInflows) * 100;
                  
                  const categoryNames = {
                    membership: 'Mensalidades',
                    sponsorship: 'Patrocínios',
                    fieldRental: 'Aluguel Quadras',
                    events: 'Eventos',
                    other: 'Outras Receitas'
                  };

                  return (
                    <div key={category} className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-green-800 dark:text-green-200">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </h3>
                        <span className="font-bold text-green-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">
                          {formatPercentage(percentage / 100)} do total
                        </span>
                        <span className="text-green-600">
                          {formatCurrency(total / 12)}/mês
                        </span>
                      </div>
                      <div className="mt-2 bg-green-200 dark:bg-green-800 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Saídas Detalhadas */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-red-700">Saídas por Categoria</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {['personnel', 'facilities', 'utilities', 'marketing', 'administrative', 'taxes', 'other'].map((category) => {
                  const total = cashFlowData.reduce((sum, item) => sum + item.outflows[category as keyof typeof item.outflows], 0);
                  const percentage = (total / totalOutflows) * 100;
                  
                  const categoryNames = {
                    personnel: 'Pessoal',
                    facilities: 'Instalações',
                    utilities: 'Utilidades',
                    marketing: 'Marketing',
                    administrative: 'Administrativo',
                    taxes: 'Impostos',
                    other: 'Outros'
                  };

                  return (
                    <div key={category} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-red-800 dark:text-red-200">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </h3>
                        <span className="font-bold text-red-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600">
                          {formatPercentage(percentage / 100)} do total
                        </span>
                        <span className="text-red-600">
                          {formatCurrency(total / 12)}/mês
                        </span>
                      </div>
                      <div className="mt-2 bg-red-200 dark:bg-red-800 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cash Flow Analysis */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Análise de Performance</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Meses Positivos</span>
                <span className="text-lg font-bold text-blue-600">{positiveMonths}/12</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Meses Negativos</span>
                <span className="text-lg font-bold text-orange-600">{negativeMonths}/12</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Menor Saldo</span>
                <span className={`text-lg font-bold ${minCashFlow >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(minCashFlow)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Maior Saldo</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(maxCashFlow)}</span>
              </div>

              {burnRate > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Taxa de Queima</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(burnRate)}/mês</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Recomendações</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {totalNetFlow > 0 ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Fluxo de caixa anual positivo - boa saúde financeira
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Fluxo de caixa negativo - revisar despesas e aumentar receitas
                  </p>
                </div>
              )}

              {minCashFlow < 50000 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Reserva de emergência baixa - manter mínimo de R$ 50.000
                  </p>
                </div>
              )}

              {negativeMonths > 6 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Muitos meses negativos - considerar sazonalidade
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Implementar controle diário para maior precisão
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Diversificar fontes de receita para reduzir riscos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Comparação de Cenários</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Cenário</th>
                  <th className="table-header-cell text-right">Entradas Anuais</th>
                  <th className="table-header-cell text-right">Fluxo Líquido</th>
                  <th className="table-header-cell text-right">Saldo Final</th>
                  <th className="table-header-cell text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Otimista (+15%)</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium text-green-600">
                    {formatCurrency(totalInflows * 1.15)}
                  </td>
                  <td className="table-cell text-right font-medium text-green-600">
                    {formatCurrency((totalInflows * 1.15) - totalOutflows)}
                  </td>
                  <td className="table-cell text-right font-bold text-green-600">
                    {formatCurrency(initialBalance + ((totalInflows * 1.15) - totalOutflows))}
                  </td>
                  <td className="table-cell text-center">
                    <span className="status-indicator success">Excelente</span>
                  </td>
                </tr>
                <tr className="table-row bg-gray-50 dark:bg-gray-800">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Conservador (atual)</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium text-blue-600">
                    {formatCurrency(totalInflows)}
                  </td>
                  <td className="table-cell text-right font-medium text-blue-600">
                    {formatCurrency(totalNetFlow)}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-600">
                    {formatCurrency(finalBalance)}
                  </td>
                  <td className="table-cell text-center">
                    <span className="status-indicator info">Adequado</span>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Pessimista (-15%)</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-medium text-red-600">
                    {formatCurrency(totalInflows * 0.85)}
                  </td>
                  <td className="table-cell text-right font-medium text-red-600">
                    {formatCurrency((totalInflows * 0.85) - totalOutflows)}
                  </td>
                  <td className="table-cell text-right font-bold text-red-600">
                    {formatCurrency(initialBalance + ((totalInflows * 0.85) - totalOutflows))}
                  </td>
                  <td className="table-cell text-center">
                    <span className="status-indicator warning">Atenção</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
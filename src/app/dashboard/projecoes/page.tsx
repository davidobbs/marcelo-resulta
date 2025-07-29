'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar,
  TrendingUp,
  BarChart3,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Settings,
  LineChart,
  PieChart,
  Target,
  Edit3,
  Save,
  X,
  Calculator
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useProjections, useAppStore } from '@/stores/useAppStore';
import { formatCurrency, formatPercentage } from '@/utils/format';

export default function ProjecoesPage() {
  const { projections, recalculate } = useFinancialCalculations();
  const storedProjections = useProjections();
  const { market } = useAppStore();
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'costs' | 'profit' | 'cashFlow'>('revenue');
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({ start: 0, end: 5 });
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customGrowthRate, setCustomGrowthRate] = useState(market?.growthPotential || 0.12);
  const [customInflationRate, setCustomInflationRate] = useState(market?.inflationRate || 0.06);

  // Função para recálculo
  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      recalculate();
    } catch (error) {
      console.error('Erro ao recalcular:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Usar projeções do hook ou do store
  const currentProjections = projections?.length > 0 ? projections : storedProjections;

  // Gerar projeções padrão se não existirem
  const generateDefaultProjections = () => {
    const currentYear = new Date().getFullYear();
    const defaultProjections = [];
    
    for (let i = 0; i < 12; i++) {
      const year = currentYear + i;
      const growthFactor = Math.pow(1 + customGrowthRate, i);
      const inflationFactor = Math.pow(1 + customInflationRate, i);
      
      const baseRevenue = 540000; // R$ 45k mensal
      const baseCosts = 432000; // R$ 36k mensal
      
      const revenue = baseRevenue * growthFactor;
      const costs = baseCosts * inflationFactor;
      const profit = revenue - costs;
      const cashFlow = profit * 0.9; // Aproximação

      defaultProjections.push({
        year,
        revenue: {
          total: revenue,
          breakdown: {
            fieldRental: revenue * 0.60,
            membership: revenue * 0.20,
            sponsorship: revenue * 0.10,
            soccerSchool: revenue * 0.08,
            other: revenue * 0.02
          }
        },
        costs: {
          total: costs,
          personnel: costs * 0.60,
          operational: costs * 0.40
        },
        taxes: {
          total: profit > 0 ? profit * (market?.taxRate || 0.163) : 0,
          rate: market?.taxRate || 0.163
        },
        cashFlow: {
          operational: cashFlow,
          investment: i === 0 ? -600000 : 0,
          financing: 0,
          net: i === 0 ? cashFlow - 600000 : cashFlow,
          accumulated: 0 // Será calculado depois
        },
        metrics: {
          grossMargin: (revenue - costs) / revenue,
          netMargin: (profit - (profit > 0 ? profit * 0.163 : 0)) / revenue,
          ebitda: profit,
          ebitdaMargin: profit / revenue,
          roa: 0.15,
          roe: 0.20,
          debtToEquity: 0.3,
          currentRatio: 1.5
        }
      });
    }

    // Calcular fluxo de caixa acumulado
    let accumulated = 0;
    defaultProjections.forEach(projection => {
      accumulated += projection.cashFlow.net;
      projection.cashFlow.accumulated = accumulated;
    });

    return defaultProjections;
  };

  const dataToDisplay = currentProjections?.length > 0 ? currentProjections : generateDefaultProjections();

  // Filtrar dados pelo range selecionado
  const filteredData = dataToDisplay.slice(yearRange.start, yearRange.end + 1);

  // Dados para gráficos
  const chartData = {
    labels: filteredData.map(p => p.year.toString()),
    datasets: [
      {
        label: 'Receitas',
        data: filteredData.map(p => p.revenue.total),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e20',
        tension: 0.4
      },
      {
        label: 'Custos',
        data: filteredData.map(p => p.costs.total),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        tension: 0.4
      },
      {
        label: 'Lucro',
        data: filteredData.map(p => p.revenue.total - p.costs.total),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f620',
        tension: 0.4
      }
    ]
  };

  // Métricas resumo
  const summaryMetrics = {
    totalRevenue: filteredData.reduce((sum, p) => sum + p.revenue.total, 0),
    totalCosts: filteredData.reduce((sum, p) => sum + p.costs.total, 0),
    totalProfit: filteredData.reduce((sum, p) => sum + (p.revenue.total - p.costs.total), 0),
    avgGrowthRate: filteredData.length > 1 ? 
      ((filteredData[filteredData.length - 1].revenue.total / filteredData[0].revenue.total) ** (1 / (filteredData.length - 1)) - 1) : 0,
    avgMargin: filteredData.reduce((sum, p) => sum + p.metrics.grossMargin, 0) / filteredData.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Projeções Financeiras
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Projeções detalhadas para os próximos 12 anos
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'table'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('chart')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'chart'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-outline flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
          
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="btn-primary flex items-center gap-2"
          >
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {isCalculating ? 'Recalculando...' : 'Recalcular'}
          </button>
        </div>
      </div>

      {/* Configurações */}
      {showSettings && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Configurações de Projeção
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Taxa de Crescimento</label>
                <input
                  type="number"
                  className="input-field"
                  value={customGrowthRate * 100}
                  onChange={(e) => setCustomGrowthRate(Number(e.target.value) / 100)}
                  step="0.1"
                  min="0"
                  max="50"
                />
                <span className="text-xs text-gray-500">% ao ano</span>
              </div>
              
              <div className="form-group">
                <label className="form-label">Taxa de Inflação</label>
                <input
                  type="number"
                  className="input-field"
                  value={customInflationRate * 100}
                  onChange={(e) => setCustomInflationRate(Number(e.target.value) / 100)}
                  step="0.1"
                  min="0"
                  max="20"
                />
                <span className="text-xs text-gray-500">% ao ano</span>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ano Inicial</label>
                <select
                  className="input-field"
                  value={yearRange.start}
                  onChange={(e) => setYearRange({ ...yearRange, start: Number(e.target.value) })}
                >
                  {dataToDisplay.map((_, index) => (
                    <option key={index} value={index}>
                      Ano {index + 1} ({dataToDisplay[index]?.year})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ano Final</label>
                <select
                  className="input-field"
                  value={yearRange.end}
                  onChange={(e) => setYearRange({ ...yearRange, end: Number(e.target.value) })}
                >
                  {dataToDisplay.map((_, index) => (
                    <option key={index} value={index} disabled={index < yearRange.start}>
                      Ano {index + 1} ({dataToDisplay[index]?.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="metric-label">Receita Total</p>
              <p className="metric-value text-green-600">{formatCurrency(summaryMetrics.totalRevenue)}</p>
              <p className="metric-change text-gray-500 text-xs">
                {filteredData.length} anos
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="metric-label">Custos Totais</p>
              <p className="metric-value text-red-600">{formatCurrency(summaryMetrics.totalCosts)}</p>
              <p className="metric-change text-gray-500 text-xs">
                Inflação: {formatPercentage(customInflationRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="metric-label">Lucro Total</p>
              <p className="metric-value text-blue-600">{formatCurrency(summaryMetrics.totalProfit)}</p>
              <p className="metric-change text-gray-500 text-xs">
                Margem: {formatPercentage(summaryMetrics.avgMargin)}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="metric-label">Crescimento Médio</p>
              <p className="metric-value text-purple-600">{formatPercentage(summaryMetrics.avgGrowthRate)}</p>
              <p className="metric-change text-gray-500 text-xs">
                Meta: {formatPercentage(customGrowthRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="metric-label">Período</p>
              <p className="metric-value text-orange-600">{filteredData.length}</p>
              <p className="metric-change text-gray-500 text-xs">
                anos projetados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização */}
      {viewType === 'table' ? (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Projeções Detalhadas por Ano
            </h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Ano</th>
                    <th className="table-header-cell">Receitas</th>
                    <th className="table-header-cell">Custos</th>
                    <th className="table-header-cell">Lucro Bruto</th>
                    <th className="table-header-cell">Impostos</th>
                    <th className="table-header-cell">Lucro Líquido</th>
                    <th className="table-header-cell">Fluxo de Caixa</th>
                    <th className="table-header-cell">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((projection) => {
                    const lucroLiquido = projection.revenue.total - projection.costs.total - projection.taxes.total;
                    return (
                      <tr key={projection.year} className="table-row">
                        <td className="table-cell font-medium">{projection.year}</td>
                        <td className="table-cell text-green-600 font-medium">
                          {formatCurrency(projection.revenue.total)}
                        </td>
                        <td className="table-cell text-red-600">
                          {formatCurrency(projection.costs.total)}
                        </td>
                        <td className="table-cell text-blue-600">
                          {formatCurrency(projection.revenue.total - projection.costs.total)}
                        </td>
                        <td className="table-cell text-orange-600">
                          {formatCurrency(projection.taxes.total)}
                        </td>
                        <td className="table-cell text-purple-600 font-medium">
                          {formatCurrency(lucroLiquido)}
                        </td>
                        <td className="table-cell">
                          {formatCurrency(projection.cashFlow.net)}
                        </td>
                        <td className="table-cell">
                          {formatPercentage(projection.metrics.grossMargin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Evolução Financeira
              </h2>
              <div className="flex gap-2">
                {['revenue', 'costs', 'profit', 'cashFlow'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric as any)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedMetric === metric
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {metric === 'revenue' ? 'Receitas' :
                     metric === 'costs' ? 'Custos' :
                     metric === 'profit' ? 'Lucro' : 'Fluxo de Caixa'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="h-80">
              {/* Aqui seria renderizado um gráfico */}
              <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Gráfico de {selectedMetric === 'revenue' ? 'Receitas' :
                                selectedMetric === 'costs' ? 'Custos' :
                                selectedMetric === 'profit' ? 'Lucro' : 'Fluxo de Caixa'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {filteredData.length} anos • {formatCurrency(
                      selectedMetric === 'revenue' ? summaryMetrics.totalRevenue :
                      selectedMetric === 'costs' ? summaryMetrics.totalCosts :
                      selectedMetric === 'profit' ? summaryMetrics.totalProfit :
                      filteredData.reduce((sum, p) => sum + p.cashFlow.net, 0)
                    )} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown por Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Evolução das Receitas
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {filteredData.slice(0, 3).map((projection) => (
                <div key={projection.year} className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Ano {projection.year}
                    </h3>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(projection.revenue.total)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                                         <div className="flex justify-between">
                       <span className="text-gray-500">Aluguel:</span>
                       <span>{formatCurrency((projection.revenue as any).breakdown?.fieldRental || 0)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Mensalidades:</span>
                       <span>{formatCurrency((projection.revenue as any).breakdown?.membership || 0)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Patrocínios:</span>
                       <span>{formatCurrency((projection.revenue as any).breakdown?.sponsorship || 0)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Escolinha:</span>
                       <span>{formatCurrency((projection.revenue as any).breakdown?.soccerSchool || 0)}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Evolução dos Custos
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {filteredData.slice(0, 3).map((projection) => (
                <div key={projection.year} className="border-l-4 border-red-500 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Ano {projection.year}
                    </h3>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(projection.costs.total)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                                         <div className="flex justify-between">
                       <span className="text-gray-500">Pessoal:</span>
                       <span>{formatCurrency((projection.costs as any).personnel || 0)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Operacional:</span>
                       <span>{formatCurrency((projection.costs as any).operational || 0)}</span>
                     </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Impostos:</span>
                      <span>{formatCurrency(projection.taxes.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Margem:</span>
                      <span className={
                        projection.metrics.grossMargin > 0 ? 'text-green-600' : 'text-red-600'
                      }>
                        {formatPercentage(projection.metrics.grossMargin)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
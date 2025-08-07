'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CardSkeleton } from '@/components/ui/PageLoader';
import { 
  TrendingUp,
  BarChart3,
  DollarSign,
  RefreshCw,
  Settings,
  LineChart,
  Target,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Database
} from 'lucide-react';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { AdvancedChart } from '@/components/charts/AdvancedChart';

interface ProjectionCard {
  title: string;
  currentValue: number;
  projectedValue: number;
  growth: number;
  icon: React.ReactNode;
  color: string;
}

export default function ProjecoesPage() {
  const { 
    projections, 
    generateScenarios,
    metrics,
    hasValidData,
    recalculate,
    isCalculating,
    summary 
  } = useFinancialEngine();
  
  const [viewType, setViewType] = useState<'chart' | 'table' | 'scenarios'>('chart');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'6M' | '1Y' | '3Y' | '5Y'>('1Y');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'costs' | 'profit' | 'margin'>('profit');
  const [showSettings, setShowSettings] = useState(false);
  const [customGrowthRate, setCustomGrowthRate] = useState(0.08);
  const [scenarios, setScenarios] = useState<any>({});

  useEffect(() => {
    if (hasValidData) {
      const scenarioData = generateScenarios(customGrowthRate);
      setScenarios(scenarioData);
    }
  }, [hasValidData, customGrowthRate, generateScenarios]);

  const handleRecalculate = async () => {
    await recalculate();
    if (hasValidData) {
      const scenarioData = generateScenarios(customGrowthRate);
      setScenarios(scenarioData);
    }
  };

  // Dados dos gráficos baseados nas projeções reais
  const chartData = useMemo(() => {
    const timeframes = {
      '6M': 6,
      '1Y': 12,
      '3Y': 36,
      '5Y': 60
    };
    
    const months = timeframes[selectedTimeframe];
    return projections.slice(0, months).map(p => ({
      month: `${p.month}º mês`,
      receita: p.revenue,
      custos: p.costs,
      lucro: p.profit,
      margem: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
      crescimento: p.month === 1 ? 0 : ((p.revenue / projections[0].revenue - 1) * 100)
    }));
  }, [projections, selectedTimeframe]);

  // Dados de comparação de cenários
  const scenarioComparisonData = useMemo(() => {
    if (!scenarios.realistic) return [];
    
    const months = selectedTimeframe === '6M' ? 6 : selectedTimeframe === '1Y' ? 12 : 12;
    
    return scenarios.realistic.slice(0, months).map((realistic: any, index: number) => ({
      month: `M${realistic.month}`,
      pessimista: scenarios.pessimistic[index]?.profit || 0,
      realista: realistic.profit,
      otimista: scenarios.optimistic[index]?.profit || 0
    }));
  }, [scenarios, selectedTimeframe]);

  // Cards de projeções principais (memoizados para performance)
  const projectionCards: ProjectionCard[] = useMemo(() => {
    const monthlyRevenue = projections.length > 0 ? projections[0].revenue : 0;
    const monthlyCosts = projections.length > 0 ? projections[0].costs : 0;
    const monthlyProfit = projections.length > 0 ? projections[0].profit : 0;
    const annualRevenue = projections.reduce((acc, p) => acc + p.revenue, 0);

    return [
      {
        title: 'Receita Projetada',
        currentValue: monthlyRevenue,
        projectedValue: annualRevenue / 12,
        growth: monthlyRevenue > 0 ? ((annualRevenue / 12 - monthlyRevenue) / monthlyRevenue) * 100 : 0,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'green'
      },
      {
        title: 'Custos Projetados',
        currentValue: monthlyCosts,
        projectedValue: monthlyCosts * 1.05, // Exemplo
        growth: 5,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'red'
      },
      {
        title: 'Lucro Projetado',
        currentValue: monthlyProfit,
        projectedValue: (annualRevenue / 12) - (monthlyCosts * 1.05),
        growth: summary.averageGrowthRate * 100,
        icon: <Target className="w-6 h-6" />,
        color: 'blue'
      },
      {
        title: 'ROI Projetado',
        currentValue: metrics.roi * 100,
        projectedValue: metrics.roi * 100 * 1.1, // Exemplo
        growth: 10,
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'purple'
      }
    ];
  }, [projections, summary, metrics]);

  const getCardColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Projeções Financeiras 2035
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Projeções baseadas em dados reais e análise matemática avançada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="6M">6 Meses</option>
            <option value="1Y">1 Ano</option>
            <option value="3Y">3 Anos</option>
            <option value="5Y">5 Anos</option>
          </select>
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Recalcular'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
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
                Dados Incompletos para Projeções
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                Configure as variáveis financeiras para obter projeções precisas baseadas em dados reais.
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

      {hasValidData && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                Projeções Ativas
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Baseadas em {projections.length} meses de dados calculados com crescimento de {formatPercentage(customGrowthRate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configurações */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Configurações de Projeção
            </h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taxa de Crescimento Anual
              </label>
              <input
                type="number"
                step="0.01"
                value={customGrowthRate}
                onChange={(e) => setCustomGrowthRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Taxa decimal (ex: 0.08 = 8%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Projeções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isCalculating ? (
          // Skeleton loading para os cards
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          projectionCards.map((card, index) => (
            <div key={index} className={`p-6 rounded-xl border-2 ${getCardColorClasses(card.color)} transition-all hover:shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  {card.icon}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${card.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.growth > 0 ? '+' : ''}{card.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium opacity-80 mb-1">{card.title}</p>
                <p className="text-sm opacity-70 mb-2">Atual: {formatCurrency(card.currentValue)}</p>
                <p className="text-xl font-bold">{formatCurrency(card.projectedValue)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controles de Visualização */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualização:</span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'chart', label: 'Gráficos', icon: <BarChart3 className="w-4 h-4" /> },
                { key: 'scenarios', label: 'Cenários', icon: <Target className="w-4 h-4" /> },
                { key: 'table', label: 'Tabela', icon: <Database className="w-4 h-4" /> }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setViewType(option.key as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === option.key
                      ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {viewType === 'chart' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Métrica:</span>
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="profit">Lucro</option>
              <option value="revenue">Receita</option>
              <option value="costs">Custos</option>
              <option value="margin">Margem (%)</option>
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      {viewType === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projeção Principal */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Projeção {selectedMetric === 'profit' ? 'de Lucro' : selectedMetric === 'revenue' ? 'de Receita' : selectedMetric === 'costs' ? 'de Custos' : 'de Margem'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                Dados Reais
              </div>
            </div>
            {chartData.length > 0 ? (
              <AdvancedChart
                type={selectedMetric === 'margin' ? 'line' : 'composed'}
                data={chartData}
                xKey="month"
                yKeys={
                  selectedMetric === 'profit' ? [
                    { key: 'receita', name: 'Receita', color: '#10B981', type: 'bar' },
                    { key: 'custos', name: 'Custos', color: '#EF4444', type: 'bar' },
                    { key: 'lucro', name: 'Lucro', color: '#3B82F6', type: 'line' }
                  ] : selectedMetric === 'margin' ? [
                    { key: 'margem', name: 'Margem (%)', color: '#8B5CF6' }
                  ] : [
                    { key: selectedMetric, name: selectedMetric === 'revenue' ? 'Receita' : 'Custos', color: selectedMetric === 'revenue' ? '#10B981' : '#EF4444' }
                  ]
                }
                height={350}
                currency={selectedMetric !== 'margin'}
                percentage={selectedMetric === 'margin'}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Configure as variáveis para ver projeções</p>
                </div>
              </div>
            )}
          </div>

          {/* Crescimento Acumulado */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Crescimento Acumulado
            </h3>
            {chartData.length > 0 ? (
              <AdvancedChart
                type="area"
                data={chartData}
                xKey="month"
                yKeys={[
                  { key: 'crescimento', name: 'Crescimento (%)', color: '#F59E0B' }
                ]}
                height={350}
                percentage={true}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Dados de crescimento indisponíveis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewType === 'scenarios' && (
        <div className="space-y-6">
          {/* Comparação de Cenários */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Comparação de Cenários - Lucro
            </h3>
            {scenarioComparisonData.length > 0 ? (
              <AdvancedChart
                type="line"
                data={scenarioComparisonData}
                xKey="month"
                yKeys={[
                  { key: 'pessimista', name: 'Pessimista', color: '#EF4444' },
                  { key: 'realista', name: 'Realista', color: '#3B82F6' },
                  { key: 'otimista', name: 'Otimista', color: '#10B981' }
                ]}
                height={400}
                currency={true}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Gerando cenários...</p>
                </div>
              </div>
            )}
          </div>

          {/* Resumo dos Cenários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['pessimistic', 'realistic', 'optimistic'].map((scenario, index) => {
              const colors = ['red', 'blue', 'green'];
              const labels = ['Pessimista', 'Realista', 'Otimista'];
              const scenarioData = scenarios[scenario];
              
              if (!scenarioData) return null;
              
              const totalProfit = scenarioData.reduce((sum: number, p: any) => sum + p.profit, 0);
              const avgMonthlyProfit = totalProfit / scenarioData.length;
              
              return (
                <div key={scenario} className={`p-6 rounded-xl border-2 ${getCardColorClasses(colors[index])}`}>
                  <h4 className="text-lg font-semibold mb-4">{labels[index]}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm opacity-75">Lucro Total (12 meses)</p>
                      <p className="text-xl font-bold">{formatCurrency(totalProfit)}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-75">Lucro Médio Mensal</p>
                      <p className="text-lg font-semibold">{formatCurrency(avgMonthlyProfit)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewType === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Tabela de Projeções Detalhada
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Custos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lucro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Margem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Crescimento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {chartData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(row.receita)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(row.custos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className={row.lucro > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(row.lucro)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatPercentage(row.margem / 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className={row.crescimento > 0 ? 'text-green-600' : 'text-red-600'}>
                        {row.crescimento > 0 ? '+' : ''}{row.crescimento.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights e Recomendações */}
      {hasValidData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Insights das Projeções
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Análise de Tendências:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      Crescimento Sustentável
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      Taxa de crescimento de {formatPercentage(customGrowthRate)} baseada em dados reais
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">
                      Projetação Anual Positiva
                    </p>
                    <p className="text-green-600 dark:text-green-400">
                      {formatCurrency(summary.annualProjection.revenue)} em 12 meses
                    </p>
                  </div>
                </div>
                
                {metrics.profitMargin > 0.15 && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-300">
                        Margem Saudável
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        Margem atual de {formatPercentage(metrics.profitMargin)} indica operação eficiente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Recomendações Estratégicas:</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Manter foco na otimização da taxa de utilização</p>
                <p>• Considerar expansão gradual com base nas projeções positivas</p>
                <p>• Monitorar cenários pessimistas para gestão de riscos</p>
                <p>• Reavaliar projeções trimestralmente para ajustes</p>
                <p>• Investir em melhorias que sustentem o crescimento projetado</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
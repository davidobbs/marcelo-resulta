'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { AdvancedChart } from '@/components/charts/AdvancedChart';
import { financialEngine } from '@/lib/financial-engine';
import { FinancialVariable } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { toast } from 'sonner';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  trend 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          {icon}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [variables, setVariables] = useState<FinancialVariable[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [projections, setProjections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('1Y');

  // Inicializa dados
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    if (!financialEngine) {
      toast.error("Financial engine not available.");
      return;
    }
    setIsLoading(true);
    try {
      // Simula carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allVariables = await financialEngine.getAllVariables();
      const calculatedMetrics = await financialEngine.calculateAggregatedMetrics();
      const projectionData = await financialEngine.generateProjections(12);
      
      setVariables(allVariables);
      setMetrics(calculatedMetrics);
      setProjections(projectionData);
    } finally {
      setIsLoading(false);
    }
  };

  // Dados dos gráficos
  const revenueProjectionData = useMemo(() => {
    return projections.map(p => ({
      month: `Mês ${p.month}`,
      receita: p.revenue,
      custos: p.costs,
      lucro: p.profit
    }));
  }, [projections]);

  const categoryBreakdownData = useMemo(() => {
    const revenueVars = variables.filter(v => v.category === 'revenue' && v.value > 0);
    return revenueVars.map(v => ({
      category: v.name,
      value: v.value
    }));
  }, [variables]);

  const costBreakdownData = useMemo(() => {
    const costVars = variables.filter(v => v.category === 'cost' && v.value > 0);
    return costVars.map(v => ({
      category: v.name,
      value: v.value
    }));
  }, [variables]);

  const performanceData = useMemo(() => {
    return projections.map(p => ({
      month: `M${p.month}`,
      roi: (p.profit / p.costs) * 100,
      margem: (p.profit / p.revenue) * 100,
      crescimento: p.month === 1 ? 0 : ((p.revenue / projections[0].revenue - 1) * 100)
    }));
  }, [projections]);

  // Cálculos para os cards de métricas
  const totalRevenue = metrics.totalRevenue || 0;
  const totalCosts = metrics.totalCosts || 0;
  const netProfit = metrics.netProfit || 0;
  const profitMargin = metrics.profitMargin || 0;
  const breakEvenPoint = metrics.breakEvenPoint || 0;
  const roi = metrics.roi || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise completa das métricas financeiras do clube
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="1M">1 Mês</option>
            <option value="3M">3 Meses</option>
            <option value="6M">6 Meses</option>
            <option value="1Y">1 Ano</option>
          </select>
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Receita Total Mensal"
          value={formatCurrency(totalRevenue)}
          change={8.2}
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <MetricCard
          title="Custos Totais"
          value={formatCurrency(totalCosts)}
          change={-2.1}
          trend="down"
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(netProfit)}
          change={15.7}
          trend={netProfit > 0 ? "up" : "down"}
          icon={<Target className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <MetricCard
          title="Margem de Lucro"
          value={formatPercentage(profitMargin)}
          change={3.4}
          trend="up"
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Cards de KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Break-Even (Horas/Mês)"
          value={Math.round(breakEvenPoint).toLocaleString('pt-BR')}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="yellow"
        />
        <MetricCard
          title="ROI Mensal"
          value={formatPercentage(roi)}
          change={roi > 0 ? 12.3 : -5.2}
          trend={roi > 0 ? "up" : "down"}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <MetricCard
          title="Taxa de Ocupação"
          value="68%"
          change={5.1}
          trend="up"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Projeção Financeira */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Projeção Financeira (12 Meses)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              Tempo Real
            </div>
          </div>
          <AdvancedChart
            type="composed"
            data={revenueProjectionData}
            xKey="month"
            yKeys={[
              { key: 'receita', name: 'Receita', color: '#10B981', type: 'bar' },
              { key: 'custos', name: 'Custos', color: '#EF4444', type: 'bar' },
              { key: 'lucro', name: 'Lucro', color: '#3B82F6', type: 'line' }
            ]}
            height={350}
            currency={true}
          />
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Métricas de Performance
          </h3>
          <AdvancedChart
            type="line"
            data={performanceData}
            xKey="month"
            yKeys={[
              { key: 'roi', name: 'ROI (%)', color: '#8B5CF6' },
              { key: 'margem', name: 'Margem (%)', color: '#10B981' },
              { key: 'crescimento', name: 'Crescimento (%)', color: '#F59E0B' }
            ]}
            height={350}
            percentage={true}
          />
        </div>
      </div>

      {/* Distribuição de Receitas e Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Breakdown de Receitas */}
        {categoryBreakdownData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribuição de Receitas
            </h3>
            <AdvancedChart
              type="pie"
              data={categoryBreakdownData}
              xKey="category"
              yKeys={[{ key: 'value', name: 'Valor', color: '#3B82F6' }]}
              height={300}
              currency={true}
              showLegend={false}
            />
          </div>
        )}

        {/* Breakdown de Custos */}
        {costBreakdownData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribuição de Custos
            </h3>
            <AdvancedChart
              type="pie"
              data={costBreakdownData}
              xKey="category"
              yKeys={[{ key: 'value', name: 'Valor', color: '#EF4444' }]}
              height={300}
              currency={true}
              showLegend={false}
            />
          </div>
        )}
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Alertas e Recomendações
        </h3>
        <div className="space-y-3">
          {netProfit < 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Lucro Negativo</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Os custos estão superando as receitas. Considere revisar a estratégia de preços ou reduzir custos operacionais.
                </p>
              </div>
            </div>
          )}
          
          {profitMargin > 0 && profitMargin < 0.1 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Margem de Lucro Baixa</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  A margem de lucro está abaixo de 10%. Recomenda-se otimizar custos ou aumentar receitas.
                </p>
              </div>
            </div>
          )}

          {profitMargin > 0.2 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Excelente Performance</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Margem de lucro saudável! Considere reinvestir parte dos lucros para crescimento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
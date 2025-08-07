'use client';

import { useState, useMemo } from 'react';
import { ClientTime } from '@/components/ui/ClientOnly';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Database,
  TrendingDown,
  Clock,
  Activity
} from 'lucide-react';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';
import { formatCurrency, formatPercentage } from '@/utils/format';
import Link from 'next/link';
import { toast } from 'sonner';
import { lazy, Suspense } from 'react';

const AdvancedChart = lazy(() => import('@/components/charts/AdvancedChart').then(module => ({ default: module.AdvancedChart })));

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  trend,
  subtitle 
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
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
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
        <p className="text-2xl font-bold mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs opacity-70">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const {
    metrics,
    projections,
    validation,
    isCalculating,
    recalculate,
    hasValidData,
    isProfitable,
    summary,
    calculateBreakEven
  } = useFinancialEngine();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRecalculate = async () => {
    toast.info('Recalculando métricas...');
    await recalculate();
    setLastUpdated(new Date());
    toast.success('Métricas atualizadas!');
  };

  // Dados para gráficos
  const projectionChartData = useMemo(() => {
    return projections.slice(0, 6).map(p => ({
      month: `Mês ${p.month}`,
      receita: p.revenue,
      custos: p.costs,
      lucro: p.profit
    }));
  }, [projections]);

  const trendData = useMemo(() => {
    return projections.slice(0, 12).map(p => ({
      month: `M${p.month}`,
      crescimento: p.month === 1 ? 0 : ((p.revenue / projections[0].revenue - 1) * 100),
      margem: (p.profit / p.revenue) * 100,
      roi: (p.profit / p.costs) * 100
    }));
  }, [projections]);

  const breakEvenData = calculateBreakEven();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard Executivo
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>Última atualização: <ClientTime date={lastUpdated} /></span>
            </div>
            <div className="flex items-center gap-1">
              {hasValidData ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Dados válidos</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">Validação pendente</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Recalcular'}
          </button>
          <Link
            href="/dashboard/financial-variables"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </Link>
        </div>
      </div>

      {/* Alertas de Validação */}
      {!hasValidData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Atenção: Dados Incompletos
              </h3>
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                    • {error}
                  </p>
                ))}
              </div>
              <div className="mt-3">
                <Link
                  href="/dashboard/financial-variables"
                  className="text-sm font-medium text-yellow-700 dark:text-yellow-300 underline hover:no-underline"
                >
                  Configure as variáveis necessárias →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Mensal"
          value={formatCurrency(summary.monthlyRevenue[0] || 0)}
          change={summary.averageGrowthRate * 100}
          trend={summary.averageGrowthRate > 0 ? "up" : summary.averageGrowthRate < 0 ? "down" : "neutral"}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="green"
          subtitle="Receita total mensal"
        />
        
        <MetricCard
          title="Custos Mensais"
          value={formatCurrency(summary.monthlyCosts[0] || 0)}
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          color="red"
          subtitle="Custos operacionais totais"
        />
        
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(summary.monthlyProfit[0] || 0)}
          trend={isProfitable ? "up" : "down"}
          icon={<Target className="w-6 h-6 text-blue-600" />}
          color={isProfitable ? "blue" : "red"}
          subtitle={isProfitable ? "Operação lucrativa" : "Prejuízo operacional"}
        />
        
        <MetricCard
          title="Margem de Lucro"
          value={formatPercentage(metrics.profitMargin)}
          trend={metrics.profitMargin > 0.15 ? "up" : metrics.profitMargin > 0.05 ? "neutral" : "down"}
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          color="purple"
          subtitle="Eficiência operacional"
        />
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Break-Even (Horas)"
          value={breakEvenData.hoursNeeded.toLocaleString('pt-BR')}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="yellow"
          subtitle={`${breakEvenData.daysToBreakEven} dias para equilibrar`}
        />
        
        <MetricCard
          title="ROI Mensal"
          value={formatPercentage(metrics.roi)}
          trend={metrics.roi > 0.1 ? "up" : metrics.roi > 0 ? "neutral" : "down"}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="green"
          subtitle="Retorno sobre investimento"
        />
        
        <MetricCard
          title="Projeção Anual"
          value={formatCurrency(summary.annualProjection.revenue)}
          trend={summary.annualProjection.revenue > 0 ? "up" : "down"}
          icon={<Calculator className="w-6 h-6 text-blue-600" />}
          color="blue"
          subtitle="Lucro projetado 12 meses"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projeção Financeira */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Projeção Financeira (6 Meses)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              Atualizado
            </div>
          </div>
          {projectionChartData.length > 0 ? (
            <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-gray-500">Carregando gráfico...</div>}>
            <AdvancedChart
              type="composed"
              data={projectionChartData}
              xKey="month"
              yKeys={[
                { key: 'receita', name: 'Receita', color: '#10B981', type: 'bar' },
                { key: 'custos', name: 'Custos', color: '#EF4444', type: 'bar' },
                { key: 'lucro', name: 'Lucro', color: '#3B82F6', type: 'line' }
              ]}
              height={300}
              currency={true}
            />
            </Suspense>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Configure as variáveis para ver projeções</p>
              </div>
            </div>
          )}
        </div>

        {/* Métricas de Tendência */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tendências de Performance
          </h3>
          {trendData.length > 0 ? (
            <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-gray-500">Carregando gráfico...</div>}>
            <AdvancedChart
              type="line"
              data={trendData}
              xKey="month"
              yKeys={[
                { key: 'margem', name: 'Margem (%)', color: '#10B981' },
                { key: 'roi', name: 'ROI (%)', color: '#8B5CF6' },
                { key: 'crescimento', name: 'Crescimento (%)', color: '#F59E0B' }
              ]}
              height={300}
              percentage={true}
            />
            </Suspense>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Dados insuficientes para tendências</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/analytics"
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Analytics Avançado</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Dashboard completo com métricas detalhadas</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/financial-variables"
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 text-white rounded-lg group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Configurar Variáveis</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Ajuste fórmulas e parâmetros financeiros</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/financial-input"
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Entrada de Dados</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Insira receitas e custos detalhados</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
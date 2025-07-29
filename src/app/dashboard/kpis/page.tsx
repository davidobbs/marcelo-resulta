'use client';

import { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  EyeOff,
  Clock,
  Percent,
  Activity,
  Globe
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: 'financial' | 'operational' | 'growth' | 'satisfaction';
  icon: any;
  color: string;
  description: string;
}

export default function KPIsPage() {
  const { recalculate } = useFinancialCalculations();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [category, setCategory] = useState<'all' | 'financial' | 'operational' | 'growth' | 'satisfaction'>('all');
  const [showTargets, setShowTargets] = useState(true);

  // KPIs principais do clube
  const kpis: KPIMetric[] = [
    // KPIs Financeiros
    {
      id: 'revenue',
      name: 'Receita Total',
      value: 108000,
      target: 120000,
      unit: 'currency',
      trend: 'up',
      trendValue: 8.5,
      category: 'financial',
      icon: DollarSign,
      color: 'text-green-600',
      description: 'Receita total mensal do clube'
    },
    {
      id: 'profit_margin',
      name: 'Margem de Lucro',
      value: 15.2,
      target: 20.0,
      unit: 'percentage',
      trend: 'up',
      trendValue: 2.1,
      category: 'financial',
      icon: Percent,
      color: 'text-blue-600',
      description: 'Margem de lucro líquido sobre receita'
    },
    {
      id: 'avg_revenue_per_member',
      name: 'Receita por Sócio',
      value: 180,
      target: 200,
      unit: 'currency',
      trend: 'stable',
      trendValue: 0.5,
      category: 'financial',
      icon: Users,
      color: 'text-purple-600',
      description: 'Receita média por sócio ativo'
    },
    {
      id: 'cash_flow',
      name: 'Fluxo de Caixa',
      value: 42000,
      target: 50000,
      unit: 'currency',
      trend: 'up',
      trendValue: 12.3,
      category: 'financial',
      icon: TrendingUp,
      color: 'text-emerald-600',
      description: 'Fluxo de caixa líquido mensal'
    },

    // KPIs Operacionais
    {
      id: 'active_members',
      name: 'Sócios Ativos',
      value: 1250,
      target: 1400,
      unit: 'number',
      trend: 'up',
      trendValue: 5.2,
      category: 'operational',
      icon: Users,
      color: 'text-indigo-600',
      description: 'Número de sócios com mensalidade em dia'
    },
    {
      id: 'facility_usage',
      name: 'Taxa de Ocupação',
      value: 68.5,
      target: 75.0,
      unit: 'percentage',
      trend: 'up',
      trendValue: 3.8,
      category: 'operational',
      icon: BarChart3,
      color: 'text-orange-600',
      description: 'Percentual de ocupação das instalações'
    },
    {
      id: 'events_hosted',
      name: 'Eventos/Mês',
      value: 24,
      target: 30,
      unit: 'number',
      trend: 'up',
      trendValue: 9.1,
      category: 'operational',
      icon: Calendar,
      color: 'text-pink-600',
      description: 'Número de eventos realizados no mês'
    },
    {
      id: 'operational_efficiency',
      name: 'Eficiência Operacional',
      value: 82.3,
      target: 85.0,
      unit: 'percentage',
      trend: 'up',
      trendValue: 1.7,
      category: 'operational',
      icon: Activity,
      color: 'text-cyan-600',
      description: 'Índice de eficiência operacional'
    },

    // KPIs de Crescimento
    {
      id: 'new_members',
      name: 'Novos Sócios',
      value: 35,
      target: 40,
      unit: 'number',
      trend: 'down',
      trendValue: -8.2,
      category: 'growth',
      icon: TrendingUp,
      color: 'text-green-600',
      description: 'Novos sócios captados no mês'
    },
    {
      id: 'member_retention',
      name: 'Retenção de Sócios',
      value: 94.2,
      target: 95.0,
      unit: 'percentage',
      trend: 'stable',
      trendValue: 0.3,
      category: 'growth',
      icon: Award,
      color: 'text-yellow-600',
      description: 'Taxa de retenção mensal de sócios'
    },
    {
      id: 'revenue_growth',
      name: 'Crescimento Receita',
      value: 8.5,
      target: 10.0,
      unit: 'percentage',
      trend: 'up',
      trendValue: 2.1,
      category: 'growth',
      icon: TrendingUp,
      color: 'text-emerald-600',
      description: 'Crescimento da receita vs mês anterior'
    },
    {
      id: 'market_share',
      name: 'Participação Mercado',
      value: 12.8,
      target: 15.0,
      unit: 'percentage',
      trend: 'up',
      trendValue: 1.2,
      category: 'growth',
      icon: Globe,
      color: 'text-blue-600',
      description: 'Participação no mercado local'
    },

    // KPIs de Satisfação
    {
      id: 'member_satisfaction',
      name: 'Satisfação Sócios',
      value: 8.7,
      target: 9.0,
      unit: 'score',
      trend: 'up',
      trendValue: 2.4,
      category: 'satisfaction',
      icon: Award,
      color: 'text-purple-600',
      description: 'Nota média de satisfação (0-10)'
    },
    {
      id: 'nps_score',
      name: 'NPS Score',
      value: 67,
      target: 70,
      unit: 'score',
      trend: 'up',
      trendValue: 5.3,
      category: 'satisfaction',
      icon: Target,
      color: 'text-indigo-600',
      description: 'Net Promoter Score'
    },
    {
      id: 'complaint_resolution',
      name: 'Resolução Reclamações',
      value: 88.5,
      target: 95.0,
      unit: 'percentage',
      trend: 'down',
      trendValue: -3.2,
      category: 'satisfaction',
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Taxa de resolução de reclamações'
    },
    {
      id: 'response_time',
      name: 'Tempo Resposta',
      value: 4.2,
      target: 3.0,
      unit: 'hours',
      trend: 'down',
      trendValue: -15.6,
      category: 'satisfaction',
      icon: Clock,
      color: 'text-orange-600',
      description: 'Tempo médio de resposta (horas)'
    }
  ];

  const filteredKpis = category === 'all' ? kpis : kpis.filter(kpi => kpi.category === category);

  const getPerformanceStatus = (value: number, target: number, isLowerBetter = false) => {
    const percentage = isLowerBetter ? (target / value) * 100 : (value / target) * 100;
    if (percentage >= 100) return 'excellent';
    if (percentage >= 90) return 'good';
    if (percentage >= 80) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Target;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'currency': return formatCurrency(value);
      case 'percentage': return formatPercentage(value / 100);
      case 'score': return value.toFixed(1);
      case 'hours': return `${value.toFixed(1)}h`;
      default: return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Target;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Estatísticas por categoria
  const getCategoryStats = () => {
    const categories = ['financial', 'operational', 'growth', 'satisfaction'];
    return categories.map(cat => {
      const categoryKpis = kpis.filter(kpi => kpi.category === cat);
      const excellentCount = categoryKpis.filter(kpi => 
        getPerformanceStatus(kpi.value, kpi.target, kpi.id === 'response_time') === 'excellent'
      ).length;
      const totalCount = categoryKpis.length;
      
      return {
        category: cat,
        performance: (excellentCount / totalCount) * 100,
        total: totalCount,
        excellent: excellentCount
      };
    });
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Dashboard KPIs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Indicadores-chave de performance e métricas do clube
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={recalculate} className="btn-primary flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
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
                <label className="form-label">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="form-select"
                >
                  <option value="all">Todas</option>
                  <option value="financial">Financeiros</option>
                  <option value="operational">Operacionais</option>
                  <option value="growth">Crescimento</option>
                  <option value="satisfaction">Satisfação</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTargets(!showTargets)}
                className="btn-outline flex items-center gap-2"
              >
                {showTargets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showTargets ? 'Ocultar' : 'Mostrar'} Metas
              </button>
              <button className="btn-outline flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {categoryStats.map((stat) => {
          const categoryNames = {
            financial: 'Financeiros',
            operational: 'Operacionais',
            growth: 'Crescimento',
            satisfaction: 'Satisfação'
          };

          const categoryIcons = {
            financial: DollarSign,
            operational: Activity,
            growth: TrendingUp,
            satisfaction: Award
          };

          const Icon = categoryIcons[stat.category as keyof typeof categoryIcons];

          return (
            <div key={stat.category} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryNames[stat.category as keyof typeof categoryNames]}
                  </h3>
                </div>
                <span className="text-xs text-gray-500">{stat.excellent}/{stat.total}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Performance</span>
                  <span className="font-medium">{stat.performance.toFixed(0)}%</span>
                </div>
                <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stat.performance >= 75 ? 'bg-green-500' :
                      stat.performance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {filteredKpis.map((kpi) => {
          const isLowerBetter = kpi.id === 'response_time';
          const status = getPerformanceStatus(kpi.value, kpi.target, isLowerBetter);
          const StatusIcon = getStatusIcon(status);
          const TrendIcon = getTrendIcon(kpi.trend);
          
          return (
            <div key={kpi.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {kpi.name}
                    </h3>
                  </div>
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(status).split(' ')[0]}`} />
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatValue(kpi.value, kpi.unit)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${getTrendColor(kpi.trend)}`}>
                      <TrendIcon className="h-3 w-3" />
                      <span>{Math.abs(kpi.trendValue).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {showTargets && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Meta: {formatValue(kpi.target, kpi.unit)}</span>
                      <span>
                        {isLowerBetter 
                          ? (((kpi.target / kpi.value) * 100).toFixed(0))
                          : (((kpi.value / kpi.target) * 100).toFixed(0))
                        }%
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          status === 'excellent' ? 'bg-green-500' :
                          status === 'good' ? 'bg-blue-500' :
                          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, isLowerBetter 
                            ? (kpi.target / kpi.value) * 100 
                            : (kpi.value / kpi.target) * 100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {kpi.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall Performance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Performance Geral</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {['excellent', 'good', 'warning', 'critical'].map((level) => {
                const count = filteredKpis.filter(kpi => 
                  getPerformanceStatus(kpi.value, kpi.target, kpi.id === 'response_time') === level
                ).length;
                const percentage = (count / filteredKpis.length) * 100;
                
                const levelNames = {
                  excellent: 'Excelente',
                  good: 'Bom',
                  warning: 'Atenção',
                  critical: 'Crítico'
                };

                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(level).split(' ')[1]}`}></div>
                      <span className="text-sm font-medium">
                        {levelNames[level as keyof typeof levelNames]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusColor(level).split(' ')[1]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trends Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Tendências</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Em Alta
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {filteredKpis.filter(kpi => kpi.trend === 'up').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estável
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-600">
                  {filteredKpis.filter(kpi => kpi.trend === 'stable').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Em Queda
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {filteredKpis.filter(kpi => kpi.trend === 'down').length}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Maior Crescimento
              </h3>
              {filteredKpis
                .sort((a, b) => b.trendValue - a.trendValue)
                .slice(0, 3)
                .map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {kpi.name}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      +{kpi.trendValue.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Ações Recomendadas</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-4">Pontos Fortes</h3>
              <div className="space-y-3">
                {filteredKpis
                  .filter(kpi => getPerformanceStatus(kpi.value, kpi.target, kpi.id === 'response_time') === 'excellent')
                  .slice(0, 4)
                  .map((kpi) => (
                    <div key={kpi.id} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {kpi.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatValue(kpi.value, kpi.unit)} - Meta atingida
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-orange-700 mb-4">Necessita Atenção</h3>
              <div className="space-y-3">
                {filteredKpis
                  .filter(kpi => ['warning', 'critical'].includes(
                    getPerformanceStatus(kpi.value, kpi.target, kpi.id === 'response_time')
                  ))
                  .slice(0, 4)
                  .map((kpi) => (
                    <div key={kpi.id} className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {kpi.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatValue(kpi.value, kpi.unit)} / Meta: {formatValue(kpi.target, kpi.unit)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
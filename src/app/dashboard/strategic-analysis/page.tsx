'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientTime } from '@/components/ui/ClientOnly';
import { 
  TrendingUp, 
  Target, 
  DollarSign,
  Users,
  Leaf,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { useStrategicKPIs } from '@/stores/useAppStore';
import { formatCurrency, formatPercentage } from '@/utils/format';
import type { 
  KPIMetric
} from '@/types';

type ActiveTab = 'overview' | 'kpis';

export default function StrategicAnalysisPage() {
  const strategicKPIs = useStrategicKPIs();

  const [activeTab, setActiveTab] = useState<ActiveTab>('kpis');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Estados e lógica de comprehensiveAnalysis e monteCarloResults removidos

  const performAnalysis = useCallback(async () => {
    setIsCalculating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Lógica de cálculo removida
      setLastUpdate(new Date());
    } finally {
      setIsCalculating(false);
    }
  }, []);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  const tabs = [
    { id: 'kpis', name: 'KPIs Estratégicos', icon: Target, description: 'Indicadores de performance' },
    // Outras abas removidas
  ];

  const getKPIColor = (metric: KPIMetric) => {
    const performance = metric.value / metric.target;
    if (performance >= 1) return 'text-green-600';
    if (performance >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKPIBadge = (metric: KPIMetric) => {
    const performance = metric.value / metric.target;
    if (performance >= 1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (performance >= 0.8) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const renderKPICard = (metric: KPIMetric, icon: React.ElementType) => {
    if (!metric || typeof metric.value === 'undefined' || typeof metric.target === 'undefined') {
        return null;
    }
    const Icon = icon;
    const performance = (metric.value / metric.target) * 100;
    
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="metric-label">{metric.name}</p>
              <p className={`metric-value ${getKPIColor(metric)}`}>
                {typeof metric.value === 'number' && metric.unit === '%' 
                  ? formatPercentage(metric.value)
                  : typeof metric.value === 'number' && metric.unit.includes('R$')
                  ? formatCurrency(metric.value)
                  : `${metric.value}${metric.unit}`
                }
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKPIBadge(metric)}`}>
            {performance.toFixed(0)}% da meta
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Meta:</span>
            <span className="font-medium">
              {typeof metric.target === 'number' && metric.unit === '%'
                ? formatPercentage(metric.target)
                : typeof metric.target === 'number' && metric.unit.includes('R$')
                ? formatCurrency(metric.target)
                : `${metric.target}${metric.unit}`
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Benchmark:</span>
            <span className="font-medium">
              {typeof metric.benchmark === 'number' && metric.unit === '%'
                ? formatPercentage(metric.benchmark)
                : typeof metric.benchmark === 'number' && metric.unit.includes('R$')
                ? formatCurrency(metric.benchmark)
                : `${metric.benchmark}${metric.unit}`
              }
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                performance >= 100 ? 'bg-green-500' : 
                performance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(performance, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análise Estratégica Avançada
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Dashboard executivo com KPIs estratégicos e análises probabilísticas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: <ClientTime date={lastUpdate} />
          </span>
          <button
            onClick={performAnalysis}
            disabled={isCalculating}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Atualizar Análise'}
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* comprehensiveAnalysis e monteCarloResults removidos */}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        
        {activeTab === 'kpis' && strategicKPIs && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  KPIs Financeiros
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicKPIs.financial.map((metric) => 
                    renderKPICard(metric, DollarSign)
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  KPIs Operacionais
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicKPIs.operational.map((metric) => 
                    renderKPICard(metric, Settings)
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  KPIs de Clientes
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicKPIs.customer.map((metric) => 
                    renderKPICard(metric, Users)
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  KPIs de Crescimento
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicKPIs.growth.map((metric) => 
                    renderKPICard(metric, TrendingUp)
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  KPIs de Sustentabilidade
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicKPIs.sustainability.map((metric) => 
                    renderKPICard(metric, Leaf)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* sensitivity, risks, scenarios removidos */}

        {isCalculating && (
          <div className="card">
            <div className="card-body text-center py-12">
              <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Processando Análise Estratégica
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Executando cálculos financeiros e simulações probabilísticas...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
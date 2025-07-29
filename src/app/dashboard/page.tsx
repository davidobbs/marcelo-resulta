'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3,
  Calendar,
  Building2,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Settings,
  FileText,
  PieChart,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAppStore, useFinancialData } from '@/stores/useAppStore';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/format';
import Link from 'next/link';

export default function DashboardPage() {
  const { club, market, projections, kpis, analysis } = useAppStore();
  const financialData = useFinancialData();
  const { recalculate, baseFieldRevenue, investmentRequirements, operationalCosts } = useFinancialCalculations();
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);

  // Função para executar recálculo
  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula processamento
      const results = recalculate();
      setLastCalculated(new Date());
      
      // Feedback para o usuário
      console.log('Resultados do recálculo:', results);
    } catch (error) {
      console.error('Erro ao recalcular:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Verificar se dados financeiros foram inseridos
  const hasFinancialData = () => {
    if (!financialData) return false;
    
    const totalRevenues = Object.values(financialData.revenues).reduce((total, category) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: any) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total;
    }, 0);

    const totalCosts = Object.values(financialData.costs).reduce((total, category) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, subCategory: any) => {
          if (typeof subCategory === 'object' && subCategory !== null) {
            return sum + Object.values(subCategory).reduce((subSum: number, val: any) => 
              subSum + (typeof val === 'number' ? val : 0), 0);
          }
          return sum + (typeof subCategory === 'number' ? subCategory : 0);
        }, 0);
      }
      return total;
    }, 0);

    return totalRevenues > 0 || totalCosts > 0;
  };

  // Calcular métricas baseadas nos dados reais
  const calculateRealMetrics = () => {
    const monthlyRevenue = baseFieldRevenue || 45000;
    const annualRevenue = monthlyRevenue * 12;
    const monthlyCosts = operationalCosts / 12;
    const annualCosts = operationalCosts;
    const ebitda = annualRevenue - annualCosts;
    const ebitdaMargin = ebitda / annualRevenue;
    const roiProjected = analysis?.valuation?.roi || 0.283;
    const paybackYears = analysis?.valuation?.paybackPeriod || (investmentRequirements?.total ? investmentRequirements.total / annualRevenue : 3.2);

    return {
      monthlyRevenue,
      annualRevenue,
      monthlyCosts,
      annualCosts,
      ebitda,
      ebitdaMargin,
      roiProjected,
      paybackYears,
    };
  };

  const metrics = calculateRealMetrics();
  const dataStatus = hasFinancialData();

  // Fluxo de análise recomendado
  const analysisFlow = [
    {
      id: 'financial-input',
      title: 'Dados Financeiros',
      description: 'Configure receitas e custos detalhados',
      icon: FileText,
      status: dataStatus ? 'completed' : 'pending',
      href: '/dashboard/financial-input',
      color: dataStatus ? 'text-green-600' : 'text-orange-600'
    },
    {
      id: 'projections',
      title: 'Projeções',
      description: 'Visualize projeções de 12 anos',
      icon: TrendingUp,
      status: projections.length > 0 ? 'completed' : 'pending',
      href: '/dashboard/projecoes',
      color: projections.length > 0 ? 'text-green-600' : 'text-gray-600'
    },
    {
      id: 'viability',
      title: 'Viabilidade',
      description: 'Análise de VPL, TIR e payback',
      icon: Calculator,
      status: analysis ? 'completed' : 'pending',
      href: '/dashboard/viabilidade',
      color: analysis ? 'text-green-600' : 'text-gray-600'
    },
    {
      id: 'valuation',
      title: 'Valuation',
      description: 'Avaliação do valor da empresa',
      icon: DollarSign,
      status: analysis ? 'completed' : 'pending',
      href: '/dashboard/valuation',
      color: analysis ? 'text-green-600' : 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Financeiro
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {club.name} • {club.numFields} campos • {market.name}
            {lastCalculated && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                • Última análise: {lastCalculated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={isCalculating || !dataStatus}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Status de Dados */}
      {!dataStatus && (
        <div className="card border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  Dados Financeiros Necessários
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                  Para gerar análises precisas, configure primeiro os dados financeiros detalhados do seu clube.
                </p>
                <Link 
                  href="/dashboard/financial-input"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  <Play className="w-4 h-4" />
                  Começar Configuração
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="metric-label">Receita Mensal</p>
              <p className="metric-value text-green-600">{formatCurrency(metrics.monthlyRevenue)}</p>
              <p className="metric-change">
                <ArrowUpRight className="w-3 h-3" />
                Projetado
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Minus className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="metric-label">Custos Mensais</p>
              <p className="metric-value text-red-600">{formatCurrency(metrics.monthlyCosts)}</p>
              <p className="metric-change">
                <ArrowDownRight className="w-3 h-3" />
                Operacional
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="metric-label">Margem EBITDA</p>
              <p className="metric-value text-blue-600">{formatPercentage(metrics.ebitdaMargin)}</p>
              <p className="metric-change">
                <TrendingUp className="w-3 h-3" />
                Meta: 25%
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
              <p className="metric-label">ROI Projetado</p>
              <p className="metric-value text-purple-600">{formatPercentage(metrics.roiProjected)}</p>
              <p className="metric-change">
                <Calendar className="w-3 h-3" />
                {metrics.paybackYears.toFixed(1)} anos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fluxo de Análise */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Fluxo de Análise Recomendado
            </h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisFlow.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Link 
                  key={step.id}
                  href={step.href}
                  className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                      <div className={`p-2 rounded-lg ${
                        step.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${step.color}`} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                          {step.title}
                        </h3>
                        {step.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Resumo Financeiro Anual
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Receita Total</span>
              <span className="font-medium text-green-600">{formatCurrency(metrics.annualRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Custos Operacionais</span>
              <span className="font-medium text-red-600">{formatCurrency(metrics.annualCosts)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">EBITDA</span>
              <span className={`font-medium ${metrics.ebitda >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.ebitda)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Margem EBITDA</span>
              <span className={`font-bold ${metrics.ebitda >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatPercentage(metrics.ebitdaMargin)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Investimento Requerido
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Infraestrutura</span>
              <span className="font-medium">{formatCurrency(investmentRequirements?.fieldConstruction || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Equipamentos</span>
              <span className="font-medium">{formatCurrency(investmentRequirements?.equipment || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Capital de Giro</span>
              <span className="font-medium">{formatCurrency(investmentRequirements?.workingCapital || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Total</span>
              <span className="font-bold text-purple-600">
                {formatCurrency(investmentRequirements?.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/dre" className="card hover:shadow-lg transition-shadow group">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                  DRE Gerencial
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Demonstração detalhada de resultados
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/fluxo-caixa" className="card hover:shadow-lg transition-shadow group">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600">
                  Fluxo de Caixa
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Projeções de entrada e saída
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/kpis" className="card hover:shadow-lg transition-shadow group">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600">
                  KPIs Estratégicos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Indicadores de performance
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 
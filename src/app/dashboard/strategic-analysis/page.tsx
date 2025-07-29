'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Zap,
  Leaf,
  Settings,
  RefreshCw,
  Download,
  Eye,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { 
  calculateStrategicKPIs,
  calculateFieldRentalRevenue,
  calculateDetailedOperationalCosts,
  comprehensiveFootballClubAnalysis,
  enhancedSensitivityAnalysis,
  advancedMonteCarloAnalysis
} from '@/utils/financial-calculations';
import { formatCurrency, formatPercentage } from '@/utils/format';
import type { 
  StrategicKPIs,
  KPIMetric,
  ComprehensiveViabilityAnalysis,
  FootballField,
  StaffMember 
} from '@/types';

export default function StrategicAnalysisPage() {
  const { club, market } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'sensitivity' | 'risks' | 'scenarios'>('overview');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Estados para análises
  const [strategicKPIs, setStrategicKPIs] = useState<StrategicKPIs | null>(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveViabilityAnalysis | null>(null);
  const [monteCarloResults, setMonteCarloResults] = useState<any>(null);

  // Mock data - em produção seria obtido do store/backend
  const mockFields: FootballField[] = [
    {
      id: '1',
      name: 'Campo 1 - Society 5x5',
      type: 'Society 5x5',
      dimensions: { length: 40, width: 20 },
      surfaceType: 'Grama Sintética',
      lighting: true,
      covered: false,
      capacity: 50,
      hourlyRate: 80,
      maintenanceCost: 500,
      utilizationRate: 0.65,
    },
    {
      id: '2',
      name: 'Campo 2 - Society 7x7',
      type: 'Society 7x7',
      dimensions: { length: 50, width: 30 },
      surfaceType: 'Grama Sintética',
      lighting: true,
      covered: false,
      capacity: 80,
      hourlyRate: 100,
      maintenanceCost: 600,
      utilizationRate: 0.70,
    }
  ];

  const mockStaff: StaffMember[] = [
    {
      id: '1',
      position: 'Administrador',
      level: 'Pleno',
      workload: 'Integral',
      monthlySalary: 4500,
      contractType: 'CLT',
    },
    {
      id: '2',
      position: 'Recepcionista',
      level: 'Júnior',
      workload: 'Integral',
      monthlySalary: 2000,
      contractType: 'CLT',
    },
    {
      id: '3',
      position: 'Manutenção',
      level: 'Pleno',
      workload: 'Integral',
      monthlySalary: 2800,
      contractType: 'CLT',
    }
  ];

  const performAnalysis = async () => {
    setIsCalculating(true);
    
    try {
      // Simular delay de cálculo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calcular receitas e custos
      const fieldRevenue = calculateFieldRentalRevenue(mockFields, market);
      const operationalCosts = calculateDetailedOperationalCosts(mockFields, mockStaff, market);
      
      // Mock de receita detalhada
      const detailedRevenue = {
        fieldRental: {
          regularRentals: fieldRevenue.annual * 0.7,
          tournaments: fieldRevenue.annual * 0.15,
          corporateEvents: fieldRevenue.annual * 0.1,
          seasonalAdjustment: fieldRevenue.annual * 0.05,
          total: fieldRevenue.annual
        },
        membership: {
          monthlyFees: 60000,
          annualFees: 90000,
          initationFees: 30000,
          familyPackages: 40000,
          corporateMembers: 40000,
          basicTier: 120000,
          premiumTier: 180000,
          vipTier: 60000,
          corporateMemberships: 80000,
          total: 440000
        },
        soccerSchool: {
          monthlyTuition: 180000,
          enrollmentFees: 25000,
          camps: 35000,
          privateClasses: 45000,
          tournaments: 15000,
          total: 300000
        },
        sponsorship: {
          mainSponsor: 120000,
          jerseySponsors: 60000,
          facilityNaming: 80000,
          equipmentSponsors: 40000,
          eventSponsors: 30000,
          digitalSponsors: 20000,
          total: 350000
        },
        merchandise: {
          jerseys: 20000,
          accessories: 15000,
          equipment: 25000,
          souvenirs: 10000,
          uniformes: 45000,
          acessorios: 25000,
          equipamentos: 35000,
          total: 120000
        },
        events: {
          tournaments: 80000,
          corporateEvents: 120000,
          socialEvents: 60000,
          rentals: 40000,
          total: 300000
        },
        foodBeverage: {
          restaurant: 150000,
          bar: 80000,
          snackBar: 60000,
          vending: 25000,
          catering: 35000,
          total: 350000
        },
        other: [],
        total: fieldRevenue.annual + 440000 + 300000 + 350000 + 120000 + 300000 + 350000
      };
      
      // Calcular KPIs estratégicos
      const kpis = calculateStrategicKPIs(detailedRevenue, operationalCosts, mockFields, 250);
      setStrategicKPIs(kpis);
      
      // Análise abrangente
      const analysis = comprehensiveFootballClubAnalysis(
        mockFields,
        mockStaff,
        market,
        480000, // Investimento inicial
        12
      );
      setComprehensiveAnalysis(analysis);
      
      // Monte Carlo
      const baseScenario = {
        years: 12,
        initialInvestment: 480000,
        annualRevenue: detailedRevenue.total,
        annualCosts: operationalCosts.total,
        growthRate: market.growthPotential,
        discountRate: market.discountRate
      };
      
      const uncertainties = {
        annualRevenue: 0.2,
        annualCosts: 0.15,
        growthRate: 0.3,
        utilizationRate: 0.25
      };
      
      const monteCarlo = advancedMonteCarloAnalysis(baseScenario, uncertainties, 5000);
      setMonteCarloResults(monteCarlo);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    performAnalysis();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: Eye, description: 'Dashboard executivo' },
    { id: 'kpis', name: 'KPIs Estratégicos', icon: Target, description: 'Indicadores de performance' },
    { id: 'sensitivity', name: 'Análise de Sensibilidade', icon: Activity, description: 'Impacto de variáveis' },
    { id: 'risks', name: 'Gestão de Riscos', icon: AlertTriangle, description: 'Identificação e mitigação' },
    { id: 'scenarios', name: 'Cenários Monte Carlo', icon: BarChart3, description: 'Simulações probabilísticas' },
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

  const renderKPICard = (metric: KPIMetric, icon: any) => {
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
          
          {/* Barra de progresso */}
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
      {/* Header */}
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
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
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

      {/* Status da Análise */}
      {comprehensiveAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="metric-label">VPL</p>
                <p className="metric-value text-blue-600">
                  {formatCurrency(comprehensiveAnalysis.financialViability.npv)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="metric-card border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="metric-label">TIR</p>
                <p className="metric-value text-green-600">
                  {formatPercentage(comprehensiveAnalysis.financialViability.irr)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="metric-card border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="metric-label">Payback</p>
                <p className="metric-value text-purple-600">
                  {comprehensiveAnalysis.financialViability.paybackPeriod.toFixed(1)} anos
                </p>
              </div>
            </div>
          </div>
          
          <div className="metric-card border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="metric-label">Nível de Risco</p>
                <p className="metric-value text-orange-600">
                  {comprehensiveAnalysis.riskAnalysis.overallRiskLevel}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Visão Geral */}
        {activeTab === 'overview' && comprehensiveAnalysis && (
          <div className="space-y-6">
            {/* Resumo Executivo */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Resumo Executivo
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Principais indicadores de viabilidade do investimento
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {comprehensiveAnalysis.operationalViability.overallScore.toFixed(1)}/10
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Score Operacional</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Viabilidade operacional geral
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {comprehensiveAnalysis.strategicViability.strategicFit.toFixed(1)}/10
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Fit Estratégico</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alinhamento estratégico
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {comprehensiveAnalysis.marketViability.marketShareProjection * 100}%
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Market Share</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Projeção de participação
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SWOT Analysis */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Análise SWOT
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Forças
                      </h3>
                      <ul className="space-y-1">
                        {comprehensiveAnalysis.strategicViability.swotAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 dark:text-green-300">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Oportunidades
                      </h3>
                      <ul className="space-y-1">
                        {comprehensiveAnalysis.strategicViability.swotAnalysis.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                            • {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Fraquezas
                      </h3>
                      <ul className="space-y-1">
                        {comprehensiveAnalysis.strategicViability.swotAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Ameaças
                      </h3>
                      <ul className="space-y-1">
                        {comprehensiveAnalysis.strategicViability.swotAnalysis.threats.map((threat, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300">
                            • {threat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Estratégicos */}
        {activeTab === 'kpis' && strategicKPIs && (
          <div className="space-y-6">
            {/* KPIs Financeiros */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  KPIs Financeiros
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(strategicKPIs.financial).map(([key, metric]) => 
                    renderKPICard(metric, DollarSign)
                  )}
                </div>
              </div>
            </div>

            {/* KPIs Operacionais */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  KPIs Operacionais
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(strategicKPIs.operational).map(([key, metric]) => 
                    renderKPICard(metric, Settings)
                  )}
                </div>
              </div>
            </div>

            {/* KPIs de Clientes */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  KPIs de Clientes
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(strategicKPIs.customer).map(([key, metric]) => 
                    renderKPICard(metric, Users)
                  )}
                </div>
              </div>
            </div>

            {/* KPIs de Crescimento */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  KPIs de Crescimento
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(strategicKPIs.growth).map(([key, metric]) => 
                    renderKPICard(metric, TrendingUp)
                  )}
                </div>
              </div>
            </div>

            {/* KPIs de Sustentabilidade */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  KPIs de Sustentabilidade
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(strategicKPIs.sustainability).map(([key, metric]) => 
                    renderKPICard(metric, Leaf)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análise de Sensibilidade */}
        {activeTab === 'sensitivity' && comprehensiveAnalysis && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Análise de Sensibilidade - Gráfico Tornado
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Impacto das variáveis-chave no VPL do projeto
                </p>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {comprehensiveAnalysis.sensitivityAnalysis.tornadoChart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.variable}
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded">
                          <div 
                            className="h-full bg-red-400 rounded-l"
                            style={{ 
                              width: `${Math.abs(item.lowImpact) / Math.max(Math.abs(item.lowImpact), Math.abs(item.highImpact)) * 40}%` 
                            }}
                          />
                          <div 
                            className="h-full bg-green-400 rounded-r absolute top-0 right-0"
                            style={{ 
                              width: `${Math.abs(item.highImpact) / Math.max(Math.abs(item.lowImpact), Math.abs(item.highImpact)) * 40}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatCurrency(item.lowImpact)}</span>
                          <span>{formatCurrency(item.highImpact)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestão de Riscos */}
        {activeTab === 'risks' && comprehensiveAnalysis && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Matriz de Riscos Identificados
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {comprehensiveAnalysis.riskAnalysis.risks.map((risk) => (
                    <div key={risk.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              risk.category === 'Financeiro' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              risk.category === 'Operacional' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {risk.category}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {risk.timeframe}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {risk.description}
                          </h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Probabilidade:</span>
                              <div className="font-medium">{(risk.probability * 100).toFixed(0)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Impacto:</span>
                              <div className="font-medium">{(risk.impact * 100).toFixed(0)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Score:</span>
                              <div className={`font-medium ${
                                risk.riskScore >= 0.5 ? 'text-red-600' :
                                risk.riskScore >= 0.3 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {(risk.riskScore * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Estratégias de Mitigação */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Estratégias de Mitigação
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {comprehensiveAnalysis.riskAnalysis.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {strategy.strategy}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Custo:</span>
                          <div className="font-medium">{formatCurrency(strategy.cost)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Efetividade:</span>
                          <div className="font-medium">{(strategy.effectiveness * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Prazo:</span>
                          <div className="font-medium">{strategy.timeframe}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cenários Monte Carlo */}
        {activeTab === 'scenarios' && monteCarloResults && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Simulação Monte Carlo - {monteCarloResults.iterations.toLocaleString()} iterações
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Distribuição probabilística do VPL
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(monteCarloResults.statistics.mean)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Média</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(monteCarloResults.statistics.median)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mediana</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(monteCarloResults.statistics.standardDeviation)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Desvio Padrão</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {((monteCarloResults.results.filter((r: any) => r.npv > 0).length / monteCarloResults.results.length) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prob. VPL {'>'} 0</p>
                  </div>
                </div>

                {/* Percentis */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="font-medium text-red-600">P5</div>
                    <div className="text-sm">{formatCurrency(monteCarloResults.statistics.percentiles.p5)}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="font-medium text-yellow-600">P25</div>
                    <div className="text-sm">{formatCurrency(monteCarloResults.statistics.percentiles.p25)}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="font-medium text-blue-600">P75</div>
                    <div className="text-sm">{formatCurrency(monteCarloResults.statistics.percentiles.p75)}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="font-medium text-green-600">P95</div>
                    <div className="text-sm">{formatCurrency(monteCarloResults.statistics.percentiles.p95)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
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
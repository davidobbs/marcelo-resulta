'use client';

import { useEffect, useState } from 'react';
import { 
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useAnalysis, useProjections } from '@/stores/useAppStore';
import { formatCurrency, formatPercentage, formatPeriod } from '@/utils/format';

export default function ViabilidadePage() {
  const { viability, projections, recalculate } = useFinancialCalculations();
  const analysis = useAnalysis();
  const storedProjections = useProjections();
  const [selectedScenario, setSelectedScenario] = useState<'pessimista' | 'realista' | 'otimista'>('realista');
  const [showDetails, setShowDetails] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Dados de viabilidade
  const viabilityData = {
    npv: viability?.npv || analysis?.valuation?.npv || 850000,
    irr: viability?.irr || analysis?.valuation?.irr || 0.283,
    paybackPeriod: viability?.paybackPeriod || analysis?.valuation?.paybackPeriod || 3.2,
    roi: viability?.roi || analysis?.valuation?.roi || 0.283,
    breakEvenPoint: viability?.breakEvenPoint || 18
  };

  // Cenários de análise
  const scenarios = {
    pessimista: {
      name: 'Cenário Pessimista',
      description: 'Condições desfavoráveis de mercado',
      assumptions: ['Ocupação 45%', 'Crescimento 5%', 'Inflação 8%'],
      npv: viabilityData.npv * 0.6,
      irr: viabilityData.irr * 0.7,
      payback: viabilityData.paybackPeriod * 1.4,
      probability: 0.2,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    realista: {
      name: 'Cenário Realista',
      description: 'Condições normais de mercado',
      assumptions: ['Ocupação 65%', 'Crescimento 12%', 'Inflação 6%'],
      npv: viabilityData.npv,
      irr: viabilityData.irr,
      payback: viabilityData.paybackPeriod,
      probability: 0.6,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    otimista: {
      name: 'Cenário Otimista',
      description: 'Condições favoráveis de mercado',
      assumptions: ['Ocupação 80%', 'Crescimento 18%', 'Inflação 4%'],
      npv: viabilityData.npv * 1.4,
      irr: viabilityData.irr * 1.3,
      payback: viabilityData.paybackPeriod * 0.8,
      probability: 0.2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  };

  const currentScenario = scenarios[selectedScenario];

  // Métricas de viabilidade
  const viabilityMetrics = [
    {
      name: 'Valor Presente Líquido (VPL)',
      value: currentScenario.npv,
      format: 'currency',
      description: 'Valor presente dos fluxos de caixa futuros',
      status: currentScenario.npv > 0 ? 'positive' : 'negative',
      icon: DollarSign,
      benchmark: 0,
      interpretation: currentScenario.npv > 0 ? 'Projeto viável' : 'Projeto inviável'
    },
    {
      name: 'Taxa Interna de Retorno (TIR)',
      value: currentScenario.irr,
      format: 'percentage',
      description: 'Taxa de retorno que zera o VPL',
      status: currentScenario.irr > 0.12 ? 'positive' : 'negative',
      icon: TrendingUp,
      benchmark: 0.12,
      interpretation: currentScenario.irr > 0.12 ? 'Retorno acima do custo de capital' : 'Retorno abaixo do custo de capital'
    },
    {
      name: 'Período de Payback',
      value: currentScenario.payback,
      format: 'period',
      description: 'Tempo para recuperar o investimento',
      status: currentScenario.payback < 4 ? 'positive' : 'negative',
      icon: Clock,
      benchmark: 4,
      interpretation: currentScenario.payback < 4 ? 'Retorno rápido' : 'Retorno lento'
    },
    {
      name: 'Retorno sobre Investimento (ROI)',
      value: viabilityData.roi,
      format: 'percentage',
      description: 'Retorno percentual sobre investimento',
      status: viabilityData.roi > 0.2 ? 'positive' : 'negative',
      icon: Target,
      benchmark: 0.2,
      interpretation: viabilityData.roi > 0.2 ? 'ROI atrativo' : 'ROI baixo'
    }
  ];

  // Análise de riscos
  const riskAnalysis = [
    {
      factor: 'Risco de Mercado',
      level: 'Médio',
      impact: 0.3,
      description: 'Flutuações na demanda por aluguel de quadras',
      mitigation: 'Diversificação de serviços e parcerias'
    },
    {
      factor: 'Risco Operacional',
      level: 'Baixo',
      impact: 0.15,
      description: 'Problemas na operação e manutenção',
      mitigation: 'Manutenção preventiva e equipe treinada'
    },
    {
      factor: 'Risco Financeiro',
      level: 'Médio',
      impact: 0.25,
      description: 'Variações nas taxas de juros e inflação',
      mitigation: 'Hedging e contratos indexados'
    },
    {
      factor: 'Risco Regulatório',
      level: 'Baixo',
      impact: 0.1,
      description: 'Mudanças na legislação esportiva',
      mitigation: 'Acompanhamento jurídico especializado'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'Médio': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'Baixo': return 'text-green-600 bg-green-100 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'period':
        return formatPeriod(value);
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análise de Viabilidade
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Análise detalhada de VPL, TIR, payback e cenários de investimento
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-outline flex items-center gap-2"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
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

      {/* Seletor de Cenários */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cenários de Análise
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedScenario === key
                    ? `border-blue-500 ${scenario.bgColor}`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(key as any)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${scenario.color}`}>
                    {scenario.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {(scenario.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {scenario.description}
                </p>
                <div className="space-y-1">
                  {scenario.assumptions.map((assumption, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      • {assumption}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de Viabilidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {viabilityMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.name} className="metric-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    metric.status === 'positive' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      metric.status === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="metric-label">{metric.name}</p>
                    <p className={`metric-value ${
                      metric.status === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatValue(metric.value, metric.format)}
                    </p>
                    {showDetails && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          {metric.description}
                        </p>
                        <p className={`text-xs font-medium ${
                          metric.status === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.interpretation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {metric.status === 'positive' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparação de Cenários */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Comparação de Cenários
          </h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Métrica</th>
                  <th className="table-header-cell text-red-600">Pessimista</th>
                  <th className="table-header-cell text-blue-600">Realista</th>
                  <th className="table-header-cell text-green-600">Otimista</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="table-cell font-medium">VPL</td>
                  <td className="table-cell text-red-600">{formatCurrency(scenarios.pessimista.npv)}</td>
                  <td className="table-cell text-blue-600">{formatCurrency(scenarios.realista.npv)}</td>
                  <td className="table-cell text-green-600">{formatCurrency(scenarios.otimista.npv)}</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">TIR</td>
                  <td className="table-cell text-red-600">{formatPercentage(scenarios.pessimista.irr)}</td>
                  <td className="table-cell text-blue-600">{formatPercentage(scenarios.realista.irr)}</td>
                  <td className="table-cell text-green-600">{formatPercentage(scenarios.otimista.irr)}</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Payback</td>
                  <td className="table-cell text-red-600">{formatPeriod(scenarios.pessimista.payback)}</td>
                  <td className="table-cell text-blue-600">{formatPeriod(scenarios.realista.payback)}</td>
                  <td className="table-cell text-green-600">{formatPeriod(scenarios.otimista.payback)}</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Probabilidade</td>
                  <td className="table-cell text-red-600">{formatPercentage(scenarios.pessimista.probability)}</td>
                  <td className="table-cell text-blue-600">{formatPercentage(scenarios.realista.probability)}</td>
                  <td className="table-cell text-green-600">{formatPercentage(scenarios.otimista.probability)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Análise de Riscos */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Análise de Riscos
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {riskAnalysis.map((risk, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {risk.factor}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {risk.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Impacto:</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${risk.impact * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatPercentage(risk.impact)}
                    </span>
                  </div>
                </div>
                {showDetails && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Estratégia de Mitigação
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conclusões e Recomendações */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Conclusões e Recomendações
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Viabilidade do Projeto
              </h3>
              <div className="space-y-3">
                {currentScenario.npv > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Projeto Viável
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        O VPL positivo de {formatCurrency(currentScenario.npv)} indica que o projeto 
                        gerará valor para os investidores.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">
                        Projeto Inviável
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-200">
                        O VPL negativo indica que o projeto pode não ser rentável 
                        nas condições atuais.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">TIR:</span>
                    <span className="font-medium">{formatPercentage(currentScenario.irr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payback:</span>
                    <span className="font-medium">{formatPeriod(currentScenario.payback)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recomendações Estratégicas
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Diversificação de Receitas
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Investir em escolinha de futebol e eventos corporativos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Otimização Operacional
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Melhorar taxa de ocupação através de parcerias
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PieChart className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Controle de Custos
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitorar despesas operacionais e implementar eficiências
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
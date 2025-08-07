'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  BarChart3,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  LineChart
} from 'lucide-react';
import { AdvancedChart } from '@/components/charts/AdvancedChart';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface ScenarioCardProps {
  title: string;
  description: string;
  profitability: number;
  revenue: number;
  costs: number;
  margin: number;
  color: 'green' | 'blue' | 'red';
  isActive?: boolean;
  onClick: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  title, 
  description, 
  profitability, 
  revenue, 
  costs, 
  margin, 
  color, 
  isActive,
  onClick 
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
    blue: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    red: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  const activeClasses = isActive ? 'ring-2 ring-blue-500 border-blue-500' : '';

  return (
    <div 
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${colorClasses[color]} ${activeClasses}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex items-center gap-1">
          {profitability > 0 ? (
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          ) : (
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
      
      <p className="text-sm opacity-75 mb-4">{description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm opacity-75">Receita:</span>
          <span className="font-semibold">{formatCurrency(revenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm opacity-75">Custos:</span>
          <span className="font-semibold">{formatCurrency(costs)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm opacity-75">Lucro:</span>
          <span className="font-semibold">{formatCurrency(profitability)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm opacity-75">Margem:</span>
          <span className="font-bold">{formatPercentage(margin)}</span>
        </div>
      </div>
    </div>
  );
};

interface SensitivityItemProps {
  variable: string;
  baseValue: number;
  variations: Array<{
    variation: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  }>;
  unit: string;
}

const SensitivityItem: React.FC<SensitivityItemProps> = ({ variable, baseValue, variations, unit }) => {
  const formatValue = (value: number) => {
    if (unit === 'currency') return formatCurrency(value);
    if (unit === 'percentage') return formatPercentage(value / 100);
    return value.toLocaleString('pt-BR');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {variable}
        </h4>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Base: {formatValue(baseValue)}
        </span>
      </div>
      
      <div className="space-y-3">
        {variations.map((variation, index) => {
          const isPositive = variation.netProfit > 0;
          const changeColor = variation.variation > 0 ? 'text-blue-600' : 'text-red-600';
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${changeColor}`}>
                  {variation.variation > 0 ? '+' : ''}{variation.variation.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatValue(baseValue * (1 + variation.variation / 100))}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(variation.netProfit)}
                  </div>
                  <div className="text-gray-500">
                    {formatPercentage(variation.profitMargin)}
                  </div>
                </div>
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ScenarioAnalysisPage() {
  const {
    generateScenarios,
    sensitivityAnalysis,
    variables
  } = useFinancialEngine();

  const [scenarios, setScenarios] = useState<any>({});
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [selectedVariables] = useState<string[]>(['field_rental_rate', 'field_utilization_rate']);
  const [isLoading, setIsLoading] = useState(false);

  const loadScenarios = async () => {
    setIsLoading(true);
    try {
      // Gera cenários
      const scenarioData = await generateScenarios(12); // Passa o número de meses
      setScenarios(scenarioData);

      // Análise de sensibilidade
      const importantVars = variables.filter(v => 
        ['field_rental_rate', 'field_utilization_rate', 'number_of_fields', 'staff_salaries'].includes(v.id)
      );

      const sensitivityResults = await Promise.all(importantVars.map(async variable => {
        const variations = [-20, -10, -5, 5, 10, 20];
        const results = await sensitivityAnalysis({ variableId: variable.id, variations: variations.map(v => v / 100) });
        
        return {
          variable: variable.name,
          variableId: variable.id,
          baseValue: variable.value,
          unit: variable.unit,
          variations: results
        };
      }));

      setSensitivityData(sensitivityResults);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const scenarioChartData = useMemo(() => {
    if (!scenarios.realistic) return [];
    
    return scenarios.realistic.map((projection: any, index: number) => ({
      month: `Mês ${projection.month}`,
      otimista: scenarios.optimistic[index]?.profit || 0,
      realista: projection.profit,
      pessimista: scenarios.pessimistic[index]?.profit || 0
    }));
  }, [scenarios]);

  const comparisonData = useMemo(() => {
    if (!scenarios.realistic) return [];

    const calculateTotals = (projections: any[]) => {
      return projections.reduce((acc, p) => ({
        revenue: acc.revenue + p.revenue,
        costs: acc.costs + p.costs,
        profit: acc.profit + p.profit
      }), { revenue: 0, costs: 0, profit: 0 });
    };

    const optimistic = calculateTotals(scenarios.optimistic || []);
    const realistic = calculateTotals(scenarios.realistic || []);
    const pessimistic = calculateTotals(scenarios.pessimistic || []);

    return [
      {
        scenario: 'Pessimista',
        receita: pessimistic.revenue,
        custos: pessimistic.costs,
        lucro: pessimistic.profit,
        margin: pessimistic.revenue > 0 ? pessimistic.profit / pessimistic.revenue : 0
      },
      {
        scenario: 'Realista',
        receita: realistic.revenue,
        custos: realistic.costs,
        lucro: realistic.profit,
        margin: realistic.revenue > 0 ? realistic.profit / realistic.revenue : 0
      },
      {
        scenario: 'Otimista',
        receita: optimistic.revenue,
        custos: optimistic.costs,
        lucro: optimistic.profit,
        margin: optimistic.revenue > 0 ? optimistic.profit / optimistic.revenue : 0
      }
    ];
  }, [scenarios]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Análise de Cenários
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise de sensibilidade e projeções de diferentes cenários financeiros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadScenarios}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Processando...' : 'Recalcular'}
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cenários Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {comparisonData.map((scenario, index) => {
          const color = index === 0 ? 'red' : index === 1 ? 'blue' : 'green';
          const isActive = selectedScenario === (index === 0 ? 'pessimistic' : index === 1 ? 'realistic' : 'optimistic');
          
          return (
            <ScenarioCard
              key={scenario.scenario}
              title={scenario.scenario}
              description={`Projeção ${scenario.scenario.toLowerCase()} para 12 meses`}
              profitability={scenario.lucro}
              revenue={scenario.receita}
              costs={scenario.custos}
              margin={scenario.margin}
              color={color}
              isActive={isActive}
              onClick={() => setSelectedScenario(index === 0 ? 'pessimistic' : index === 1 ? 'realistic' : 'optimistic')}
            />
          );
        })}
      </div>

      {/* Gráficos de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução dos Cenários */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Evolução dos Cenários (12 Meses)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LineChart className="w-4 h-4" />
              Projeção
            </div>
          </div>
          {scenarioChartData.length > 0 ? (
            <AdvancedChart
              type="line"
              data={scenarioChartData}
              xKey="month"
              yKeys={[
                { key: 'otimista', name: 'Otimista', color: '#10B981' },
                { key: 'realista', name: 'Realista', color: '#3B82F6' },
                { key: 'pessimista', name: 'Pessimista', color: '#EF4444' }
              ]}
              height={350}
              currency={true}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Carregando dados de cenários...</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparação Total */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Comparação Anual Total
          </h3>
          {comparisonData.length > 0 ? (
            <AdvancedChart
              type="composed"
              data={comparisonData}
              xKey="scenario"
              yKeys={[
                { key: 'receita', name: 'Receita', color: '#10B981', type: 'bar' },
                { key: 'custos', name: 'Custos', color: '#EF4444', type: 'bar' },
                { key: 'lucro', name: 'Lucro', color: '#3B82F6', type: 'line' }
              ]}
              height={350}
              currency={true}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Processando comparações...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Análise de Sensibilidade */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análise de Sensibilidade
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Impacto das variações nas variáveis-chave</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sensitivityData.map((item, index) => (
            <SensitivityItem
              key={index}
              variable={item.variable}
              baseValue={item.baseValue}
              variations={item.variations}
              unit={item.unit}
            />
          ))}
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Insights da Análise de Cenários
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Principais Descobertas:</h4>
            <div className="space-y-3 text-sm">
              {comparisonData.length > 0 && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Cenário Otimista: +{formatPercentage((comparisonData[2].lucro - comparisonData[1].lucro) / comparisonData[1].lucro)} de lucro
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        Potencial de crescimento significativo com otimização
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">
                        Cenário Pessimista: {formatPercentage((comparisonData[0].lucro - comparisonData[1].lucro) / comparisonData[1].lucro)} de impacto
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Riscos identificados precisam de mitigação
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Recomendações Estratégicas:</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Focar na otimização da taxa de utilização dos campos</p>
              <p>• Considerar ajustes na estrutura de preços</p>
              <p>• Implementar planos de contingência para cenários adversos</p>
              <p>• Monitorar variáveis de alta sensibilidade constantemente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  Target,
  BarChart3,
  PieChart,
  Info,
  AlertTriangle
} from 'lucide-react';

interface Scenario {
  wacc: number;
  growth: number;
  value: number;
}

export default function ValuationPage() {
  const [selectedMethod, setSelectedMethod] = useState('dcf');
  const [timeHorizon, setTimeHorizon] = useState(10);

  // Dados base para cálculos
  const baseData = {
    currentRevenue: 540000,
    currentEbitda: 162000,
    currentEbit: 135000,
    currentNetIncome: 94500,
    totalAssets: 290000,
    equity: 200000,
    debt: 90000,
    shareCount: 1000,
    wacc: 0.12, // Custo médio ponderado de capital
    growthRate: 0.15,
    terminalGrowthRate: 0.04,
    marketMultiples: {
      peRatio: 15,
      evEbitda: 8,
      evRevenue: 2.5,
      pbRatio: 2.2,
    },
  };

  const calculateDCF = () => {
    const projections = [];
    let currentCashFlow = baseData.currentEbit * (1 - 0.25); // Após impostos
    
    // Projeções de fluxo de caixa
    for (let year = 1; year <= timeHorizon; year++) {
      currentCashFlow = currentCashFlow * (1 + baseData.growthRate);
      const presentValue = currentCashFlow / Math.pow(1 + baseData.wacc, year);
      projections.push({
        year,
        cashFlow: currentCashFlow,
        presentValue,
      });
    }
    
    // Valor terminal
    const terminalCashFlow = currentCashFlow * (1 + baseData.terminalGrowthRate);
    const terminalValue = terminalCashFlow / (baseData.wacc - baseData.terminalGrowthRate);
    const terminalPV = terminalValue / Math.pow(1 + baseData.wacc, timeHorizon);
    
    const totalPV = projections.reduce((sum, p) => sum + p.presentValue, 0);
    const enterpriseValue = totalPV + terminalPV;
    const equityValue = enterpriseValue - baseData.debt;
    const valuePerShare = equityValue / baseData.shareCount;
    
    return {
      projections,
      terminalValue,
      terminalPV,
      totalPV,
      enterpriseValue,
      equityValue,
      valuePerShare,
    };
  };

  const calculateMultiples = () => {
    const revenue = baseData.currentRevenue;
    const ebitda = baseData.currentEbitda;
    const netIncome = baseData.currentNetIncome;
    const bookValue = baseData.equity;
    
    return {
      peValuation: netIncome * baseData.marketMultiples.peRatio,
      evEbitdaValuation: (ebitda * baseData.marketMultiples.evEbitda) - baseData.debt,
      evRevenueValuation: (revenue * baseData.marketMultiples.evRevenue) - baseData.debt,
      pbValuation: bookValue * baseData.marketMultiples.pbRatio,
    };
  };

  const calculateAssetBased = () => {
    const liquidationValue = baseData.totalAssets * 0.7; // 70% do valor contábil
    const replacementValue = baseData.totalAssets * 1.2; // 120% para reposição
    const bookValue = baseData.equity;
    
    return {
      liquidationValue,
      replacementValue,
      bookValue,
      adjustedBookValue: bookValue * 1.1, // Ajuste por inflação
    };
  };

  const dcfResult = calculateDCF();
  const multiplesResult = calculateMultiples();
  const assetResult = calculateAssetBased();

  const valuationMethods = {
    dcf: {
      name: 'Fluxo de Caixa Descontado (DCF)',
      value: dcfResult.equityValue,
      description: 'Valor presente dos fluxos de caixa futuros',
      details: dcfResult,
    },
    multiples: {
      name: 'Múltiplos de Mercado',
      value: (multiplesResult.peValuation + multiplesResult.evEbitdaValuation) / 2,
      description: 'Baseado em múltiplos de empresas comparáveis',
      details: multiplesResult,
    },
    asset: {
      name: 'Valor Patrimonial',
      value: assetResult.adjustedBookValue,
      description: 'Baseado no valor dos ativos líquidos',
      details: assetResult,
    },
  };

  const currentMethod = valuationMethods[selectedMethod as keyof typeof valuationMethods];
  
  // Média ponderada dos métodos
  const weightedAverage = (
    dcfResult.equityValue * 0.5 +
    multiplesResult.peValuation * 0.3 +
    assetResult.adjustedBookValue * 0.2
  );

  const sensitivityAnalysis = () => {
    const scenarios: Scenario[] = [];
    const waccRange = [0.08, 0.10, 0.12, 0.14, 0.16];
    const growthRange = [0.10, 0.125, 0.15, 0.175, 0.20];
    
    waccRange.forEach(wacc => {
      growthRange.forEach(growth => {
        let currentCF = baseData.currentEbit * (1 - 0.25);
        let totalPV = 0;
        
        for (let year = 1; year <= timeHorizon; year++) {
          currentCF = currentCF * (1 + growth);
          totalPV += currentCF / Math.pow(1 + wacc, year);
        }
        
        const terminalCF = currentCF * (1 + baseData.terminalGrowthRate);
        const terminalValue = terminalCF / (wacc - baseData.terminalGrowthRate);
        const terminalPV = terminalValue / Math.pow(1 + wacc, timeHorizon);
        
        const enterpriseValue = totalPV + terminalPV;
        const equityValue = enterpriseValue - baseData.debt;
        
        scenarios.push({
          wacc,
          growth,
          value: equityValue,
        });
      });
    });
    
    return scenarios;
  };

  const sensitivity = sensitivityAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Valuation Empresarial
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Avaliação completa do valor do clube de futebol
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="form-select"
          >
            {Object.entries(valuationMethods).map(([key, method]) => (
              <option key={key} value={key}>
                {method.name}
              </option>
            ))}
          </select>
          
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value))}
            className="form-select"
          >
            <option value={5}>5 anos</option>
            <option value={10}>10 anos</option>
            <option value={15}>15 anos</option>
          </select>
        </div>
      </div>

      {/* Valuation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="metric-label">Método DCF</p>
              <p className="metric-value">R$ {Math.round(dcfResult.equityValue).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fluxo de caixa descontado
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="metric-label">Múltiplos</p>
              <p className="metric-value">R$ {Math.round(multiplesResult.peValuation).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Baseado em P/E
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="metric-label">Patrimonial</p>
              <p className="metric-value">R$ {Math.round(assetResult.adjustedBookValue).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Valor dos ativos
          </p>
        </div>

        <div className="metric-card bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="metric-label">Valor Final</p>
              <p className="metric-value">R$ {Math.round(weightedAverage).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Média ponderada
          </p>
        </div>
      </div>

      {/* Method Details */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentMethod.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentMethod.description}
          </p>
        </div>
        <div className="card-body">
          {selectedMethod === 'dcf' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parâmetros
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>WACC:</span>
                      <span className="font-medium">{(baseData.wacc * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescimento:</span>
                      <span className="font-medium">{(baseData.growthRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa Terminal:</span>
                      <span className="font-medium">{(baseData.terminalGrowthRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Presente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fluxos Explícitos:</span>
                      <span className="font-medium">R$ {Math.round(dcfResult.totalPV).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Terminal:</span>
                      <span className="font-medium">R$ {Math.round(dcfResult.terminalPV).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Enterprise Value:</span>
                      <span>R$ {Math.round(dcfResult.enterpriseValue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor do Equity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Enterprise Value:</span>
                      <span className="font-medium">R$ {Math.round(dcfResult.enterpriseValue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(-) Dívida Líquida:</span>
                      <span className="font-medium">R$ {baseData.debt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Valor do Equity:</span>
                      <span>R$ {Math.round(dcfResult.equityValue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Ano</th>
                      <th className="table-header-cell">Fluxo de Caixa</th>
                      <th className="table-header-cell">Valor Presente</th>
                      <th className="table-header-cell">% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcfResult.projections.slice(0, 5).map((projection) => (
                      <tr key={projection.year} className="table-row">
                        <td className="table-cell">{projection.year}</td>
                        <td className="table-cell">R$ {Math.round(projection.cashFlow).toLocaleString()}</td>
                        <td className="table-cell">R$ {Math.round(projection.presentValue).toLocaleString()}</td>
                        <td className="table-cell">
                          {((projection.presentValue / dcfResult.enterpriseValue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="table-row border-t-2 border-gray-300 dark:border-gray-600">
                      <td className="table-cell font-bold">Terminal</td>
                      <td className="table-cell font-bold">-</td>
                      <td className="table-cell font-bold">R$ {Math.round(dcfResult.terminalPV).toLocaleString()}</td>
                      <td className="table-cell font-bold">
                        {((dcfResult.terminalPV / dcfResult.enterpriseValue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedMethod === 'multiples' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Múltiplos de Lucro
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">P/E Ratio</p>
                      <p className="text-xs text-gray-500">Price-to-Earnings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{baseData.marketMultiples.peRatio}x</p>
                      <p className="text-xs text-green-600">R$ {Math.round(multiplesResult.peValuation).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Múltiplos de Empresa
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">EV/EBITDA</p>
                      <p className="text-xs text-gray-500">Enterprise Value / EBITDA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{baseData.marketMultiples.evEbitda}x</p>
                      <p className="text-xs text-green-600">R$ {Math.round(multiplesResult.evEbitdaValuation).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">EV/Receita</p>
                      <p className="text-xs text-gray-500">Enterprise Value / Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{baseData.marketMultiples.evRevenue}x</p>
                      <p className="text-xs text-green-600">R$ {Math.round(multiplesResult.evRevenueValuation).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">P/B Ratio</p>
                      <p className="text-xs text-gray-500">Price-to-Book</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{baseData.marketMultiples.pbRatio}x</p>
                      <p className="text-xs text-green-600">R$ {Math.round(multiplesResult.pbValuation).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'asset' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valor dos Ativos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Valor Contábil</span>
                    <span className="text-sm font-medium">R$ {assetResult.bookValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Valor Ajustado</span>
                    <span className="text-sm font-medium">R$ {Math.round(assetResult.adjustedBookValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Valor de Reposição</span>
                    <span className="text-sm font-medium">R$ {Math.round(assetResult.replacementValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-sm">Valor de Liquidação</span>
                    <span className="text-sm font-medium text-red-600">R$ {Math.round(assetResult.liquidationValue).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Análise de Ativos
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Terreno e instalações físicas representam 70% dos ativos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Equipamentos e tecnologia com depreciação acelerada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Valor de marca e clientela não contabilizados</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Potencial de valorização imobiliária</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Análise de Sensibilidade
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Impacto das variações nas premissas do DCF
          </p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table text-xs">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">WACC / Crescimento</th>
                  <th className="table-header-cell">10%</th>
                  <th className="table-header-cell">12.5%</th>
                  <th className="table-header-cell">15%</th>
                  <th className="table-header-cell">17.5%</th>
                  <th className="table-header-cell">20%</th>
                </tr>
              </thead>
              <tbody>
                {[0.08, 0.10, 0.12, 0.14, 0.16].map(wacc => (
                  <tr key={wacc} className="table-row">
                    <td className="table-cell font-medium">{(wacc * 100).toFixed(0)}%</td>
                    {[0.10, 0.125, 0.15, 0.175, 0.20].map(growth => {
                      const scenario = sensitivity.find(s => s.wacc === wacc && s.growth === growth);
                      const isBase = wacc === 0.12 && growth === 0.15;
                      return (
                        <td key={growth} className={`table-cell ${isBase ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''}`}>
                          R$ {scenario ? Math.round(scenario.value / 1000).toLocaleString() : 0}k
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Resumo Executivo
              </h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Valor Recomendado
                </p>
                <p className="text-xl font-bold text-green-600">
                  R$ {Math.round(weightedAverage).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Média ponderada dos métodos
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ROI sobre Investimento:</span>
                  <span className="font-medium">{((weightedAverage / baseData.totalAssets - 1) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Múltiplo sobre Receita:</span>
                  <span className="font-medium">{(weightedAverage / baseData.currentRevenue).toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>P/E Implícito:</span>
                  <span className="font-medium">{(weightedAverage / baseData.currentNetIncome).toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Fatores de Valor
              </h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pontos Fortes
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    Fluxo de caixa recorrente e previsível
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    Baixa dependência de sazonalidade
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    Ativos imobiliários com potencial de valorização
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Riscos
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    Competição local intensa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    Dependência do cenário econômico
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    Regulamentações municipais
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Limitações da Avaliação
            </h3>
            <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Valores baseados em projeções e premissas que podem não se materializar</li>
                <li>Mercado para este tipo de ativo pode ser limitado e ilíquido</li>
                <li>Múltiplos baseados em empresas comparáveis de outros setores</li>
                <li>Recomenda-se validação por avaliador independente certificado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
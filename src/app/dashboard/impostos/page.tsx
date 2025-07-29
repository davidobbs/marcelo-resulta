'use client';

import { useState } from 'react';
import { 
  Building2, 
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';

interface Regime {
  name: string;
  rate: number;
  description: string;
  limit: number | null;
  benefits: string[];
}

export default function ImpostosPage() {
  const [selectedMarket, setSelectedMarket] = useState('Brasil');

  const markets = {
    Brasil: {
      name: 'Brasil',
      currency: 'R$',
      taxes: {
        corporateIncomeTax: 25.0,
        socialContribution: 9.0,
        pis: 1.65,
        cofins: 7.6,
        iss: 5.0,
        laborTaxes: 70.0,
      },
      regimes: [
        {
          name: 'Simples Nacional',
          rate: 16.93,
          description: 'Regime simplificado para empresas até R$ 4,8 milhões',
          limit: 4800000,
          benefits: ['Unificação de tributos', 'Redução de burocracia', 'Menor alíquota'],
        },
        {
          name: 'Lucro Presumido',
          rate: 11.33,
          description: 'Presunção de lucro de 32% sobre receita',
          limit: 78000000,
          benefits: ['Menor complexidade', 'Previsibilidade'],
        },
        {
          name: 'Lucro Real',
          rate: 34.0,
          description: 'Tributação sobre lucro real apurado',
          limit: null,
          benefits: ['Aproveitamento de prejuízos', 'Dedução de despesas'],
        },
      ],
    },
    Europa: {
      name: 'Europa',
      currency: '€',
      taxes: {
        corporateIncomeTax: 22.0,
        vat: 20.0,
        socialSecurity: 25.0,
        laborTaxes: 40.0,
      },
      regimes: [
        {
          name: 'Standard Rate',
          rate: 22.0,
          description: 'Taxa padrão corporativa',
          limit: null,
          benefits: ['Dedução ampla de despesas', 'Créditos de inovação'],
        },
      ],
    },
    EmiratesArabes: {
      name: 'Emirados Árabes',
      currency: 'AED',
      taxes: {
        corporateIncomeTax: 9.0,
        vat: 5.0,
        laborTaxes: 15.0,
      },
      regimes: [
        {
          name: 'Standard Rate',
          rate: 9.0,
          description: 'Taxa corporativa padrão',
          limit: null,
          benefits: ['Zona franca disponível', 'Incentivos para startups'],
        },
      ],
    },
  };

  const currentMarket = markets[selectedMarket as keyof typeof markets];
  const annualRevenue = 540000; // R$ 45k * 12 meses

  const calculateTaxes = (regime: Regime) => {
    const grossTax = (annualRevenue * regime.rate) / 100;
    const laborCosts = (annualRevenue * 0.3 * currentMarket.taxes.laborTaxes) / 100;
    const totalTaxBurden = grossTax + laborCosts;
    const netIncome = annualRevenue - totalTaxBurden;

    return {
      grossTax,
      laborCosts,
      totalTaxBurden,
      netIncome,
      effectiveRate: (totalTaxBurden / annualRevenue) * 100,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Impostos & Tributação
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Análise tributária por mercado e regime fiscal
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="form-select"
          >
            {Object.keys(markets).map((market) => (
              <option key={market} value={market}>
                {markets[market as keyof typeof markets].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Panorama Tributário - {currentMarket.name}
            </h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="metric-label">Receita Anual Estimada</p>
                  <p className="metric-value">{currentMarket.currency} {annualRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="metric-label">Encargos Trabalhistas</p>
                  <p className="metric-value">{currentMarket.taxes.laborTaxes}%</p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="metric-label">Moeda</p>
                  <p className="metric-value">{currentMarket.currency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Regimes Comparison */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Comparação de Regimes Tributários
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Análise dos diferentes regimes disponíveis
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            {currentMarket.regimes.map((regime, index) => {
              const calculation = calculateTaxes(regime);
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Regime Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {regime.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {regime.description}
                      </p>
                      
                      {regime.limit && (
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-orange-600 dark:text-orange-400">
                            Limite: {currentMarket.currency} {regime.limit.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Benefícios:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {regime.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tax Calculation */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Taxa Base</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {regime.rate}%
                          </p>
                        </div>

                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Impostos</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {currentMarket.currency} {Math.round(calculation.grossTax).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Encargos</p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {currentMarket.currency} {Math.round(calculation.laborCosts).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Líquido</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {currentMarket.currency} {Math.round(calculation.netIncome).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Taxa Efetiva Total
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {calculation.effectiveRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tax Planning Tips */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Planejamento Tributário
            </h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Oportunidades de Otimização
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Estruturação adequada de pessoa jurídica
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Aproveitamento de incentivos fiscais locais
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Planejamento de distribuição de lucros
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Gestão de fluxo de caixa tributário
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Riscos e Compliance
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  Manutenção de documentação fiscal
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  Cumprimento de obrigações acessórias
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  Monitoramento de mudanças legislativas
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  Auditoria e revisão periódica
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
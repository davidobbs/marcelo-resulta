'use client';

import React, { useState } from 'react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useAppStore, useCountry } from '@/stores/useAppStore';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { BarChart, LineChart, PieChart, Info, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Mock de uma API de busca de parâmetros de mercado
const fetchLiveMarketData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência da rede
    
    const liveData = {
        discountRate: 0.135, // Ex: Taxa de juros subiu
        growthPotential: 0.11,  // Ex: Potencial de crescimento revisado para baixo
        marketSizeFactor: 1.05, // Ex: Mercado expandiu ligeiramente
    };
    
    return liveData;
};


export default function ValuationPage() {
  const { viability, projections, investment } = useFinancialCalculations();
  const { valuationParams, setValuationParams } = useAppStore(state => ({
    valuationParams: state.valuationParams,
    setValuationParams: state.setValuationParams,
  }));
  const countryProfile = useCountry();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    toast.info("Buscando parâmetros de mercado atualizados...");
    try {
      const liveData = await fetchLiveMarketData();
      setValuationParams({
        ...valuationParams,
        updateOnline: true, // Ativa o uso dos parâmetros online
        ...liveData,
      });
      toast.success("Parâmetros de Valuation atualizados com dados de mercado!");
    } catch (error) {
      toast.error("Não foi possível buscar os dados de mercado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOnlineParams = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setValuationParams({ ...valuationParams, updateOnline: isEnabled });
    if(isEnabled) {
        toast.info("Cálculos de Valuation agora usarão parâmetros online.");
    } else {
        toast.info("Cálculos de Valuation agora usarão parâmetros padrão.");
    }
  }

  const renderMetricCard = (title: string, value: string, icon: React.ReactNode, description: string) => (
      <div className="card">
        <div className="card-body">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {icon}
                </div>
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                <Info size={12} />
                {description}
            </p>
        </div>
      </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
                Valuation e Análise de Viabilidade
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
                Análise detalhada do valor do seu clube e da viabilidade do investimento.
            </p>
        </div>
        <div className="card p-3 bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleUpdate} 
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {isLoading ? 'Atualizando...' : 'Atualizar Online'}
                </button>
                <div className="flex items-center gap-2 pl-3 border-l border-emerald-300 dark:border-emerald-700">
                    <label htmlFor="toggle-online" className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Usar dados online:</label>
                    <input
                        type="checkbox"
                        id="toggle-online"
                        className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                        checked={valuationParams.updateOnline}
                        onChange={handleToggleOnlineParams}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderMetricCard("Valor Presente Líquido (VPL)", formatCurrency(viability.npv, countryProfile.countryProfile.currency.code), <LineChart className="text-green-500" />, "Soma dos fluxos de caixa futuros, descontados ao presente.")}
        {renderMetricCard("Taxa Interna de Retorno (TIR)", formatPercentage(viability.irr), <TrendingUp className="text-blue-500" />, "Taxa de desconto que zera o VPL do projeto.")}
        {renderMetricCard("Payback (Anos)", viability.paybackPeriod.toFixed(1), <BarChart className="text-orange-500" />, "Tempo necessário para recuperar o investimento inicial.")}
        {renderMetricCard("Índice de Lucratividade", viability.profitabilityIndex.toFixed(2), <PieChart className="text-purple-500" />, "Retorno gerado para cada unidade de capital investido.")}
      </div>

      <div className="card">
        <div className="card-header">
            <h2 className="text-xl font-semibold">Projeção de Fluxo de Caixa Livre (12 Anos)</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Ano</th>
                            <th scope="col" className="px-6 py-3">Fluxo de Caixa</th>
                            <th scope="col" className="px-6 py-3">Fluxo Acumulado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Investimento Inicial</th>
                            <td className="px-6 py-4 text-red-500">({formatCurrency(investment.total, countryProfile.countryProfile.currency.code)})</td>
                            <td className="px-6 py-4 text-red-500">({formatCurrency(investment.total, countryProfile.countryProfile.currency.code)})</td>
                        </tr>
                        {projections.map((proj, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{proj.year}</th>
                                <td className="px-6 py-4">{formatCurrency((proj.cashFlow?.net || 0) + (index === 0 ? investment.total : 0), countryProfile.countryProfile.currency.code)}</td>
                                <td className="px-6 py-4">{formatCurrency(proj.cashFlow?.accumulated || 0, countryProfile.countryProfile.currency.code)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
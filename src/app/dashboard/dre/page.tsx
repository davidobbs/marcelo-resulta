'use client';

import { useState } from 'react';
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/format';

export default function DREPage() {
  const { dre, recalculate } = useFinancialCalculations();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('annual');

  const getPeriodMultiplier = (): number => {
    switch (period) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'annual': return 12;
      default: return 1;
    }
  };

  const getMarginPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  const totalRevenue = dre?.receitaBruta || 0;
  const multiplier = getPeriodMultiplier();
  
  const receitas = dre?.breakdown?.receitas;
  const custos = dre?.breakdown?.custos;
  const accountLabels: Record<string, string> = {
    fieldRental: 'Locação de Campo',
    membership: 'Mensalidades',
    sponsorship: 'Patrocínio',
    soccerSchool: 'Escola de Futebol',
    other: 'Outras Receitas',
    personnel: 'Pessoal',
    facilities: 'Instalações',
    utilities: 'Utilidades',
    medical: 'Médico',
    transportation: 'Transporte',
    equipment: 'Equipamentos Operacionais',
    marketing: 'Marketing',
    administrative: 'Administrativo',
    insurance: 'Seguros',
    regulatory: 'Regulatório',
    technology: 'Tecnologia',
    competitions: 'Competições',
    transfers: 'Transferências',
    depreciation: 'Depreciação',
    hospitalityCosts: 'Hospitalidade',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              DRE Gerencial
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Demonstração do Resultado do Exercício - Análise detalhada da performance financeira
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={recalculate} className="btn-primary flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recalcular
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
                  onChange={(e) => setPeriod(e.target.value as 'monthly' | 'quarterly' | 'annual')}
                  className="form-select"
                >
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
              <button className="btn-outline flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Gráficos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DRE Table */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Demonstração do Resultado</h2>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Conta</th>
                  <th className="table-header-cell text-right">
                    Valor ({period === 'monthly' ? 'Mensal' : period === 'quarterly' ? 'Trimestral' : 'Anual'})
                  </th>
                  <th className="table-header-cell text-right">% Receita</th>
                </tr>
              </thead>
              <tbody>
                {/* Receitas */}
                <tr className="table-row bg-green-50 dark:bg-green-900/20">
                  <td className="table-cell font-semibold text-green-600 dark:text-green-400">RECEITAS</td>
                  <td colSpan={2}></td>
                </tr>
                {Object.entries(receitas || {}).map(([key, value]: [string, { value: number; percentage: number }]) => (
                  <tr key={key} className="table-row">
                    <td className="table-cell pl-8">{accountLabels[key] || key}</td>
                    <td className="table-cell text-right text-green-600 font-medium">
                      {formatCurrency((value?.value || 0) * multiplier)}
                    </td>
                    <td className="table-cell text-right text-sm text-gray-600">
                      {formatPercentage(value.percentage / 100)}
                    </td>
                  </tr>
                ))}
                <tr className="table-row bg-green-100 dark:bg-green-900/30">
                  <td className="table-cell font-semibold text-green-700 dark:text-green-300">RECEITA TOTAL</td>
                  <td className="table-cell text-right font-bold text-green-600">
                    {formatCurrency(totalRevenue * multiplier)}
                  </td>
                  <td className="table-cell text-right font-semibold text-green-600">100,00%</td>
                </tr>

                {/* Custos */}
                <tr className="table-row bg-red-50 dark:bg-red-900/20">
                  <td className="table-cell font-semibold text-red-600 dark:text-red-400">CUSTOS DIRETOS</td>
                  <td colSpan={2}></td>
                </tr>
                {Object.entries(custos || {}).map(([key, value]: [string, { value: number; percentage: number }]) => (
                   <tr key={key} className="table-row">
                   <td className="table-cell pl-8">{accountLabels[key] || key}</td>
                   <td className="table-cell text-right text-red-600 font-medium">
                     {formatCurrency((value?.value || 0) * multiplier)}
                   </td>
                   <td className="table-cell text-right text-sm text-gray-600">
                     {formatPercentage(value.percentage / 100)}
                   </td>
                 </tr>
                ))}
                <tr className="table-row bg-red-100 dark:bg-red-900/30">
                  <td className="table-cell font-semibold text-red-700 dark:text-red-300">TOTAL CUSTOS</td>
                  <td className="table-cell text-right font-bold text-red-600">
                    {formatCurrency((dre?.custosOperacionais || 0) * multiplier)}
                  </td>
                  <td className="table-cell text-right font-semibold text-red-600">
                    {formatPercentage(getMarginPercentage(dre?.custosOperacionais || 0, totalRevenue))}
                  </td>
                </tr>

                {/* Margem Bruta / Lucro Operacional */}
                <tr className="table-row bg-blue-100 dark:bg-blue-900/30">
                  <td className="table-cell font-bold text-blue-700 dark:text-blue-300">LUCRO OPERACIONAL</td>
                  <td className="table-cell text-right font-bold text-blue-600">
                    {formatCurrency((dre?.lucroOperacional || 0) * multiplier)}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-600">
                    {formatPercentage(getMarginPercentage(dre?.lucroOperacional || 0, totalRevenue))}
                  </td>
                </tr>

                {/* EBITDA */}
                <tr className="table-row bg-purple-100 dark:bg-purple-900/30">
                  <td className="table-cell font-bold text-purple-700 dark:text-purple-300">EBITDA</td>
                  <td className="table-cell text-right font-bold text-purple-600">
                    {formatCurrency((dre?.ebitda || 0) * multiplier)}
                  </td>
                  <td className="table-cell text-right font-bold text-purple-600">
                    {formatPercentage(getMarginPercentage(dre?.ebitda || 0, totalRevenue))}
                  </td>
                </tr>

                {/* Impostos e Lucro Líquido */}
                <tr className="table-row">
                  <td className="table-cell pl-8">Impostos</td>
                  <td className="table-cell text-right text-gray-600 font-medium">
                    {formatCurrency((dre?.impostos || 0) * multiplier)}
                  </td>
                  <td className="table-cell text-right text-sm text-gray-600">
                    {formatPercentage(getMarginPercentage(dre?.impostos || 0, totalRevenue))}
                  </td>
                </tr>
                <tr className="table-row bg-gray-900 dark:bg-gray-100">
                  <td className="table-cell font-bold text-white dark:text-gray-900">LUCRO LÍQUIDO</td>
                  <td className="table-cell text-right font-bold text-white dark:text-gray-900">
                    {formatCurrency((dre?.lucroLiquido || 0) * multiplier)}
                  </td>
                  <td className="table-cell text-right font-bold text-white dark:text-gray-900">
                    {formatPercentage(getMarginPercentage(dre?.lucroLiquido || 0, totalRevenue))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Margem Bruta</p>
              <p className="metric-value">{formatPercentage((dre?.margemBruta || 0) / 100)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Margem EBITDA</p>
              <p className="metric-value">{formatPercentage((dre?.margemEbitda || 0) / 100)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Margem Líquida</p>
              <p className="metric-value">{formatPercentage((dre?.margemLiquida || 0) / 100)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">ROI</p>
              <p className="metric-value">{formatPercentage(getMarginPercentage(dre?.lucroLiquido || 0, totalRevenue))}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Análise e Insights</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Pontos Fortes</h3>
              <div className="space-y-3">
                {getMarginPercentage(dre?.margemBruta || 0, totalRevenue) > 50 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Margem bruta saudável acima de 50%
                    </p>
                  </div>
                )}
                {dre?.lucroLiquido > 0 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Resultado líquido positivo
                    </p>
                  </div>
                )}
                {getMarginPercentage(dre?.ebitda || 0, totalRevenue) > 20 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      EBITDA com margem superior a 20%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Pontos de Atenção</h3>
              <div className="space-y-3">
                {getMarginPercentage(dre?.margemBruta || 0, totalRevenue) < 30 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Margem bruta baixa - revisar custos diretos
                    </p>
                  </div>
                )}
                {dre?.lucroLiquido < 0 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Prejuízo - necessário revisar estratégia
                    </p>
                  </div>
                )}
                {totalRevenue > 0 && ((dre?.custosOperacionais || 0) / totalRevenue) > 0.4 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Despesas operacionais elevadas (mais de 40% da receita)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
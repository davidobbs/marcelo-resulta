'use client';

import React, { useState } from 'react';
import { ClientTime, ClientDate } from '@/components/ui/ClientOnly';
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  Eye,
  Share2,
  Settings,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Database,
  Activity
} from 'lucide-react';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { AdvancedChart } from '@/components/charts/AdvancedChart';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'strategic';
  icon: React.ReactNode;
  sections: string[];
  estimatedTime: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  status: 'generating' | 'ready' | 'error';
  downloadUrl?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'financial-summary',
    name: 'Relatório Financeiro Executivo',
    description: 'Resumo completo da situação financeira com métricas principais e projeções',
    type: 'financial',
    icon: <DollarSign className="w-6 h-6" />,
    sections: ['Resumo Executivo', 'Métricas Principais', 'Análise de Tendências', 'Recomendações'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'performance-analysis',
    name: 'Análise de Performance',
    description: 'Análise detalhada de KPIs, ROI e indicadores de performance operacional',
    type: 'operational',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['KPIs Principais', 'Análise de ROI', 'Performance Operacional', 'Benchmarks'],
    estimatedTime: '3-4 min'
  },
  {
    id: 'scenario-comparison',
    name: 'Comparação de Cenários',
    description: 'Relatório detalhado comparando cenários otimista, realista e pessimista',
    type: 'strategic',
    icon: <BarChart3 className="w-6 h-6" />,
    sections: ['Cenários Principais', 'Análise de Sensibilidade', 'Riscos e Oportunidades', 'Estratégias'],
    estimatedTime: '4-5 min'
  },
  {
    id: 'cash-flow',
    name: 'Relatório de Fluxo de Caixa',
    description: 'Análise completa do fluxo de caixa histórico e projetado',
    type: 'financial',
    icon: <Activity className="w-6 h-6" />,
    sections: ['Fluxo Histórico', 'Projeções', 'Sazonalidade', 'Recomendações de Caixa'],
    estimatedTime: '3-4 min'
  },
  {
    id: 'investment-analysis',
    name: 'Análise de Investimentos',
    description: 'Relatório focado em análise de viabilidade e retorno de investimentos',
    type: 'strategic',
    icon: <Target className="w-6 h-6" />,
    sections: ['TIR e VPL', 'Payback', 'Análise de Risco', 'Recomendações de Investimento'],
    estimatedTime: '5-6 min'
  },
  {
    id: 'custom-report',
    name: 'Relatório Personalizado',
    description: 'Crie um relatório customizado selecionando seções específicas',
    type: 'financial',
    icon: <Settings className="w-6 h-6" />,
    sections: ['Configurável'],
    estimatedTime: 'Variável'
  }
];

const ReportCard: React.FC<{ 
  template: ReportTemplate; 
  onGenerate: (template: ReportTemplate) => void;
  isGenerating: boolean;
}> = ({ template, onGenerate, isGenerating }) => {
  const typeColors = {
    financial: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    operational: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    strategic: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
  };

  const typeTextColors = {
    financial: 'text-green-800 dark:text-green-300',
    operational: 'text-blue-800 dark:text-blue-300',
    strategic: 'text-purple-800 dark:text-purple-300'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${typeColors[template.type]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${typeTextColors[template.type]}`}>
            {template.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${typeTextColors[template.type]}`}>
              {template.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 ${typeTextColors[template.type]} capitalize`}>
              {template.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {template.estimatedTime}
        </div>
      </div>

      <p className={`text-sm ${typeTextColors[template.type]} opacity-80 mb-4`}>
        {template.description}
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Seções incluídas:</p>
        <div className="flex flex-wrap gap-1">
          {template.sections.map((section, index) => (
            <span 
              key={index}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border"
            >
              {section}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onGenerate(template)}
        disabled={isGenerating}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isGenerating 
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
            : `bg-white dark:bg-gray-800 ${typeTextColors[template.type]} hover:shadow-md border border-current`
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Gerar Relatório
          </>
        )}
      </button>
    </div>
  );
};

const ReportHistory: React.FC<{ reports: GeneratedReport[] }> = ({ reports }) => {
  const getStatusIcon = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'generating':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <Target className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'generating':
        return 'Gerando...';
      case 'ready':
        return 'Pronto';
      case 'error':
        return 'Erro';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Histórico de Relatórios
      </h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum relatório gerado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(report.status)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {report.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <ClientDate date={report.generatedAt} /> às <ClientTime date={report.generatedAt} />
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {getStatusText(report.status)}
                </span>
                {report.status === 'ready' && (
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReportsPage() {
  const { metrics, projections, summary } = useFinancialEngine();
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'financial' | 'operational' | 'strategic'>('all');

  // Simula dados de exemplo para preview dos relatórios
  const reportPreviewData = {
    monthlyRevenue: summary?.monthlyRevenue[0] || 0,
    monthlyCosts: summary?.monthlyCosts[0] || 0,
    monthlyProfit: summary?.monthlyProfit[0] || 0,
    profitMargin: metrics?.profitMargin || 0,
    roi: metrics?.roi || 0,
    projectionData: projections?.slice(0, 6).map(p => ({
      month: `Mês ${p.month}`,
      revenue: p.revenue,
      profit: p.profit
    })) || []
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    setIsGenerating(true);
    
    // Adiciona relatório ao histórico com status "generating"
    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      name: template.name,
      type: template.type,
      generatedAt: new Date(),
      status: 'generating'
    };
    
    setGeneratedReports(prev => [newReport, ...prev]);

    // Simula tempo de geração do relatório
    setTimeout(() => {
      setGeneratedReports(prev => 
        prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'ready' as const, downloadUrl: `/reports/${report.id}.pdf` }
            : report
        )
      );
      setIsGenerating(false);
    }, 3000 + Math.random() * 2000); // 3-5 segundos
  };

  const filteredTemplates = selectedType === 'all' 
    ? reportTemplates 
    : reportTemplates.filter(template => template.type === selectedType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Central de Relatórios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gere relatórios profissionais com análises detalhadas e insights estratégicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos os Tipos</option>
            <option value="financial">Financeiro</option>
            <option value="operational">Operacional</option>
            <option value="strategic">Estratégico</option>
          </select>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Receita Mensal</span>
          </div>
          <p className="text-xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(reportPreviewData.monthlyRevenue)}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Lucro Mensal</span>
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(reportPreviewData.monthlyProfit)}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Margem</span>
          </div>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
            {formatPercentage(reportPreviewData.profitMargin)}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">ROI Mensal</span>
          </div>
          <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
            {formatPercentage(reportPreviewData.roi)}
          </p>
        </div>
      </div>

      {/* Templates de Relatórios */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Modelos de Relatórios Disponíveis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <ReportCard
              key={template.id}
              template={template}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating}
            />
          ))}
        </div>
      </div>

      {/* Preview Chart */}
      {reportPreviewData.projectionData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Preview: Projeção Financeira (6 Meses)
          </h3>
          <AdvancedChart
            type="composed"
            data={reportPreviewData.projectionData}
            xKey="month"
            yKeys={[
              { key: 'revenue', name: 'Receita', color: '#10B981', type: 'bar' },
              { key: 'profit', name: 'Lucro', color: '#3B82F6', type: 'line' }
            ]}
            height={300}
            currency={true}
          />
        </div>
      )}

      {/* Histórico de Relatórios */}
      <ReportHistory reports={generatedReports} />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FileDown,
  Share2
} from 'lucide-react';

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedPeriod, setSelectedPeriod] = useState('mes-atual');
  const [selectedReports, setSelectedReports] = useState<string[]>(['dre', 'fluxo-caixa']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    {
      id: 1,
      name: 'Relatório Completo - Janeiro 2024',
      format: 'PDF',
      size: '2.3 MB',
      date: '2024-01-15T10:30:00',
      status: 'completed',
    },
    {
      id: 2,
      name: 'DRE Gerencial - Dezembro 2023',
      format: 'Excel',
      size: '890 KB',
      date: '2024-01-10T14:22:00',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Análise de Viabilidade',
      format: 'PDF',
      size: '1.8 MB',
      date: '2024-01-08T09:15:00',
      status: 'completed',
    },
  ]);

  const formats = {
    excel: {
      name: 'Excel (.xlsx)',
      description: 'Planilha editável com fórmulas e gráficos',
      icon: FileSpreadsheet,
      color: 'text-green-600',
    },
    pdf: {
      name: 'PDF (.pdf)',
      description: 'Documento formatado para impressão',
      icon: FileText,
      color: 'text-red-600',
    },
    csv: {
      name: 'CSV (.csv)',
      description: 'Dados tabulares para análise',
      icon: FileDown,
      color: 'text-blue-600',
    },
    image: {
      name: 'Imagem (.png)',
      description: 'Gráficos e dashboards como imagem',
      icon: FileImage,
      color: 'text-purple-600',
    },
  };

  const periods = {
    'mes-atual': 'Mês Atual',
    'mes-anterior': 'Mês Anterior',
    'trimestre-atual': 'Trimestre Atual',
    'trimestre-anterior': 'Trimestre Anterior',
    'ano-atual': 'Ano Atual',
    'ano-anterior': 'Ano Anterior',
    'personalizado': 'Período Personalizado',
  };

  const reports = [
    {
      id: 'dre',
      name: 'DRE Gerencial',
      description: 'Demonstração do Resultado do Exercício',
    },
    {
      id: 'fluxo-caixa',
      name: 'Fluxo de Caixa',
      description: 'Projeções e análise de fluxo de caixa',
    },
    {
      id: 'capital-giro',
      name: 'Capital de Giro',
      description: 'Análise de necessidades de capital',
    },
    {
      id: 'viabilidade',
      name: 'Análise de Viabilidade',
      description: 'ROI, TIR, VPL e sensibilidade',
    },
    {
      id: 'impostos',
      name: 'Impostos & Tributação',
      description: 'Análise tributária por regime',
    },
    {
      id: 'projecoes',
      name: 'Projeções 2035',
      description: 'Análise de longo prazo',
    },
    {
      id: 'kpis',
      name: 'Dashboard KPIs',
      description: 'Indicadores-chave de performance',
    },
    {
      id: 'valuation',
      name: 'Valuation',
      description: 'Avaliação empresarial completa',
    },
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simular processo de exportação
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newExport = {
      id: exportHistory.length + 1,
      name: `Relatório ${selectedReports.length > 1 ? 'Completo' : reports.find(r => r.id === selectedReports[0])?.name} - ${new Date().toLocaleDateString()}`,
      format: formats[selectedFormat as keyof typeof formats].name.split(' ')[0],
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      date: new Date().toISOString(),
      status: 'completed' as const,
    };
    
    setExportHistory(prev => [newExport, ...prev]);
    setIsExporting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Exportar Dados
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Exporte relatórios e análises em diferentes formatos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Configurar Exportação
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selecione os relatórios e formato desejado
              </p>
            </div>
            <div className="card-body space-y-6">
              {/* Format Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Formato de Exportação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(formats).map(([key, format]) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedFormat(key)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedFormat === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${format.color}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {format.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Período
                </h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="form-select"
                >
                  {Object.entries(periods).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reports Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Relatórios para Exportar
                </h3>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <label key={report.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleReportToggle(report.id)}
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {report.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExport}
                  disabled={isExporting || selectedReports.length === 0}
                  className="btn-primary w-full"
                >
                  {isExporting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar {selectedReports.length} Relatório{selectedReports.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Summary */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Resumo da Exportação
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Formato
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formats[selectedFormat as keyof typeof formats].name}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Período
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {periods[selectedPeriod as keyof typeof periods]}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Relatórios
                  </span>
                </div>
                <div className="space-y-1">
                  {selectedReports.map(reportId => {
                    const report = reports.find(r => r.id === reportId);
                    return (
                      <p key={reportId} className="text-xs text-gray-600 dark:text-gray-400">
                        • {report?.name}
                      </p>
                    );
                  })}
                  {selectedReports.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Nenhum relatório selecionado
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Dica:</strong> Arquivos Excel permitem edição e análise avançada. 
                  PDFs são ideais para apresentações e relatórios formais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Histórico de Exportações
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seus downloads recentes
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {exportHistory.map((export_item) => (
              <div key={export_item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(export_item.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {export_item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {export_item.format} • {export_item.size} • {new Date(export_item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {export_item.status === 'completed' && (
                    <>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Export Options */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Exportações Rápidas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Templates pré-configurados para exportação imediata
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Relatório Executivo
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                DRE + KPIs + Fluxo de Caixa (Excel)
              </p>
            </button>

            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Apresentação Completa
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Todos os relatórios formatados (PDF)
              </p>
            </button>

            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileDown className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Dados para Análise
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dados brutos em CSV
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
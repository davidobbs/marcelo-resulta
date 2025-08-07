'use client';

import React, { useState } from 'react';
import { ClientTime } from '@/components/ui/ClientOnly';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity,
  Settings,
  Play,
  Download,
  BarChart3,
  Zap,
  Server,
  Wifi
} from 'lucide-react';

import { AdvancedChart } from '@/components/charts/AdvancedChart';

interface DataSource {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'external';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  recordCount: number;
  icon: React.ReactNode;
}

interface ProcessingJob {
  id: string;
  name: string;
  type: 'etl' | 'aggregation' | 'calculation' | 'validation';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  records: number;
}

interface DataQualityMetric {
  metric: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const dataSources: DataSource[] = [
  {
    id: 'financial-vars',
    name: 'Variáveis Financeiras',
    type: 'financial',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60000), // 5 min ago
    recordCount: 47,
    icon: <Database className="w-5 h-5" />
  },
  {
    id: 'field-bookings',
    name: 'Reservas de Campos',
    type: 'operational',
    status: 'syncing',
    lastSync: new Date(Date.now() - 2 * 60000), // 2 min ago
    recordCount: 1250,
    icon: <Activity className="w-5 h-5" />
  },
  {
    id: 'player-data',
    name: 'Dados de Jogadores',
    type: 'operational',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60000), // 15 min ago
    recordCount: 89,
    icon: <Server className="w-5 h-5" />
  },
  {
    id: 'market-data',
    name: 'Dados de Mercado',
    type: 'external',
    status: 'error',
    lastSync: new Date(Date.now() - 120 * 60000), // 2 hours ago
    recordCount: 0,
    icon: <Wifi className="w-5 h-5" />
  }
];

const DataSourceCard: React.FC<{ source: DataSource }> = ({ source }) => {
  const statusColors = {
    connected: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    disconnected: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    syncing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
  };

  const statusIcons = {
    connected: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    disconnected: <Clock className="w-4 h-4 text-gray-500" />,
    error: <AlertTriangle className="w-4 h-4 text-red-500" />,
    syncing: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${statusColors[source.status]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            {source.icon}
          </div>
          <div>
            <h3 className="font-semibold">{source.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 border capitalize">
              {source.type}
            </span>
          </div>
        </div>
        {statusIcons[source.status]}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="opacity-75">Status:</span>
          <span className="font-medium capitalize">{source.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">Registros:</span>
          <span className="font-medium">{source.recordCount.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">Última Sync:</span>
          <span className="font-medium"><ClientTime date={source.lastSync} /></span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button className="flex-1 py-2 px-3 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:shadow-sm flex items-center justify-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Sync
        </button>
        <button className="flex-1 py-2 px-3 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:shadow-sm flex items-center justify-center gap-1">
          <Settings className="w-3 h-3" />
          Config
        </button>
      </div>
    </div>
  );
};

const ProcessingJobItem: React.FC<{ job: ProcessingJob }> = ({ job }) => {
  const statusColors = {
    queued: 'text-gray-600',
    running: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600'
  };

  const statusIcons = {
    queued: <Clock className="w-4 h-4" />,
    running: <RefreshCw className="w-4 h-4 animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
    failed: <AlertTriangle className="w-4 h-4" />
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={statusColors[job.status]}>
          {statusIcons[job.status]}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{job.name}</p>
          <p className="text-sm text-gray-500">
            {job.type.toUpperCase()} • {job.records.toLocaleString('pt-BR')} registros
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {job.status === 'running' && (
          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}
        <span className={`text-sm font-medium ${statusColors[job.status]}`}>
          {job.status === 'running' ? `${job.progress}%` : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default function DataPipelinePage() {
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([
    {
      id: '1',
      name: 'Agregação de Receitas Diárias',
      type: 'aggregation',
      status: 'completed',
      progress: 100,
      records: 365,
      endTime: new Date(Date.now() - 10 * 60000)
    },
    {
      id: '2',
      name: 'Cálculo de Métricas KPI',
      type: 'calculation',
      status: 'running',
      progress: 67,
      records: 47,
      startTime: new Date(Date.now() - 3 * 60000)
    },
    {
      id: '3',
      name: 'Validação de Dados Financeiros',
      type: 'validation',
      status: 'queued',
      progress: 0,
      records: 128
    }
  ]);

  const [dataQualityMetrics] = useState<DataQualityMetric[]>([
    {
      metric: 'Completude dos Dados',
      value: 95.2,
      status: 'good',
      description: 'Percentual de campos obrigatórios preenchidos'
    },
    {
      metric: 'Consistência',
      value: 88.7,
      status: 'warning',
      description: 'Dados consistentes entre diferentes fontes'
    },
    {
      metric: 'Precisão',
      value: 97.8,
      status: 'good',
      description: 'Dados validados contra regras de negócio'
    },
    {
      metric: 'Atualidade',
      value: 73.5,
      status: 'critical',
      description: 'Dados atualizados nas últimas 24h'
    }
  ]);

  const [pipelineStats] = useState({
    totalRecords: 1386,
    processedToday: 847,
    avgProcessingTime: 2.3,
    errorRate: 1.2,
    throughput: 385
  });

  // Dados para gráficos
  const throughputData = [
    { hour: '00:00', records: 45 },
    { hour: '04:00', records: 23 },
    { hour: '08:00', records: 156 },
    { hour: '12:00', records: 234 },
    { hour: '16:00', records: 189 },
    { hour: '20:00', records: 98 }
  ];

  const qualityTrendData = [
    { day: 'Seg', completude: 94, consistencia: 91, precisao: 96 },
    { day: 'Ter', completude: 95, consistencia: 89, precisao: 97 },
    { day: 'Qua', completude: 93, consistencia: 87, precisao: 98 },
    { day: 'Qui', completude: 96, consistencia: 90, precisao: 97 },
    { day: 'Sex', completude: 95, consistencia: 89, precisao: 98 },
    { day: 'Sab', completude: 92, consistencia: 85, precisao: 96 },
    { day: 'Dom', completude: 95, consistencia: 89, precisao: 98 }
  ];

  const handleRunPipeline = () => {
    // Simula execução do pipeline
    const newJob: ProcessingJob = {
      id: Date.now().toString(),
      name: 'Pipeline Manual - Processamento Completo',
      type: 'etl',
      status: 'running',
      progress: 0,
      records: 1386,
      startTime: new Date()
    };

    setProcessingJobs([newJob, ...processingJobs]);

    // Simula progresso
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'completed', progress: 100, endTime: new Date() }
              : job
          )
        );
      } else {
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === newJob.id 
              ? { ...job, progress: Math.round(progress) }
              : job
          )
        );
      }
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Pipeline de Dados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Engenharia de dados e processamento de métricas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunPipeline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Executar Pipeline
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Estatísticas do Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Registros</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {pipelineStats.totalRecords.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Processados Hoje</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {pipelineStats.processedToday.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Tempo Médio</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {pipelineStats.avgProcessingTime}s
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Taxa de Erro</span>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {pipelineStats.errorRate}%
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Throughput/h</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {pipelineStats.throughput}
          </p>
        </div>
      </div>

      {/* Fontes de Dados */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Fontes de Dados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataSources.map((source) => (
            <DataSourceCard key={source.id} source={source} />
          ))}
        </div>
      </div>

      {/* Jobs de Processamento */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jobs de Processamento
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Atualizado em tempo real</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {processingJobs.map((job) => (
              <ProcessingJobItem key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos de Monitoramento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput por Hora */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Throughput por Hora
          </h3>
          <AdvancedChart
            type="bar"
            data={throughputData}
            xKey="hour"
            yKeys={[
              { key: 'records', name: 'Registros', color: '#3B82F6' }
            ]}
            height={300}
          />
        </div>

        {/* Qualidade dos Dados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tendência de Qualidade dos Dados
          </h3>
          <AdvancedChart
            type="line"
            data={qualityTrendData}
            xKey="day"
            yKeys={[
              { key: 'completude', name: 'Completude (%)', color: '#10B981' },
              { key: 'consistencia', name: 'Consistência (%)', color: '#F59E0B' },
              { key: 'precisao', name: 'Precisão (%)', color: '#8B5CF6' }
            ]}
            height={300}
            percentage={true}
          />
        </div>
      </div>

      {/* Métricas de Qualidade */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Métricas de Qualidade dos Dados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataQualityMetrics.map((metric, index) => {
            const statusColors = {
              good: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
              warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
              critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            };

            return (
              <div key={index} className={`p-4 rounded-xl border-2 ${statusColors[metric.status]}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{metric.metric}</h4>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm">
                    <span className="text-lg font-bold">{metric.value.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-sm opacity-75">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
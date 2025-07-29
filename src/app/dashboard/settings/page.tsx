'use client';

import { useState } from 'react';
import { 
  Settings, 
  Building2,
  DollarSign,
  Globe,
  Save,
  RefreshCw,
  Lock,
  Bell,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const [settings, setSettings] = useState({
    empresa: {
      nome: 'Clube de Futebol Exemplo',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Quadras, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      telefone: '(11) 99999-9999',
      email: 'contato@clubefutebol.com.br',
    },
    mercado: {
      pais: 'Brasil',
      moeda: 'BRL',
      idioma: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      formatoData: 'DD/MM/YYYY',
      formatoNumero: 'brasileiro',
    },
    financeiro: {
      exercicioFiscal: 'janeiro-dezembro',
      metodoDre: 'gerencial',
      centrosCusto: true,
      categoriasDespesas: true,
      aprovacaoOrcamento: false,
      limiteCaixa: 10000,
      diasProjecao: 365,
    },
    sistema: {
      tema: 'auto',
      notificacoes: true,
      emailRelatorios: true,
      backupAutomatico: true,
      logActividades: true,
      sessionTimeout: 60,
    },
    integracao: {
      contabilidade: false,
      bancaria: false,
      erp: false,
      crm: false,
      apiKey: '',
      webhookUrl: '',
    },
  });

  const [isDirty, setIsDirty] = useState(false);

  const handleSettingChange = (tab: keyof typeof settings, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Lógica de salvamento
    setIsDirty(false);
  };

  const handleReset = () => {
    // Reset para valores padrão
    setIsDirty(false);
  };

  const tabs = [
    { id: 'empresa', name: 'Empresa', icon: Building2 },
    { id: 'mercado', name: 'Mercado', icon: Globe },
    { id: 'financeiro', name: 'Financeiro', icon: DollarSign },
    { id: 'sistema', name: 'Sistema', icon: Settings },
    { id: 'integracao', name: 'Integração', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie as configurações globais do sistema
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={handleReset}
            className="btn-outline"
            disabled={!isDirty}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="card-body">
          {/* Empresa Tab */}
          {activeTab === 'empresa' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Informações da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Nome da Empresa</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.nome}
                      onChange={(e) => handleSettingChange('empresa', 'nome', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CNPJ</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.cnpj}
                      onChange={(e) => handleSettingChange('empresa', 'cnpj', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.endereco}
                      onChange={(e) => handleSettingChange('empresa', 'endereco', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.cidade}
                      onChange={(e) => handleSettingChange('empresa', 'cidade', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={settings.empresa.estado}
                      onChange={(e) => handleSettingChange('empresa', 'estado', e.target.value)}
                    >
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      {/* Adicionar outros estados */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">CEP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.cep}
                      onChange={(e) => handleSettingChange('empresa', 'cep', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.empresa.telefone}
                      onChange={(e) => handleSettingChange('empresa', 'telefone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={settings.empresa.email}
                      onChange={(e) => handleSettingChange('empresa', 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mercado Tab */}
          {activeTab === 'mercado' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Configurações de Mercado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">País/Mercado</label>
                    <select
                      className="form-select"
                      value={settings.mercado.pais}
                      onChange={(e) => handleSettingChange('mercado', 'pais', e.target.value)}
                    >
                      <option value="Brasil">Brasil</option>
                      <option value="Europa">Europa</option>
                      <option value="EmiratesArabes">Emirados Árabes Unidos</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Moeda</label>
                    <select
                      className="form-select"
                      value={settings.mercado.moeda}
                      onChange={(e) => handleSettingChange('mercado', 'moeda', e.target.value)}
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="AED">Dirham (AED)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Idioma</label>
                    <select
                      className="form-select"
                      value={settings.mercado.idioma}
                      onChange={(e) => handleSettingChange('mercado', 'idioma', e.target.value)}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="ar-AE">العربية (UAE)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fuso Horário</label>
                    <select
                      className="form-select"
                      value={settings.mercado.timezone}
                      onChange={(e) => handleSettingChange('mercado', 'timezone', e.target.value)}
                    >
                      <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                      <option value="Europe/London">Londres (UTC+0)</option>
                      <option value="Asia/Dubai">Dubai (UTC+4)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Formato de Data</label>
                    <select
                      className="form-select"
                      value={settings.mercado.formatoData}
                      onChange={(e) => handleSettingChange('mercado', 'formatoData', e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Formato de Números</label>
                    <select
                      className="form-select"
                      value={settings.mercado.formatoNumero}
                      onChange={(e) => handleSettingChange('mercado', 'formatoNumero', e.target.value)}
                    >
                      <option value="brasileiro">1.234,56 (Brasileiro)</option>
                      <option value="americano">1,234.56 (Americano)</option>
                      <option value="europeu">1 234,56 (Europeu)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financeiro Tab */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Configurações Financeiras
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Exercício Fiscal</label>
                    <select
                      className="form-select"
                      value={settings.financeiro.exercicioFiscal}
                      onChange={(e) => handleSettingChange('financeiro', 'exercicioFiscal', e.target.value)}
                    >
                      <option value="janeiro-dezembro">Janeiro a Dezembro</option>
                      <option value="abril-marco">Abril a Março</option>
                      <option value="julho-junho">Julho a Junho</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método DRE</label>
                    <select
                      className="form-select"
                      value={settings.financeiro.metodoDre}
                      onChange={(e) => handleSettingChange('financeiro', 'metodoDre', e.target.value)}
                    >
                      <option value="gerencial">Gerencial</option>
                      <option value="societario">Societário</option>
                      <option value="fiscal">Fiscal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Limite de Caixa Mínimo</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.financeiro.limiteCaixa}
                      onChange={(e) => handleSettingChange('financeiro', 'limiteCaixa', Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dias de Projeção</label>
                    <select
                      className="form-select"
                      value={settings.financeiro.diasProjecao}
                      onChange={(e) => handleSettingChange('financeiro', 'diasProjecao', Number(e.target.value))}
                    >
                      <option value={90}>90 dias</option>
                      <option value={180}>180 dias</option>
                      <option value={365}>365 dias</option>
                      <option value={730}>2 anos</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Módulos Avançados
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.financeiro.centrosCusto}
                          onChange={(e) => handleSettingChange('financeiro', 'centrosCusto', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Centros de Custo
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.financeiro.categoriasDespesas}
                          onChange={(e) => handleSettingChange('financeiro', 'categoriasDespesas', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Categorias de Despesas Detalhadas
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.financeiro.aprovacaoOrcamento}
                          onChange={(e) => handleSettingChange('financeiro', 'aprovacaoOrcamento', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Aprovação de Orçamento
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sistema Tab */}
          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Configurações do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Tema</label>
                    <select
                      className="form-select"
                      value={settings.sistema.tema}
                      onChange={(e) => handleSettingChange('sistema', 'tema', e.target.value)}
                    >
                      <option value="auto">Automático</option>
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Timeout de Sessão (minutos)</label>
                    <select
                      className="form-select"
                      value={settings.sistema.sessionTimeout}
                      onChange={(e) => handleSettingChange('sistema', 'sessionTimeout', Number(e.target.value))}
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={480}>8 horas</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Notificações e Alertas
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.sistema.notificacoes}
                          onChange={(e) => handleSettingChange('sistema', 'notificacoes', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Notificações Push
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.sistema.emailRelatorios}
                          onChange={(e) => handleSettingChange('sistema', 'emailRelatorios', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Relatórios por Email
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.sistema.backupAutomatico}
                          onChange={(e) => handleSettingChange('sistema', 'backupAutomatico', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Backup Automático
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.sistema.logActividades}
                          onChange={(e) => handleSettingChange('sistema', 'logActividades', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Log de Atividades
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integração Tab */}
          {activeTab === 'integracao' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Integrações Externas
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sistema Contábil
                      </h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.integracao.contabilidade}
                          onChange={(e) => handleSettingChange('integracao', 'contabilidade', e.target.checked)}
                        />
                        <span className="ml-2 text-sm">Ativar</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sincronização automática com sistema contábil
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Integração Bancária
                      </h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.integracao.bancaria}
                          onChange={(e) => handleSettingChange('integracao', 'bancaria', e.target.checked)}
                        />
                        <span className="ml-2 text-sm">Ativar</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Importação automática de extratos bancários
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sistema ERP
                      </h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.integracao.erp}
                          onChange={(e) => handleSettingChange('integracao', 'erp', e.target.checked)}
                        />
                        <span className="ml-2 text-sm">Ativar</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Integração com ERP corporativo
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        CRM
                      </h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={settings.integracao.crm}
                          onChange={(e) => handleSettingChange('integracao', 'crm', e.target.checked)}
                        />
                        <span className="ml-2 text-sm">Ativar</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sincronização com sistema de gestão de clientes
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <div className="flex">
                      <input
                        type="password"
                        className="form-input rounded-r-none"
                        value={settings.integracao.apiKey}
                        onChange={(e) => handleSettingChange('integracao', 'apiKey', e.target.value)}
                        placeholder="Sua chave de API"
                      />
                      <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md">
                        <Lock className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Webhook URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={settings.integracao.webhookUrl}
                      onChange={(e) => handleSettingChange('integracao', 'webhookUrl', e.target.value)}
                      placeholder="https://seu-webhook.com/endpoint"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Changes */}
      {isDirty && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm">Você tem alterações não salvas</span>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { 
  HelpCircle, 
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  Users
} from 'lucide-react';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = {
    'getting-started': {
      name: 'Primeiros Passos',
      icon: PlayCircle,
      color: 'text-green-600',
    },
    'financial-analysis': {
      name: 'Análise Financeira',
      icon: FileText,
      color: 'text-blue-600',
    },
    'reports': {
      name: 'Relatórios',
      icon: Book,
      color: 'text-purple-600',
    },
    'settings': {
      name: 'Configurações',
      icon: HelpCircle,
      color: 'text-orange-600',
    },
    'troubleshooting': {
      name: 'Solução de Problemas',
      icon: MessageCircle,
      color: 'text-red-600',
    },
  };

  const faqData = [
    {
      id: 1,
      category: 'getting-started',
      question: 'Como configurar meu clube pela primeira vez?',
      answer: 'Para configurar seu clube, vá até Configurações > Empresa e preencha as informações básicas como nome, CNPJ, endereço e dados de contato. Em seguida, configure o mercado em Configurações > Mercado selecionando o país de operação.',
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'Quais dados preciso inserir para começar a análise?',
      answer: 'Você precisa definir: 1) Investimento inicial estimado, 2) Número e tipos de quadras, 3) Preços dos horários, 4) Custos operacionais básicos (funcionários, energia, manutenção), 5) Meta de ocupação mensal.',
    },
    {
      id: 3,
      category: 'financial-analysis',
      question: 'Como interpretar a análise de viabilidade?',
      answer: 'A análise de viabilidade mostra três indicadores principais: ROI (retorno sobre investimento), TIR (taxa interna de retorno) e VPL (valor presente líquido). ROI acima de 20% a.a. é considerado bom, TIR deve superar o custo de capital, e VPL positivo indica viabilidade do projeto.',
    },
    {
      id: 4,
      category: 'financial-analysis',
      question: 'O que significa EBITDA e como é calculado?',
      answer: 'EBITDA é o lucro antes de juros, impostos, depreciação e amortização. É calculado como: Receita Total - Custos Operacionais (excluindo depreciação, juros e impostos). É um indicador importante da geração de caixa operacional do negócio.',
    },
    {
      id: 5,
      category: 'reports',
      question: 'Como exportar relatórios em diferentes formatos?',
      answer: 'Vá até a página "Exportar Dados", selecione o formato desejado (Excel, PDF, CSV ou Imagem), escolha o período e marque os relatórios que deseja incluir. Clique em "Exportar" e o arquivo será gerado automaticamente.',
    },
    {
      id: 6,
      category: 'reports',
      question: 'Posso personalizar os relatórios?',
      answer: 'Sim! Cada página de análise permite ajustar parâmetros específicos. Você pode modificar taxas de crescimento, cenários econômicos, preços, custos e outros fatores para personalizar a análise conforme sua realidade.',
    },
    {
      id: 7,
      category: 'settings',
      question: 'Como alterar o mercado de operação?',
      answer: 'Vá até Configurações > Mercado e selecione o país desejado (Brasil, Europa ou Emirados Árabes). Isso atualizará automaticamente impostos, moeda, encargos trabalhistas e outros parâmetros específicos do mercado.',
    },
    {
      id: 8,
      category: 'settings',
      question: 'Como configurar notificações e alertas?',
      answer: 'Em Configurações > Sistema, você pode ativar/desativar notificações push, relatórios por email, backup automático e log de atividades. Também é possível ajustar o timeout de sessão.',
    },
    {
      id: 9,
      category: 'troubleshooting',
      question: 'Por que meus dados não estão sendo salvos?',
      answer: 'Verifique se: 1) Sua sessão não expirou, 2) Todos os campos obrigatórios estão preenchidos, 3) Os valores estão em formato válido (números positivos), 4) Você clicou em "Salvar" após as alterações.',
    },
    {
      id: 10,
      category: 'troubleshooting',
      question: 'Como resetar as configurações para o padrão?',
      answer: 'Em cada página de configuração há um botão "Resetar" que restaura os valores padrão. Para reset completo do sistema, entre em contato com o suporte técnico.',
    },
  ];

  const tutorials = [
    {
      title: 'Configuração Inicial do Sistema',
      duration: '8 min',
      description: 'Aprenda a configurar seu clube e inserir os dados básicos',
      level: 'Iniciante',
    },
    {
      title: 'Interpretando a Análise de Viabilidade',
      duration: '12 min',
      description: 'Como ler e interpretar ROI, TIR, VPL e análise de sensibilidade',
      level: 'Intermediário',
    },
    {
      title: 'Criando Projeções Personalizadas',
      duration: '15 min',
      description: 'Ajuste cenários e crie projeções específicas para seu negócio',
      level: 'Avançado',
    },
    {
      title: 'Exportando e Compartilhando Relatórios',
      duration: '6 min',
      description: 'Como gerar e compartilhar relatórios profissionais',
      level: 'Iniciante',
    },
  ];

  const filteredFAQ = faqData.filter(item => 
    (activeCategory === 'all' || item.category === activeCategory) &&
    (searchTerm === '' || 
     item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Central de Ajuda
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Encontre respostas e aprenda a usar o sistema
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar na central de ajuda..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Categorias
              </h2>
            </div>
            <div className="card-body p-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    activeCategory === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Todas as Categorias
                </button>
                {Object.entries(categories).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        activeCategory === key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${category.color}`} />
                      {category.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Suporte Direto
              </h2>
            </div>
            <div className="card-body space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Chat Online</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Telefone</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tutorials */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Tutoriais em Vídeo
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aprenda com nossos guias passo a passo
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tutorial, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {tutorial.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{tutorial.duration}</span>
                          <span className={`px-2 py-1 rounded ${
                            tutorial.level === 'Iniciante' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            tutorial.level === 'Intermediário' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {tutorial.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Perguntas Frequentes
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredFAQ.length} pergunta{filteredFAQ.length !== 1 ? 's' : ''} encontrada{filteredFAQ.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {filteredFAQ.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.question}
                      </span>
                      {expandedFAQ === item.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma pergunta encontrada para "{searchTerm}"
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Tente uma pesquisa diferente ou entre em contato conosco
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Comunidade
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Conecte-se com outros usuários
                </p>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  Acessar Fórum →
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Book className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Documentação
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Guias técnicos completos
                </p>
                <button className="text-xs text-green-600 hover:text-green-700">
                  Ver Docs →
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Feedback
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Sugestões e melhorias
                </p>
                <button className="text-xs text-purple-600 hover:text-purple-700">
                  Enviar Feedback →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
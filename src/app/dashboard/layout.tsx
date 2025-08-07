'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  BarChart3,
  Calculator,
  TrendingUp,
  Building2,
  Calendar,
  Target,
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  Download,
  HelpCircle,
  Database,
  Edit3,
  Users,
  ShieldCheck, // Ícone para ativos de jogadores
  FileText
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navigation = [
  {
    name: 'Visão Geral',
    href: '/dashboard',
    icon: Home,
    description: 'Dashboard principal com resumo executivo',
  },
  {
    name: 'Analytics Dashboard',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Dashboard avançado com métricas em tempo real',
  },
  {
    name: 'Variáveis Financeiras',
    href: '/dashboard/financial-variables',
    icon: Calculator,
    description: 'Configuração de variáveis e fórmulas financeiras',
  },
  {
    name: 'Entrada de Dados',
    href: '/dashboard/financial-input',
    icon: Database,
    description: 'Entrada detalhada de dados financeiros',
  },
  {
    name: 'DRE Gerencial',
    href: '/dashboard/dre',
    icon: BarChart3,
    description: 'Demonstração do Resultado do Exercício',
  },
  {
    name: 'Investidores',
    href: '/dashboard/investors',
    icon: Users,
    description: 'Gestão de investidores e participação',
  },
  {
    name: 'Ativos (Jogadores)',
    href: '/dashboard/player-assets',
    icon: ShieldCheck,
    description: 'Gestão de passes de atletas como ativos',
  },
  {
    name: 'Capital de Giro',
    href: '/dashboard/capital-giro',
    icon: Calculator,
    description: 'Análise de necessidades de capital',
  },
  {
    name: 'Fluxo de Caixa',
    href: '/dashboard/fluxo-caixa',
    icon: TrendingUp,
    description: 'Projeções de fluxo de caixa',
  },
  {
    name: 'Impostos & Tributação',
    href: '/dashboard/impostos',
    icon: Building2,
    description: 'Análise fiscal e tributária',
  },
  {
    name: 'Projeções 2035',
    href: '/dashboard/projecoes',
    icon: Calendar,
    description: 'Projeções de longo prazo',
  },
  {
    name: 'KPIs Estratégicos',
    href: '/dashboard/kpis',
    icon: Target,
    description: 'Indicadores de performance',
  },
  {
    name: 'Análise Viabilidade',
    href: '/dashboard/viabilidade',
    icon: TrendingUp,
    description: 'ROI, TIR e análise de investimento',
  },
  {
    name: 'Valuation',
    href: '/dashboard/valuation',
    icon: DollarSign,
    description: 'Avaliação do clube',
  },
  {
    name: 'Análise de Cenários',
    href: '/dashboard/scenario-analysis',
    icon: Target,
    description: 'Análise de sensibilidade e cenários',
  },
  {
    name: 'Relatórios',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Central de relatórios e análises',
  },
  {
    name: 'Pipeline de Dados',
    href: '/dashboard/data-pipeline',
    icon: Database,
    description: 'Engenharia de dados e processamento',
  },
  {
    name: 'Campos Customizados',
    href: '/dashboard/custom-fields',
    icon: Edit3,
    description: 'Configuração de campos personalizados',
  },
  {
    name: 'Exportar Dados',
    href: '/dashboard/export',
    icon: Download,
    description: 'Exportação de relatórios',
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configurações do sistema',
  },
  {
    name: 'Ajuda',
    href: '/dashboard/help',
    icon: HelpCircle,
    description: 'Documentação e suporte',
  },
];

const secondaryNavigation: any[] = [];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Club Finance
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pilot System
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 h-full overflow-y-auto">
          <div className="p-4">
            {/* Main navigation */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Análises Principais
              </h2>
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative
                          ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                          }
                        `}
                        title={item.description}
                      >
                        <item.icon className={`
                          w-4 h-4 flex-shrink-0
                          ${isActive ? 'text-blue-600 dark:text-blue-300' : ''}
                        `} />
                        <span className="truncate">{item.name}</span>
                        
                        {isActive && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r-md" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Secondary navigation */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Ferramentas
              </h2>
              <ul className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                          ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                          }
                        `}
                      >
                        <item.icon className={`
                          w-4 h-4 flex-shrink-0
                          ${isActive ? 'text-blue-600 dark:text-blue-300' : ''}
                        `} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>© 2024 Club Finance Pilot</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content wrapper */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Sistema de Análise Financeira
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie as finanças do seu clube de futebol
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Market indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Brasil</span>
              </div>

              {/* Settings button */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="p-4 lg:p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Suspense fallback={<PageLoader isLoading={true} message="Carregando página..." />}>
              {children}
            </Suspense>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

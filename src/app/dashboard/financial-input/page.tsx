'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Plus, 
  Minus, 
  Save, 
  Upload,
  Download,
  Calculator,
  TrendingUp,
  Users,
  Building,
  Wrench,
  Shield,
  Truck,
  Heart,
  Smartphone,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useAppStore, useFinancialData, useActions, type FinancialData } from '@/stores/useAppStore';
import { formatCurrency } from '@/utils/format';

// Estrutura do fluxo sequencial
interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  active: boolean;
}

export default function FinancialInputPage() {
  const { recalculate } = useFinancialCalculations();
  const { club } = useAppStore();
  const financialData = useFinancialData();
  const { setFinancialData, updateFinancialData, triggerRecalculation, updateClub } = useActions();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Função para atualizar dados do clube
  const handleClubChange = (field: string, value: string | number) => {
    updateClub({ [field]: value });
    setHasChanges(true);
  };

  // Função auxiliar para atualizar valores aninhados
  const handleFinancialChange = (path: string[], value: number) => {
    const [section, category, field] = path;
    
    if (section === 'revenues') {
      const updates = {
        revenues: {
          ...financialData.revenues,
          [category]: {
            ...((financialData.revenues as any)[category] || {}),
            [field]: value
          }
        }
      };
      updateFinancialData(updates as any);
    } else if (section === 'costs') {
      if (path.length === 4) {
        // For personnel costs: ['costs', 'personnel', category, field]
        const [, , subCategory, fieldName] = path;
        const updates = {
          costs: {
            ...financialData.costs,
            personnel: {
              ...financialData.costs.personnel,
              [subCategory]: {
                ...((financialData.costs.personnel as any)[subCategory] || {}),
                [fieldName]: value
              }
            }
          }
        };
        updateFinancialData(updates as any);
      } else {
        // For operational costs: ['costs', category, field]
        const updates = {
          costs: {
            ...financialData.costs,
            [category]: {
              ...((financialData.costs as any)[category] || {}),
              [field]: value
            }
          }
        };
        updateFinancialData(updates as any);
      }
    }
    
    setHasChanges(true);
  };

  // Fluxo sequencial de entrada de dados
  const flowSteps: FlowStep[] = [
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      description: 'Configure dados básicos do clube e mercado',
      icon: Building,
      completed: false,
      active: currentStep === 0
    },
    {
      id: 'revenues',
      title: 'Receitas Operacionais',
      description: 'Configure todas as fontes de receita do clube',
      icon: TrendingUp,
      completed: false,
      active: currentStep === 1
    },
    {
      id: 'personnel',
      title: 'Custos de Pessoal',
      description: 'Configure salários e encargos da equipe',
      icon: Users,
      completed: false,
      active: currentStep === 2
    },
    {
      id: 'operational',
      title: 'Custos Operacionais',
      description: 'Configure custos de infraestrutura e operação',
      icon: Wrench,
      completed: false,
      active: currentStep === 3
    },
    {
      id: 'calculation',
      title: 'Cálculos Automáticos',
      description: 'Gere projeções e análises financeiras',
      icon: Calculator,
      completed: false,
      active: currentStep === 4
    }
  ];

  // Função para salvar dados automaticamente
  const autoSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Salva no localStorage para compatibilidade
      if (typeof window !== 'undefined') {
        localStorage.setItem('club-financial-input', JSON.stringify(financialData));
      }
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setIsSaving(false);
    }
  }, [financialData, hasChanges]);

  // Auto save a cada 30 segundos se houver mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges) {
        autoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSave, hasChanges]);

  // Função para calcular totais
  const calculateTotals = () => {
    const revenueTotal = Object.values(financialData.revenues).reduce((total, category) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, val: any) => 
          sum + (typeof val === 'number' ? val : 0), 0);
      }
      return total;
    }, 0);

    const costTotal = Object.values(financialData.costs).reduce((total, category) => {
      if (typeof category === 'object' && category !== null) {
        return total + Object.values(category).reduce((sum: number, subCategory: any) => {
          if (typeof subCategory === 'object' && subCategory !== null) {
            return sum + Object.values(subCategory).reduce((subSum: number, val: any) => 
              subSum + (typeof val === 'number' ? val : 0), 0);
          }
          return sum + (typeof subCategory === 'number' ? subCategory : 0);
        }, 0);
      }
      return total;
    }, 0);

    return { revenueTotal, costTotal, profit: revenueTotal - costTotal };
  };

  // Função para avançar etapa
  const nextStep = () => {
    if (currentStep < flowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Função para voltar etapa
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Função para finalizar e calcular
  const handleFinalize = async () => {
    setIsCalculating(true);
    try {
      await autoSave();
      triggerRecalculation();
      setTimeout(() => {
        recalculate();
        setIsCalculating(false);
      }, 1500);
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      setIsCalculating(false);
    }
  };

  const totals = calculateTotals();

  // Configurações das categorias por etapa
  const revenueCategories = [
    {
      key: 'fieldRental',
      name: 'Aluguel de Campos',
      icon: Building,
      color: 'text-green-600',
      fields: [
        { key: 'regularRentals', label: 'Aluguéis Regulares', placeholder: 'Ex: 25.000' },
        { key: 'tournaments', label: 'Torneios', placeholder: 'Ex: 8.000' },
        { key: 'corporateEvents', label: 'Eventos Corporativos', placeholder: 'Ex: 5.000' },
        { key: 'seasonalAdjustment', label: 'Ajuste Sazonal', placeholder: 'Ex: 2.000' },
      ]
    },
    {
      key: 'membership',
      name: 'Mensalidades e Associações',
      icon: Users,
      color: 'text-blue-600',
      fields: [
        { key: 'monthlyFees', label: 'Mensalidades', placeholder: 'Ex: 15.000' },
        { key: 'annualFees', label: 'Anuidades', placeholder: 'Ex: 12.000' },
        { key: 'initationFees', label: 'Taxa de Adesão', placeholder: 'Ex: 3.000' },
        { key: 'familyPackages', label: 'Pacotes Familiares', placeholder: 'Ex: 8.000' },
        { key: 'corporateMembers', label: 'Sócios Corporativos', placeholder: 'Ex: 10.000' },
      ]
    },
    {
      key: 'sponsorship',
      name: 'Patrocínios e Publicidade',
      icon: TrendingUp,
      color: 'text-purple-600',
      fields: [
        { key: 'mainSponsor', label: 'Patrocinador Principal', placeholder: 'Ex: 20.000' },
        { key: 'jerseySponsors', label: 'Patrocinadores do Uniforme', placeholder: 'Ex: 8.000' },
        { key: 'facilityNaming', label: 'Naming Rights', placeholder: 'Ex: 5.000' },
        { key: 'equipmentSponsors', label: 'Fornecedores de Material', placeholder: 'Ex: 3.000' },
        { key: 'eventSponsors', label: 'Patrocinadores de Eventos', placeholder: 'Ex: 4.000' },
        { key: 'digitalSponsors', label: 'Patrocinadores Digitais', placeholder: 'Ex: 2.000' },
      ]
    },
    {
      key: 'soccerSchool',
      name: 'Escolinha de Futebol',
      icon: Users,
      color: 'text-orange-600',
      fields: [
        { key: 'monthlyTuition', label: 'Mensalidades', placeholder: 'Ex: 12.000' },
        { key: 'enrollmentFees', label: 'Taxas de Matrícula', placeholder: 'Ex: 4.000' },
        { key: 'camps', label: 'Camps/Clínicas', placeholder: 'Ex: 6.000' },
        { key: 'privateClasses', label: 'Aulas Particulares', placeholder: 'Ex: 3.000' },
        { key: 'tournaments', label: 'Torneios', placeholder: 'Ex: 2.000' },
      ]
    }
  ];

  const personnelCategories = [
    {
      key: 'technicalStaff',
      name: 'Comissão Técnica',
      fields: [
        { key: 'headCoach', label: 'Técnico Principal', placeholder: 'Ex: 15.000' },
        { key: 'assistantCoaches', label: 'Auxiliares Técnicos', placeholder: 'Ex: 25.000' },
        { key: 'physicalTrainer', label: 'Preparador Físico', placeholder: 'Ex: 8.000' },
        { key: 'goalkeeper', label: 'Treinador de Goleiros', placeholder: 'Ex: 6.000' },
        { key: 'analyst', label: 'Analista de Desempenho', placeholder: 'Ex: 5.000' },
        { key: 'scout', label: 'Observador/Scout', placeholder: 'Ex: 4.000' },
        { key: 'coordinator', label: 'Coordenador Técnico', placeholder: 'Ex: 8.000' },
        { key: 'interpreter', label: 'Intérprete', placeholder: 'Ex: 3.000' },
        { key: 'other', label: 'Outros Técnicos', placeholder: 'Ex: 2.000' },
      ]
    },
    {
      key: 'players',
      name: 'Atletas/Elenco',
      fields: [
        { key: 'salaries', label: 'Salários Base', placeholder: 'Ex: 150.000' },
        { key: 'bonuses', label: 'Bonificações por Performance', placeholder: 'Ex: 18.800' },
        { key: 'benefits', label: 'Benefícios (VT, VR, etc)', placeholder: 'Ex: 25.000' },
        { key: 'laborCharges', label: 'Encargos/Comissão + Atletas', placeholder: 'Ex: 84.600' },
        { key: 'medicalInsurance', label: 'Seguro Médico Atletas', placeholder: 'Ex: 10.000' },
        { key: 'imageRights', label: 'Direitos de Imagem', placeholder: 'Ex: 15.000' },
        { key: 'performanceBonuses', label: 'Bônus por Resultados', placeholder: 'Ex: 12.000' },
        { key: 'loyaltyBonuses', label: 'Prêmios de Fidelidade', placeholder: 'Ex: 8.000' },
        { key: 'thirteenthSalary', label: '13º Salário', placeholder: 'Ex: 12.500' },
        { key: 'vacation', label: 'Férias', placeholder: 'Ex: 12.500' },
      ]
    },
    {
      key: 'administrativeStaff',
      name: 'Pessoal Administrativo',
      fields: [
        { key: 'management', label: 'Diretoria/Presidência', placeholder: 'Ex: 20.000' },
        { key: 'accounting', label: 'Departamento Contábil', placeholder: 'Ex: 8.000' },
        { key: 'legal', label: 'Jurídico', placeholder: 'Ex: 6.000' },
        { key: 'hr', label: 'Recursos Humanos', placeholder: 'Ex: 5.000' },
        { key: 'marketing', label: 'Marketing/Comunicação', placeholder: 'Ex: 7.000' },
        { key: 'communication', label: 'Departamento de Comunicação', placeholder: 'Ex: 4.000' },
        { key: 'finance', label: 'Financeiro', placeholder: 'Ex: 8.000' },
        { key: 'operations', label: 'Operações', placeholder: 'Ex: 6.000' },
        { key: 'commercial', label: 'Comercial', placeholder: 'Ex: 9.000' },
        { key: 'other', label: 'Outros Administrativos', placeholder: 'Ex: 5.000' },
      ]
    },
    {
      key: 'supportStaff',
      name: 'Pessoal de Apoio',
      fields: [
        { key: 'security', label: 'Segurança', placeholder: 'Ex: 6.000' },
        { key: 'cleaning', label: 'Limpeza', placeholder: 'Ex: 4.000' },
        { key: 'maintenance', label: 'Manutenção', placeholder: 'Ex: 5.000' },
        { key: 'reception', label: 'Recepção', placeholder: 'Ex: 3.000' },
        { key: 'kitManager', label: 'Roupeiro', placeholder: 'Ex: 2.500' },
        { key: 'groundsKeeper', label: 'Jardineiro/Gramado', placeholder: 'Ex: 3.500' },
        { key: 'driver', label: 'Motorista', placeholder: 'Ex: 3.000' },
        { key: 'cook', label: 'Cozinheiro', placeholder: 'Ex: 2.800' },
        { key: 'other', label: 'Outros Apoios', placeholder: 'Ex: 2.000' },
      ]
    },
    {
      key: 'medicalStaff',
      name: 'Departamento Médico',
      fields: [
        { key: 'teamDoctor', label: 'Médico do Clube', placeholder: 'Ex: 12.000' },
        { key: 'physiotherapist', label: 'Fisioterapeuta', placeholder: 'Ex: 8.000' },
        { key: 'psychologist', label: 'Psicólogo Esportivo', placeholder: 'Ex: 4.000' },
        { key: 'nutritionist', label: 'Nutricionista', placeholder: 'Ex: 3.000' },
        { key: 'nurse', label: 'Enfermeiro', placeholder: 'Ex: 4.500' },
        { key: 'masseur', label: 'Massagista', placeholder: 'Ex: 3.000' },
      ]
    }
  ];

  const operationalCategories = [
    {
      key: 'facilities',
      name: 'Instalações e Infraestrutura',
      icon: Building,
      color: 'text-gray-600',
      fields: [
        { key: 'rent', label: 'Aluguel/Cessão', placeholder: 'Ex: 25.000' },
        { key: 'propertyTax', label: 'IPTU', placeholder: 'Ex: 3.000' },
        { key: 'condominiumFees', label: 'Condomínio', placeholder: 'Ex: 2.000' },
        { key: 'fieldMaintenance', label: 'Manutenção de Campo', placeholder: 'Ex: 8.000' },
        { key: 'buildingMaintenance', label: 'Manutenção Predial', placeholder: 'Ex: 5.000' },
        { key: 'landscaping', label: 'Paisagismo/Jardinagem', placeholder: 'Ex: 2.000' },
        { key: 'stadiumMaintenance', label: 'Manutenção Estádio', placeholder: 'Ex: 10.000' },
        { key: 'securitySystems', label: 'Sistemas de Segurança', placeholder: 'Ex: 2.500' },
        { key: 'cleaningServices', label: 'Serviços de Limpeza', placeholder: 'Ex: 4.000' },
        { key: 'wasteManagement', label: 'Gestão de Resíduos', placeholder: 'Ex: 800' },
      ]
    },
    {
      key: 'utilities',
      name: 'Utilidades e Serviços',
      icon: Zap,
      color: 'text-yellow-600',
      fields: [
        { key: 'electricity', label: 'Energia Elétrica (Estádio + Energia + Água)', placeholder: 'Ex: 7.900' },
        { key: 'water', label: 'Água e Esgoto', placeholder: 'Ex: 2.500' },
        { key: 'gas', label: 'Gás', placeholder: 'Ex: 800' },
        { key: 'internet', label: 'Internet/Banda Larga', placeholder: 'Ex: 1.200' },
        { key: 'phone', label: 'Telefonia', placeholder: 'Ex: 600' },
        { key: 'cable', label: 'TV/Cable', placeholder: 'Ex: 400' },
        { key: 'sewage', label: 'Esgoto', placeholder: 'Ex: 500' },
        { key: 'heatingCooling', label: 'Climatização', placeholder: 'Ex: 3.000' },
      ]
    },
    {
      key: 'medical',
      name: 'Departamento Médico',
      icon: Heart,
      color: 'text-red-600',
      fields: [
        { key: 'teamDoctor', label: 'Médico (Jogo Casa)', placeholder: 'Ex: 1.200' },
        { key: 'physiotherapy', label: 'Fisioterapia', placeholder: 'Ex: 8.000' },
        { key: 'supplements', label: 'Suplementos/Atletas', placeholder: 'Ex: 4.500' },
        { key: 'medicalExams', label: 'Exames Médicos + Laboratoriais', placeholder: 'Ex: 15.000' },
        { key: 'treatments', label: 'Tratamentos', placeholder: 'Ex: 5.000' },
        { key: 'surgeries', label: 'Cirurgias', placeholder: 'Ex: 8.000' },
        { key: 'emergencyMedical', label: 'Atendimento de Emergência', placeholder: 'Ex: 2.000' },
        { key: 'preventiveMedicine', label: 'Medicina Preventiva', placeholder: 'Ex: 3.000' },
        { key: 'rehabilitation', label: 'Reabilitação', placeholder: 'Ex: 4.000' },
        { key: 'medicalEquipment', label: 'Equipamentos Médicos', placeholder: 'Ex: 2.500' },
      ]
    },
    {
      key: 'transportation',
      name: 'Transporte e Viagens',
      icon: Truck,
      color: 'text-blue-600',
      fields: [
        { key: 'teamTransport', label: 'Viagens (Transporte)', placeholder: 'Ex: 12.500' },
        { key: 'accommodation', label: 'Concentração (Casa/Hotel + Refeições)', placeholder: 'Ex: 16.500' },
        { key: 'meals', label: 'Refeições/Alimentação', placeholder: 'Ex: 40.000' },
        { key: 'fuel', label: 'Combustível', placeholder: 'Ex: 2.000' },
        { key: 'vehicleMaintenance', label: 'Manutenção de Veículos', placeholder: 'Ex: 1.500' },
        { key: 'airTravel', label: 'Viagens Aéreas', placeholder: 'Ex: 8.000' },
        { key: 'localTransport', label: 'Transporte Local', placeholder: 'Ex: 2.000' },
        { key: 'carRental', label: 'Aluguel de Veículos', placeholder: 'Ex: 3.000' },
        { key: 'parking', label: 'Estacionamento', placeholder: 'Ex: 500' },
      ]
    },
    {
      key: 'equipment',
      name: 'Equipamentos e Material Esportivo',
      icon: Shield,
      color: 'text-green-600',
      fields: [
        { key: 'sportingGoods', label: 'Material Esportivo', placeholder: 'Ex: 8.000' },
        { key: 'uniforms', label: 'Uniformes/Atletas', placeholder: 'Ex: 4.500' },
        { key: 'trainingEquipment', label: 'Equipamentos de Treino', placeholder: 'Ex: 3.000' },
        { key: 'fieldEquipment', label: 'Equipamentos de Campo', placeholder: 'Ex: 2.000' },
        { key: 'safety', label: 'Equipamentos de Segurança', placeholder: 'Ex: 1.500' },
        { key: 'balls', label: 'Bolas', placeholder: 'Ex: 1.000' },
        { key: 'goals', label: 'Traves/Equipamentos', placeholder: 'Ex: 800' },
        { key: 'medicalEquipment', label: 'Material Médico', placeholder: 'Ex: 2.000' },
        { key: 'officeEquipment', label: 'Equipamentos de Escritório', placeholder: 'Ex: 1.200' },
        { key: 'vehicles', label: 'Veículos/Equipamentos', placeholder: 'Ex: 5.000' },
      ]
    },
    {
      key: 'marketing',
      name: 'Marketing e Comunicação',
      icon: TrendingUp,
      color: 'text-purple-600',
      fields: [
        { key: 'advertising', label: 'Publicidade Tradicional', placeholder: 'Ex: 5.000' },
        { key: 'digitalMarketing', label: 'Marketing Digital', placeholder: 'Ex: 3.000' },
        { key: 'events', label: 'Eventos/Promoções', placeholder: 'Ex: 4.000' },
        { key: 'materials', label: 'Material Gráfico', placeholder: 'Ex: 2.000' },
        { key: 'sponsorshipActivation', label: 'Ativação de Patrocínios', placeholder: 'Ex: 3.500' },
        { key: 'publicRelations', label: 'Relações Públicas', placeholder: 'Ex: 2.500' },
        { key: 'socialMedia', label: 'Redes Sociais', placeholder: 'Ex: 2.000' },
        { key: 'websiteMaintenance', label: 'Site/Plataformas Digitais', placeholder: 'Ex: 1.500' },
        { key: 'photography', label: 'Fotografia/Imagem', placeholder: 'Ex: 1.200' },
        { key: 'videoProduction', label: 'Produção de Vídeo', placeholder: 'Ex: 2.800' },
      ]
    },
    {
      key: 'administrative',
      name: 'Administrativo e Jurídico',
      icon: Building,
      color: 'text-gray-700',
      fields: [
        { key: 'accounting', label: 'Contabilidade', placeholder: 'Ex: 8.000' },
        { key: 'legal', label: 'Serviços Jurídicos', placeholder: 'Ex: 6.000' },
        { key: 'consulting', label: 'Consultoria', placeholder: 'Ex: 4.000' },
        { key: 'banking', label: 'Taxas Bancárias', placeholder: 'Ex: 1.500' },
        { key: 'office', label: 'Material de Escritório', placeholder: 'Ex: 2.000' },
        { key: 'travel', label: 'Viagens Administrativas', placeholder: 'Ex: 3.000' },
        { key: 'subscription', label: 'Assinaturas/Licenças', placeholder: 'Ex: 1.800' },
        { key: 'software', label: 'Software/Sistemas', placeholder: 'Ex: 2.500' },
        { key: 'audit', label: 'Auditoria', placeholder: 'Ex: 3.000' },
        { key: 'notary', label: 'Cartório/Documentação', placeholder: 'Ex: 800' },
      ]
    },
    {
      key: 'insurance',
      name: 'Seguros',
      icon: Shield,
      color: 'text-indigo-600',
      fields: [
        { key: 'liability', label: 'Seguro Atletas + Comissão', placeholder: 'Ex: 10.000' },
        { key: 'property', label: 'Seguro Patrimonial', placeholder: 'Ex: 3.000' },
        { key: 'players', label: 'Seguro de Atletas', placeholder: 'Ex: 8.000' },
        { key: 'equipment', label: 'Seguro de Equipamentos', placeholder: 'Ex: 2.000' },
        { key: 'vehicles', label: 'Seguro de Veículos', placeholder: 'Ex: 2.400' },
        { key: 'directors', label: 'Seguro de Diretores', placeholder: 'Ex: 1.500' },
        { key: 'publicLiability', label: 'Responsabilidade Civil', placeholder: 'Ex: 2.000' },
        { key: 'cyber', label: 'Seguro Cibernético', placeholder: 'Ex: 800' },
      ]
    },
    {
      key: 'regulatory',
      name: 'Regulatório e Federação',
      icon: AlertCircle,
      color: 'text-orange-600',
      fields: [
        { key: 'licenses', label: 'Inscrições/Transferências', placeholder: 'Ex: 50.000' },
        { key: 'federationFees', label: 'Farmácia (Medicamentos/Supl. Jogos)', placeholder: 'Ex: 1.500' },
        { key: 'certifications', label: 'Filiação FPF + CBF', placeholder: 'Ex: 8.400' },
        { key: 'inspections', label: 'Alvará Estádio (Anual)', placeholder: 'Ex: 20.000' },
        { key: 'arbitrageFees', label: 'Moradia Comissão Técnica', placeholder: 'Ex: 3.000' },
        { key: 'registrations', label: 'Moradia Treinador', placeholder: 'Ex: 3.000' },
        { key: 'fines', label: 'Multas/Penalidades', placeholder: 'Ex: 2.000' },
        { key: 'legalFees', label: 'Taxas Legais', placeholder: 'Ex: 1.500' },
      ]
    },
    {
      key: 'technology',
      name: 'Tecnologia e Inovação',
      icon: Smartphone,
      color: 'text-cyan-600',
      fields: [
        { key: 'software', label: 'Software/Licenças', placeholder: 'Ex: 3.000' },
        { key: 'hardware', label: 'Hardware/Computadores', placeholder: 'Ex: 2.000' },
        { key: 'telecommunications', label: 'Telecomunicações', placeholder: 'Ex: 1.500' },
        { key: 'support', label: 'Suporte Técnico', placeholder: 'Ex: 1.200' },
        { key: 'cloudServices', label: 'Serviços em Nuvem', placeholder: 'Ex: 800' },
        { key: 'backup', label: 'Backup/Armazenamento', placeholder: 'Ex: 600' },
        { key: 'cybersecurity', label: 'Segurança Digital', placeholder: 'Ex: 1.000' },
        { key: 'streamingPlatform', label: 'Plataforma de Streaming', placeholder: 'Ex: 2.500' },
      ]
    },
    {
      key: 'competitions',
      name: 'Competições e Eventos',
      icon: Target,
      color: 'text-emerald-600',
      fields: [
        { key: 'registrationFees', label: 'Taxas de Inscrição', placeholder: 'Ex: 15.000' },
        { key: 'travelExpenses', label: 'Despesas de Jogos (Casa)', placeholder: 'Ex: 40.000' },
        { key: 'accommodation', label: 'Hospedagem', placeholder: 'Ex: 8.000' },
        { key: 'meals', label: 'Médico (Jogo Visitante)', placeholder: 'Ex: 1.200' },
        { key: 'arbitrageFees', label: 'Concentração/Casa', placeholder: 'Ex: 0' },
        { key: 'medicalSupport', label: 'Suporte Médico', placeholder: 'Ex: 3.000' },
        { key: 'security', label: 'Segurança em Jogos', placeholder: 'Ex: 5.000' },
        { key: 'organization', label: 'Organização de Eventos', placeholder: 'Ex: 4.000' },
      ]
    },
    {
      key: 'transfers',
      name: 'Transferências e Contratações',
      icon: Users,
      color: 'text-pink-600',
      fields: [
        { key: 'agentCommissions', label: 'Passagens (Atletas)', placeholder: 'Ex: 20.000' },
        { key: 'transferFees', label: 'Taxas de Transferência', placeholder: 'Ex: 25.000' },
        { key: 'loanFees', label: 'Taxas de Empréstimo', placeholder: 'Ex: 10.000' },
        { key: 'scoutingExpenses', label: 'Despesas de Observação', placeholder: 'Ex: 5.000' },
        { key: 'medicalExams', label: 'Exames Admissionais', placeholder: 'Ex: 3.000' },
        { key: 'registrations', label: 'Registros de Contratos', placeholder: 'Ex: 2.000' },
        { key: 'contractNegotiation', label: 'Negociação de Contratos', placeholder: 'Ex: 4.000' },
      ]
    },
    {
      key: 'depreciation',
      name: 'Depreciação e Amortização',
      icon: BarChart3,
      color: 'text-slate-600',
      fields: [
        { key: 'buildingsDepreciation', label: 'Depreciação de Imóveis', placeholder: 'Ex: 5.000' },
        { key: 'equipmentDepreciation', label: 'Depreciação de Equipamentos', placeholder: 'Ex: 3.000' },
        { key: 'vehiclesDepreciation', label: 'Depreciação de Veículos', placeholder: 'Ex: 2.000' },
        { key: 'playersAmortization', label: 'Amortização de Atletas', placeholder: 'Ex: 15.000' },
        { key: 'intangibleAmortization', label: 'Amortização Intangíveis', placeholder: 'Ex: 2.500' },
      ]
    },
    {
      key: 'financial',
      name: 'Custos Financeiros',
      icon: DollarSign,
      color: 'text-red-700',
      fields: [
        { key: 'bankFees', label: 'Taxas Bancárias', placeholder: 'Ex: 2.000' },
        { key: 'loanInterest', label: 'Juros de Empréstimos', placeholder: 'Ex: 5.000' },
        { key: 'creditCardFees', label: 'Taxas de Cartão', placeholder: 'Ex: 800' },
        { key: 'exchangeRateLoss', label: 'Perda Cambial', placeholder: 'Ex: 1.000' },
        { key: 'investmentLoss', label: 'Perda em Investimentos', placeholder: 'Ex: 2.000' },
        { key: 'lateFees', label: 'Multas/Juros', placeholder: 'Ex: 500' },
      ]
    },
    {
      key: 'otherOperational',
      name: 'Outros Custos Operacionais',
      icon: Plus,
      color: 'text-gray-500',
      fields: [
        { key: 'donationsCharity', label: 'Doações/Caridade', placeholder: 'Ex: 2.000' },
        { key: 'communityPrograms', label: 'Programas Sociais', placeholder: 'Ex: 3.000' },
        { key: 'environmentalPrograms', label: 'Programas Ambientais', placeholder: 'Ex: 1.000' },
        { key: 'contingencyFund', label: 'Fundo de Contingência', placeholder: 'Ex: 5.000' },
        { key: 'lossOnAssetSale', label: 'Perda na Venda de Ativos', placeholder: 'Ex: 2.000' },
        { key: 'extraordinaryExpenses', label: 'Despesas Extraordinárias', placeholder: 'Ex: 3.000' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Configuração Financeira Unificada
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fluxo sequencial para entrada completa de dados financeiros
            {lastSaved && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                • Último salvamento: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Salvando...
            </div>
          )}
          {hasChanges && !isSaving && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              Alterações não salvas
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Etapa {currentStep + 1} de {flowSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / flowSteps.length) * 100)}% concluído
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / flowSteps.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            {flowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStep 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro Sempre Visível */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="metric-label">Total de Receitas</p>
              <p className="metric-value text-green-600">{formatCurrency(totals.revenueTotal)}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Minus className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="metric-label">Total de Custos</p>
              <p className="metric-value text-red-600">{formatCurrency(totals.costTotal)}</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${totals.profit >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <DollarSign className={`w-5 h-5 ${totals.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="metric-label">Resultado Operacional</p>
              <p className={`metric-value ${totals.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(totals.profit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <div className="space-y-6">
        {/* Etapa 0: Informações Básicas */}
        {currentStep === 0 && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Informações Básicas do Clube
                </h2>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Nome do Clube</label>
                    <input
                      type="text"
                      className="input-field"
                      value={club.name}
                      onChange={(e) => handleClubChange('name', e.target.value)}
                      placeholder="Nome do seu clube"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número de Campos</label>
                    <input
                      type="number"
                      className="input-field"
                      value={club.numFields}
                      onChange={(e) => handleClubChange('numFields', Number(e.target.value))}
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Dica de Preenchimento
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                          Configure primeiro as informações básicas do clube. 
                          Essas informações serão usadas como base para todos os cálculos posteriores.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 1: Receitas */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Receitas Operacionais
                    </h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: {formatCurrency(totals.revenueTotal)}
                  </div>
                </div>
              </div>
            </div>

            {revenueCategories.map((category) => (
              <div key={category.key} className="card">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.fields.map((field) => (
                      <div key={field.key} className="form-group">
                        <label className="form-label">{field.label}</label>
                        <input
                          type="number"
                          className="input-field"
                          value={(financialData.revenues[category.key as keyof typeof financialData.revenues] as any)?.[field.key] || 0}
                          onChange={(e) => handleFinancialChange(['revenues', category.key, field.key], Number(e.target.value))}
                          placeholder={field.placeholder}
                          min="0"
                          step="100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Etapa 2: Custos de Pessoal */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Custos de Pessoal
                  </h2>
                </div>
              </div>
            </div>

            {personnelCategories.map((category) => (
              <div key={category.key} className="card">
                <div className="card-header">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.fields.map((field) => (
                      <div key={field.key} className="form-group">
                        <label className="form-label">{field.label}</label>
                        <input
                          type="number"
                          className="input-field"
                          value={(financialData.costs.personnel[category.key as keyof typeof financialData.costs.personnel] as any)?.[field.key] || 0}
                          onChange={(e) => handleFinancialChange(['costs', 'personnel', category.key, field.key], Number(e.target.value))}
                          placeholder={field.placeholder}
                          min="0"
                          step="100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Etapa 3: Custos Operacionais */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Custos Operacionais
                  </h2>
                </div>
              </div>
            </div>

            {operationalCategories.map((category) => (
              <div key={category.key} className="card">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.fields.map((field) => (
                      <div key={field.key} className="form-group">
                        <label className="form-label">{field.label}</label>
                        <input
                          type="number"
                          className="input-field"
                          value={(financialData.costs[category.key as keyof typeof financialData.costs] as any)?.[field.key] || 0}
                          onChange={(e) => handleFinancialChange(['costs', category.key, field.key], Number(e.target.value))}
                          placeholder={field.placeholder}
                          min="0"
                          step="50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Etapa 4: Cálculos Finais */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Finalização e Cálculos Automáticos
                  </h2>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Resumo dos Dados Inseridos
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Receitas Totais:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(totals.revenueTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Custos Totais:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(totals.costTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Resultado Operacional:</span>
                        <span className={`font-bold ${totals.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(totals.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Próximos Passos
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Projeções Financeiras</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Geração automática de projeções para 12 anos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Análise de Viabilidade</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cálculo de VPL, TIR e payback
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Valuation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Avaliação do valor da empresa
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleFinalize}
                      disabled={isCalculating}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isCalculating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Calculator className="w-4 h-4" />
                      )}
                      {isCalculating ? 'Processando...' : 'Gerar Análises Completas'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Etapa Anterior
        </button>
        
        {currentStep < flowSteps.length - 1 ? (
          <button
            onClick={nextStep}
            className="btn-primary flex items-center gap-2"
          >
            Próxima Etapa
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Configuração Completa
          </div>
        )}
      </div>
    </div>
  );
} 
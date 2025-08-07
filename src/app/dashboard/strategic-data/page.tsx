'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Target, 
  FileText, 
  Plus,
  Trash2,
  Calculator,
  MapPin,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import type { 
  ClubBasicInfo, 
  FootballField, 
  ClubFacility,
  StaffMember,
  ExternalFinancing 
} from '@/types';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

type ActiveTabData = 'basic' | 'infrastructure' | 'financial' | 'market' | 'hr' | 'compliance';

export default function StrategicDataPage() {
  const { club, updateClub } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTabData>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para cada seção
  const [basicInfo, setBasicInfo] = useState<ClubBasicInfo>({
    name: club.name || '',
    foundedYear: 2024,
    legalStructure: 'Sociedade Limitada',
    taxId: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Brasil',
      zipCode: '',
    },
    contact: {
      phone: '',
      email: '',
    },
    targetAudience: ['Amador'],
  });

  const [fields, setFields] = useState<FootballField[]>([
    {
      id: '1',
      name: 'Campo 1',
      type: 'Society 5x5',
      dimensions: { length: 40, width: 20 },
      surfaceType: 'Grama Sintética',
      lighting: true,
      covered: false,
      capacity: 50,
      hourlyRate: 80,
      maintenanceCost: 500,
      utilizationRate: 0.65,
    }
  ]);

  const [facilities, setFacilities] = useState<ClubFacility[]>([
    {
      id: '1',
      name: 'Vestiário Principal',
      type: 'Vestiário',
      area: 50,
      capacity: 30,
      monthlyOperatingCost: 300,
    }
  ]);

  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      position: 'Administrador',
      level: 'Pleno',
      workload: 'Integral',
      monthlySalary: 3500,
      contractType: 'CLT',
    }
  ]);

  const [financing, setFinancing] = useState<ExternalFinancing[]>([]);

  const [initialInvestment, setInitialInvestment] = useState({
    landAcquisition: 0,
    fieldConstruction: 240000, // 2 campos x 120k
    facilityConstruction: 80000,
    sportsEquipment: 50000,
    technology: 15000,
    workingCapital: 50000,
    licensing: 15000,
    contingency: 30000,
  });

  const tabs = [
    { id: 'basic', name: 'Dados Básicos', icon: Building2, description: 'Informações fundamentais do clube' },
    { id: 'infrastructure', name: 'Infraestrutura', icon: MapPin, description: 'Campos e instalações' },
    { id: 'financial', name: 'Financeiro', icon: DollarSign, description: 'Investimentos e capital inicial' },
    { id: 'market', name: 'Mercado', icon: Target, description: 'Estratégia e posicionamento' },
    { id: 'hr', name: 'Recursos Humanos', icon: Users, description: 'Equipe e estrutura organizacional' },
    { id: 'compliance', name: 'Compliance', icon: FileText, description: 'Licenças e regulamentações' },
  ];

  const calculateTotalInvestment = () => {
    return Object.values(initialInvestment).reduce((sum, value) => sum + value, 0);
  };

  const handleSave = () => {
    try {
      // Estrutura os dados estratégicos completos
      const strategicData = {
        clubInfo: basicInfo,
        infrastructure: {
          fields,
          facilities,
          landOwnership: 'Próprio' as const,
          landArea: 5000,
          builtArea: 2000,
          totalCapacity: fields.reduce((sum, field) => sum + field.capacity, 0),
          parkingSpaces: 50,
        },
        initialFinancials: {
          initialCapital: calculateTotalInvestment(),
          ownersEquity: calculateTotalInvestment() * 0.3,
          externalFinancing: financing,
          initialInvestments: {
            landAcquisition: initialInvestment.landAcquisition,
            fieldConstruction: [],
            facilityConstruction: [],
            sportsEquipment: [],
            technology: [],
            licensing: [],
            branding: [],
            workingCapital: {
              cashReserve: initialInvestment.workingCapital,
              accountsReceivable: 0,
              inventory: 0,
              prepaidExpenses: 0,
              total: initialInvestment.workingCapital,
            },
            contingencyReserve: initialInvestment.contingency,
          },
          existingAssets: {
            cash: 0,
            equipment: 0,
            property: 0,
            investments: 0,
            other: 0,
            total: 0,
          },
          existingLiabilities: {
            loans: 0,
            accountsPayable: 0,
            taxes: 0,
            other: 0,
            total: 0,
          },
        },
        marketStrategy: {
          targetMarkets: [],
          pricingStrategy: {
            fieldRental: [],
            membership: [],
            soccerSchool: [],
            events: [],
            merchandise: [],
          },
          marketingPlan: {
            budget: 10000,
            channels: [],
            campaigns: [],
            targetAcquisitionCost: 50,
            expectedConversionRate: 0.1,
          },
          competitiveAnalysis: {
            competitors: [],
            marketPosition: 'Seguidor' as const,
            competitiveAdvantages: [],
            threats: [],
            opportunities: [],
          },
          growthStrategy: {
            shortTerm: [],
            mediumTerm: [],
            longTerm: [],
            expansionPlans: [],
            investmentRequired: 0,
          },
        },
        humanResources: {
          staff,
          payrollBurden: {
            inss: 0.08,
            fgts: 0.08,
            vacation: 0.083,
            thirteenthSalary: 0.083,
            other: 0.05,
            total: 0.296,
          },
          trainingBudget: 5000,
          benefitsPackage: {
            healthInsurance: 0,
            mealVoucher: 0,
            transportVoucher: 0,
            lifeInsurance: 0,
            other: 0,
            total: 0,
          },
        },
        compliance: {
          licenses: [],
          regulations: [],
          certifications: [],
          auditSchedule: [],
        },
      };

      // Salva no localStorage
      localStorage.setItem('club-strategic-data', JSON.stringify(strategicData));
      
      // Atualiza o nome do clube no store principal
      updateClub({ name: basicInfo.name });
      
      setHasChanges(false);
      
      // Feedback visual para o usuário
      toast.success('Dados salvos com sucesso!');
      
    } catch {
      toast.error('Erro ao salvar dados. Tente novamente.');
    }
  };

  const addField = () => {
    const newField: FootballField = {
      id: Date.now().toString(),
      name: `Campo ${fields.length + 1}`,
      type: 'Society 5x5',
      dimensions: { length: 40, width: 20 },
      surfaceType: 'Grama Sintética',
      lighting: true,
      covered: false,
      capacity: 50,
      hourlyRate: 80,
      maintenanceCost: 500,
      utilizationRate: 0.65,
    };
    setFields([...fields, newField]);
    setHasChanges(true);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    setHasChanges(true);
  };

  const updateField = (id: string, updates: Partial<FootballField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
    setHasChanges(true);
  };

  const addStaffMember = () => {
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      position: 'Recepcionista',
      level: 'Júnior',
      workload: 'Integral',
      monthlySalary: 1500,
      contractType: 'CLT',
    };
    setStaff([...staff, newStaff]);
    setHasChanges(true);
  };

  const removeStaffMember = (id: string) => {
    setStaff(staff.filter(member => member.id !== id));
    setHasChanges(true);
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaff(staff.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
    setHasChanges(true);
  };

  const getTotalMonthlySalaries = () => {
    return staff.reduce((total, member) => total + member.monthlySalary, 0);
  };

  const addFacility = () => {
    const newFacility: ClubFacility = {
      id: Date.now().toString(),
      name: `Instalação ${facilities.length + 1}`,
      type: 'Vestiário',
      area: 50,
      capacity: 30,
      monthlyOperatingCost: 300,
    };
    setFacilities([...facilities, newFacility]);
    setHasChanges(true);
  };

  const removeFacility = (id: string) => {
    setFacilities(facilities.filter(facility => facility.id !== id));
    setHasChanges(true);
  };

  const updateFacility = (id: string, updates: Partial<ClubFacility>) => {
    setFacilities(facilities.map(facility => 
      facility.id === id ? { ...facility, ...updates } : facility
    ));
    setHasChanges(true);
  };

  const addFinancing = () => {
    const newFinancing: ExternalFinancing = {
      id: Date.now().toString(),
      type: 'Empréstimo Bancário',
      amount: 100000,
      interestRate: 0.15,
      termMonths: 60,
      provider: 'Banco Exemplo',
      monthlyPayment: 0, // Adicionado valor padrão
    };
    setFinancing([...financing, newFinancing]);
    setHasChanges(true);
  };

  const removeFinancing = (id: string) => {
    setFinancing(financing.filter(item => item.id !== id));
    setHasChanges(true);
  };

  const updateFinancing = (id: string, updates: Partial<ExternalFinancing>) => {
    setFinancing(financing.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    setHasChanges(true);
  };

  // Função para carregar dados salvos
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('club-strategic-data');
      if (saved) {
        const strategicData = JSON.parse(saved);
        
        // Atualiza os estados com os dados salvos
        if (strategicData.clubInfo) {
          setBasicInfo(strategicData.clubInfo);
        }
        
        if (strategicData.infrastructure?.fields) {
          setFields(strategicData.infrastructure.fields);
        }
        
        if (strategicData.infrastructure?.facilities) {
          setFacilities(strategicData.infrastructure.facilities);
        }
        
        if (strategicData.humanResources?.staff) {
          setStaff(strategicData.humanResources.staff);
        }
        
        if (strategicData.initialFinancials?.externalFinancing) {
          setFinancing(strategicData.initialFinancials.externalFinancing);
        }
        
      }
    } catch {
      toast.error('Não foi possível carregar os dados salvos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados salvos na inicialização
  useEffect(() => {
    loadSavedData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dados Estratégicos - Ano 0
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure os dados iniciais detalhados para análise de investimento
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {hasChanges && (
            <span className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              Alterações não salvas
            </span>
          )}
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Dados
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="metric-label">Campos</p>
              <p className="metric-value">{fields.length}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="metric-label">Funcionários</p>
              <p className="metric-value">{staff.length}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="metric-label">Investimento Total</p>
              <p className="metric-value">{formatCurrency(calculateTotalInvestment())}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-orange-600" />
            <div>
              <p className="metric-label">Folha Mensal</p>
              <p className="metric-value">{formatCurrency(getTotalMonthlySalaries())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTabData)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Dados Básicos */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Informações Básicas do Clube
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dados fundamentais e características gerais
                </p>
              </div>
              <div className="card-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Clube *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => {
                        setBasicInfo({ ...basicInfo, name: e.target.value });
                        setHasChanges(true);
                      }}
                      className="input-field"
                      placeholder="Ex: Clube de Futebol ABC"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estrutura Legal
                    </label>
                    <select
                      value={basicInfo.legalStructure}
                      onChange={(e) => {
                        setBasicInfo({ ...basicInfo, legalStructure: e.target.value as ClubBasicInfo['legalStructure'] });
                        setHasChanges(true);
                      }}
                      className="input-field"
                    >
                      <option value="Sociedade Limitada">Sociedade Limitada</option>
                      <option value="Sociedade Anônima">Sociedade Anônima</option>
                      <option value="Associação">Associação</option>
                      <option value="Cooperativa">Cooperativa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.location.city}
                      onChange={(e) => {
                        setBasicInfo({ 
                          ...basicInfo, 
                          location: { ...basicInfo.location, city: e.target.value }
                        });
                        setHasChanges(true);
                      }}
                      className="input-field"
                      placeholder="Ex: São Paulo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.location.state}
                      onChange={(e) => {
                        setBasicInfo({ 
                          ...basicInfo, 
                          location: { ...basicInfo.location, state: e.target.value }
                        });
                        setHasChanges(true);
                      }}
                      className="input-field"
                      placeholder="Ex: SP"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={basicInfo.location.country}
                      onChange={(e) => {
                        setBasicInfo({ 
                          ...basicInfo, 
                          location: { ...basicInfo.location, country: e.target.value }
                        });
                        setHasChanges(true);
                      }}
                      className="input-field"
                      placeholder="Brasil"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Público-Alvo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Amador', 'Semi-Profissional', 'Profissional', 'Infantil', 'Juvenil', 'Adulto'].map((audience) => (
                      <label key={audience} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={basicInfo.targetAudience.includes(audience as ClubBasicInfo['targetAudience'][number])}
                          onChange={(e) => {
                            const newAudience = e.target.checked
                              ? [...basicInfo.targetAudience, audience as ClubBasicInfo['targetAudience'][number]]
                              : basicInfo.targetAudience.filter(a => a !== audience);
                            setBasicInfo({ ...basicInfo, targetAudience: newAudience });
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{audience}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Missão do Clube
                  </label>
                  <textarea
                    value={basicInfo.missionStatement || ''}
                    onChange={(e) => {
                      setBasicInfo({ ...basicInfo, missionStatement: e.target.value });
                      setHasChanges(true);
                    }}
                    className="input-field"
                    rows={3}
                    placeholder="Descreva a missão e objetivos do clube..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infraestrutura */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            {/* Campos de Futebol */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Campos de Futebol
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure os campos disponíveis e suas características
                    </p>
                  </div>
                  <button
                    onClick={addField}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Campo
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{field.name}</h3>
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome do Campo
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value as FootballField['type'] })}
                            className="input-field"
                          >
                            <option value="Society 5x5">Society 5x5</option>
                            <option value="Society 7x7">Society 7x7</option>
                            <option value="Futsal">Futsal</option>
                            <option value="Campo 11x11">Campo 11x11</option>
                            <option value="Campo Reduzido">Campo Reduzido</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Superfície
                          </label>
                          <select
                            value={field.surfaceType}
                            onChange={(e) => updateField(field.id, { surfaceType: e.target.value as FootballField['surfaceType'] })}
                            className="input-field"
                          >
                            <option value="Grama Natural">Grama Natural</option>
                            <option value="Grama Sintética">Grama Sintética</option>
                            <option value="Quadra">Quadra</option>
                            <option value="Saibro">Saibro</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Valor/Hora (R$)
                          </label>
                          <input
                            type="number"
                            value={field.hourlyRate}
                            onChange={(e) => updateField(field.id, { hourlyRate: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="10"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Taxa de Ocupação (%)
                          </label>
                          <input
                            type="number"
                            value={field.utilizationRate * 100}
                            onChange={(e) => updateField(field.id, { utilizationRate: Number(e.target.value) / 100 })}
                            className="input-field"
                            min="0"
                            max="100"
                            step="5"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Custo Manutenção/Mês (R$)
                          </label>
                          <input
                            type="number"
                            value={field.maintenanceCost}
                            onChange={(e) => updateField(field.id, { maintenanceCost: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="100"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.lighting}
                            onChange={(e) => updateField(field.id, { lighting: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Iluminação</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.covered}
                            onChange={(e) => updateField(field.id, { covered: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Coberto</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instalações Complementares */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Instalações Complementares
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure vestiários, restaurantes e outras instalações
                    </p>
                  </div>
                  <button
                    onClick={addFacility}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Instalação
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <div className="space-y-4">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{facility.name}</h4>
                        <button
                          onClick={() => removeFacility(facility.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={facility.name}
                            onChange={(e) => updateFacility(facility.id, { name: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo
                          </label>
                          <select
                            value={facility.type}
                            onChange={(e) => updateFacility(facility.id, { type: e.target.value as ClubFacility['type'] })}
                            className="input-field"
                          >
                            <option value="Vestiário">Vestiário</option>
                            <option value="Academia">Academia</option>
                            <option value="Restaurante">Restaurante</option>
                            <option value="Loja">Loja</option>
                            <option value="Escritório">Escritório</option>
                            <option value="Estacionamento">Estacionamento</option>
                            <option value="Arquibancada">Arquibancada</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Área (m²)
                          </label>
                          <input
                            type="number"
                            value={facility.area}
                            onChange={(e) => updateFacility(facility.id, { area: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="10"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Capacidade
                          </label>
                          <input
                            type="number"
                            value={facility.capacity || 0}
                            onChange={(e) => updateFacility(facility.id, { capacity: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="5"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Custo Operacional/Mês (R$)
                          </label>
                          <input
                            type="number"
                            value={facility.monthlyOperatingCost}
                            onChange={(e) => updateFacility(facility.id, { monthlyOperatingCost: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Receita Mensal (R$)
                          </label>
                          <input
                            type="number"
                            value={facility.monthlyRevenue || 0}
                            onChange={(e) => updateFacility(facility.id, { monthlyRevenue: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financeiro */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Investimento Inicial Detalhado
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Breakdown completo dos investimentos necessários
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(initialInvestment).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      landAcquisition: 'Aquisição do Terreno',
                      fieldConstruction: 'Construção dos Campos',
                      facilityConstruction: 'Construção das Instalações',
                      sportsEquipment: 'Equipamentos Esportivos',
                      technology: 'Tecnologia e Sistemas',
                      workingCapital: 'Capital de Giro',
                      licensing: 'Licenças e Documentação',
                      contingency: 'Reserva de Contingência',
                    };
                    
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {labels[key]}
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            setInitialInvestment({
                              ...initialInvestment,
                              [key]: Number(e.target.value)
                            });
                            setHasChanges(true);
                          }}
                          className="input-field"
                          min="0"
                          step="1000"
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Investimento Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(calculateTotalInvestment())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financiamento Externo */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Financiamento Externo
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure empréstimos, financiamentos e investidores
                    </p>
                  </div>
                  <button
                    onClick={addFinancing}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Financiamento
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {financing.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum financiamento externo configurado</p>
                    <p className="text-sm">Clique em "Adicionar Financiamento" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financing.map((item) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.type}</h4>
                          <button
                            onClick={() => removeFinancing(item.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tipo
                            </label>
                            <select
                              value={item.type}
                              onChange={(e) => updateFinancing(item.id, { type: e.target.value as ExternalFinancing['type'] })}
                              className="input-field"
                            >
                              <option value="Empréstimo Bancário">Empréstimo Bancário</option>
                              <option value="Financiamento">Financiamento</option>
                              <option value="Investidor Anjo">Investidor Anjo</option>
                              <option value="Venture Capital">Venture Capital</option>
                              <option value="Crowdfunding">Crowdfunding</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Valor (R$)
                            </label>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateFinancing(item.id, { amount: Number(e.target.value) })}
                              className="input-field"
                              min="0"
                              step="10000"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Taxa de Juros (% a.a.)
                            </label>
                            <input
                              type="number"
                              value={item.interestRate * 100}
                              onChange={(e) => updateFinancing(item.id, { interestRate: Number(e.target.value) / 100 })}
                              className="input-field"
                              min="0"
                              max="100"
                              step="0.5"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Prazo (meses)
                            </label>
                            <input
                              type="number"
                              value={item.termMonths}
                              onChange={(e) => updateFinancing(item.id, { termMonths: Number(e.target.value) })}
                              className="input-field"
                              min="1"
                              max="360"
                              step="6"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Fornecedor/Banco
                            </label>
                            <input
                              type="text"
                              value={item.provider}
                              onChange={(e) => updateFinancing(item.id, { provider: e.target.value })}
                              className="input-field"
                              placeholder="Ex: Banco do Brasil"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Pagamento Mensal (R$)
                            </label>
                            <input
                              type="number"
                              value={item.monthlyPayment || 0}
                              onChange={(e) => updateFinancing(item.id, { monthlyPayment: Number(e.target.value) })}
                              className="input-field"
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Garantias/Observações
                          </label>
                          <input
                            type="text"
                            value={item.collateral || ''}
                            onChange={(e) => updateFinancing(item.id, { collateral: e.target.value })}
                            className="input-field"
                            placeholder="Ex: Garantia sobre imóveis, fiança, etc."
                          />
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Resumo:</strong> Financiamento de {formatCurrency(item.amount)} 
                            {item.monthlyPayment && ` com parcelas de ${formatCurrency(item.monthlyPayment)}`}
                            {` por ${item.termMonths} meses a ${(item.interestRate * 100).toFixed(1)}% a.a.`}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Total de Financiamentos:
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(financing.reduce((total, item) => total + item.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recursos Humanos */}
        {activeTab === 'hr' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Equipe e Recursos Humanos
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure a estrutura organizacional inicial
                    </p>
                  </div>
                  <button
                    onClick={addStaffMember}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Funcionário
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {member.position} - {member.level}
                        </h3>
                        <button
                          onClick={() => removeStaffMember(member.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cargo
                          </label>
                          <select
                            value={member.position}
                            onChange={(e) => updateStaffMember(member.id, { position: e.target.value as StaffMember['position'] })}
                            className="input-field"
                          >
                            <option value="Técnico">Técnico</option>
                            <option value="Preparador Físico">Preparador Físico</option>
                            <option value="Médico">Médico</option>
                            <option value="Fisioterapeuta">Fisioterapeuta</option>
                            <option value="Administrador">Administrador</option>
                            <option value="Recepcionista">Recepcionista</option>
                            <option value="Segurança">Segurança</option>
                            <option value="Limpeza">Limpeza</option>
                            <option value="Manutenção">Manutenção</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nível
                          </label>
                          <select
                            value={member.level}
                            onChange={(e) => updateStaffMember(member.id, { level: e.target.value as StaffMember['level'] })}
                            className="input-field"
                          >
                            <option value="Júnior">Júnior</option>
                            <option value="Pleno">Pleno</option>
                            <option value="Sênior">Sênior</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Carga Horária
                          </label>
                          <select
                            value={member.workload}
                            onChange={(e) => updateStaffMember(member.id, { workload: e.target.value as StaffMember['workload'] })}
                            className="input-field"
                          >
                            <option value="Integral">Integral</option>
                            <option value="Meio Período">Meio Período</option>
                            <option value="Freelancer">Freelancer</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Salário Mensal (R$)
                          </label>
                          <input
                            type="number"
                            value={member.monthlySalary}
                            onChange={(e) => updateStaffMember(member.id, { monthlySalary: Number(e.target.value) })}
                            className="input-field"
                            min="0"
                            step="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Total Folha Mensal:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(getTotalMonthlySalaries())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    + Encargos (estimativa de 70%): {formatCurrency(getTotalMonthlySalaries() * 0.7)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mercado e Estratégia */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Análise de Mercado e Estratégia
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure o posicionamento e estratégia de mercado do clube
                </p>
              </div>
              
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Público-alvo Principal
                    </label>
                    <select
                      value={basicInfo.targetAudience[0] || 'Amador'}
                      onChange={(e) => {
                        setBasicInfo({
                          ...basicInfo,
                          targetAudience: [e.target.value as ClubBasicInfo['targetAudience'][number]]
                        });
                        setHasChanges(true);
                      }}
                      className="input-field"
                    >
                      <option value="Amador">Amador</option>
                      <option value="Semi-Profissional">Semi-Profissional</option>
                      <option value="Profissional">Profissional</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Juvenil">Juvenil</option>
                      <option value="Adulto">Adulto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Posicionamento no Mercado
                    </label>
                    <select className="input-field">
                      <option value="Premium">Premium</option>
                      <option value="Médio">Médio</option>
                      <option value="Econômico">Econômico</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Raio de Influência (km)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Ex: 15"
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Concorrentes Diretos
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Número de concorrentes"
                      min="0"
                      max="20"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estratégias de Marketing
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      'Redes Sociais',
                      'Marketing Digital',
                      'Eventos Locais',
                      'Parcerias',
                      'Mídia Tradicional',
                      'Boca a Boca',
                      'Promoções',
                      'Escolinhas'
                    ].map((strategy) => (
                      <label key={strategy} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          defaultChecked={false}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{strategy}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diferenciais Competitivos
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Descreva os principais diferenciais do seu clube em relação à concorrência..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance e Regulamentação */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Licenças e Compliance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie licenças, alvarás e conformidade regulatória
                </p>
              </div>
              
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Licenças Municipais
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Alvará de Funcionamento',
                        'Licença de Obras',
                        'Licença Ambiental',
                        'Autorização do Corpo de Bombeiros',
                        'Licença Sanitária'
                      ].map((license) => (
                        <div key={license} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{license}</span>
                          <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                            <option value="Pendente">Pendente</option>
                            <option value="Em Análise">Em Análise</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Vencido">Vencido</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Regulamentações Esportivas
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Registro na Federação Estadual',
                        'Registro na CBF',
                        'Licença de Funcionamento Esportivo',
                        'Certificado de Qualidade FIFA',
                        'Licença para Eventos'
                      ].map((regulation) => (
                        <div key={regulation} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{regulation}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="mr-1"
                              defaultChecked={false}
                            />
                            <span className="text-xs text-gray-500">Necessário</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Conformidade Trabalhista
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">CIPA</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Comissão Interna de Prevenção de Acidentes
                      </p>
                      <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                        <option value="Em Adequação">Em Adequação</option>
                      </select>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">PPRA</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Programa de Prevenção de Riscos Ambientais
                      </p>
                      <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                        <option value="Em Adequação">Em Adequação</option>
                      </select>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">E-Social</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Sistema de Escrituração Digital
                      </p>
                      <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                        <option value="Em Adequação">Em Adequação</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Cronograma de Auditorias
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">Tipo</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">Frequência</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">Próxima Data</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">Custo Estimado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { type: 'Contábil', frequency: 'Anual', nextDate: '2024-12-31', cost: 'R$ 2.500' },
                          { type: 'Fiscal', frequency: 'Anual', nextDate: '2024-11-30', cost: 'R$ 1.800' },
                          { type: 'Trabalhista', frequency: 'Semestral', nextDate: '2024-06-30', cost: 'R$ 1.200' },
                          { type: 'Ambiental', frequency: 'Anual', nextDate: '2024-10-15', cost: 'R$ 800' }
                        ].map((audit, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{audit.type}</td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{audit.frequency}</td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="date"
                                defaultValue={audit.nextDate}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{audit.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
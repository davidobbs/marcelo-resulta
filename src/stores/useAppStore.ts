import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ClubData, 
  Market, 
  FinancialProjection, 
  InvestmentAnalysis,
  StrategicKPIs,
  KPIData,
  CustomField
} from '@/types';

// Interface para dados financeiros completos de clube profissional
export interface FinancialData {
  revenues: {
    // Receitas Operacionais
    fieldRental: {
      regularRentals: number;
      tournaments: number;
      corporateEvents: number;
      seasonalAdjustment: number;
      trainingRentals: number;
      maintenanceFees: number;
    };
    membership: {
      monthlyFees: number;
      annualFees: number;
      initationFees: number;
      familyPackages: number;
      corporateMembers: number;
      vipMemberships: number;
      loyaltyPrograms: number;
    };
    sponsorship: {
      mainSponsor: number;
      jerseySponsors: number;
      facilityNaming: number;
      equipmentSponsors: number;
      eventSponsors: number;
      digitalSponsors: number;
      stadiumSponsors: number;
      broadcastSponsors: number;
    };
    soccerSchool: {
      monthlyTuition: number;
      enrollmentFees: number;
      camps: number;
      privateClasses: number;
      tournaments: number;
      specialPrograms: number;
      equipment: number;
    };
    events: {
      corporateEvents: number;
      privateParties: number;
      tournaments: number;
      camps: number;
      weddings: number;
      conferences: number;
      shows: number;
      other: number;
    };
    merchandise: {
      jerseys: number;
      accessories: number;
      souvenirs: number;
      equipment: number;
      collectibles: number;
      customProducts: number;
    };
    foodBeverage: {
      restaurant: number;
      bar: number;
      catering: number;
      vending: number;
      events: number;
      delivery: number;
    };
    broadcastRights: {
      tvRights: number;
      streamingRights: number;
      radioRights: number;
      internationalRights: number;
      digitalRights: number;
      archiveRights: number;
    };
    playerTransfers: {
      transferFees: number;
      loanFees: number;
      solidarityMechanism: number;
      trainingCompensation: number;
      agentCommissions: number;
      contractExtensions: number;
    };
    ticketing: {
      seasonTickets: number;
      singleGameTickets: number;
      vipBoxes: number;
      groupSales: number;
      studentDiscounts: number;
      corporatePackages: number;
    };
    socialClub: {
      membershipFees: number;
      socialEvents: number;
      facilityRental: number;
      restaurantRevenue: number;
      otherServices: number;
    };
    prizesMoney: {
      championshipPrizes: number;
      cupPrizes: number;
      performanceBonuses: number;
      federationIncentives: number;
    };
    licensing: {
      brandLicensing: number;
      imageRights: number;
      logoUsage: number;
      merchandiseLicensing: number;
    };
    digitalRevenues: {
      websiteAds: number;
      socialMediaSponsors: number;
      onlineStore: number;
      subscription: number;
      digitalContent: number;
    };
    investments: {
      bankInterest: number;
      stockDividends: number;
      realEstate: number;
      otherInvestments: number;
    };
    // Campos customizados para receitas
    customRevenues: CustomField[];
  };
  costs: {
    // Custos com Pessoal
    personnel: {
      technicalStaff: {
        headCoach: number;
        assistantCoaches: number;
        physicalTrainer: number;
        goalkeeper: number;
        analyst: number;
        scout: number;
        coordinator: number;
        interpreter: number;
        other: number;
      };
      players: {
        salaries: number;
        bonuses: number;
        benefits: number;
        laborCharges: number;
        medicalInsurance: number;
        imageRights: number;
        performanceBonuses: number;
        loyaltyBonuses: number;
        thirteenthSalary: number;
        vacation: number;
      };
      administrativeStaff: {
        management: number;
        accounting: number;
        legal: number;
        hr: number;
        marketing: number;
        communication: number;
        finance: number;
        operations: number;
        commercial: number;
        other: number;
      };
      supportStaff: {
        security: number;
        cleaning: number;
        maintenance: number;
        reception: number;
        kitManager: number;
        groundsKeeper: number;
        driver: number;
        cook: number;
        other: number;
      };
      medicalStaff: {
        teamDoctor: number;
        physiotherapist: number;
        psychologist: number;
        nutritionist: number;
        nurse: number;
        masseur: number;
      };
    };
    // Instalações e Infraestrutura
    facilities: {
      rent: number;
      propertyTax: number;
      condominiumFees: number;
      fieldMaintenance: number;
      buildingMaintenance: number;
      landscaping: number;
      stadiumMaintenance: number;
      securitySystems: number;
      cleaningServices: number;
      wasteManagement: number;
    };
    // Utilidades
    utilities: {
      electricity: number;
      water: number;
      gas: number;
      internet: number;
      phone: number;
      cable: number;
      sewage: number;
      heatingCooling: number;
    };
    // Departamento Médico
    medical: {
      teamDoctor: number;
      physiotherapy: number;
      supplements: number;
      medicalExams: number;
      treatments: number;
      surgeries: number;
      emergencyMedical: number;
      preventiveMedicine: number;
      rehabilitation: number;
      medicalEquipment: number;
    };
    // Transporte e Viagens
    transportation: {
      teamTransport: number;
      accommodation: number;
      meals: number;
      fuel: number;
      vehicleMaintenance: number;
      airTravel: number;
      localTransport: number;
      carRental: number;
      parking: number;
    };
    // Equipamentos e Material Esportivo
    equipment: {
      sportingGoods: number;
      uniforms: number;
      trainingEquipment: number;
      fieldEquipment: number;
      safety: number;
      balls: number;
      goals: number;
      medicalEquipment: number;
      officeEquipment: number;
      vehicles: number;
    };
    // Marketing e Comunicação
    marketing: {
      advertising: number;
      digitalMarketing: number;
      events: number;
      materials: number;
      sponsorshipActivation: number;
      publicRelations: number;
      socialMedia: number;
      websiteMaintenance: number;
      photography: number;
      videoProduction: number;
    };
    // Administrativo
    administrative: {
      accounting: number;
      legal: number;
      consulting: number;
      banking: number;
      office: number;
      travel: number;
      subscription: number;
      software: number;
      audit: number;
      notary: number;
    };
    // Seguros
    insurance: {
      liability: number;
      property: number;
      players: number;
      equipment: number;
      vehicles: number;
      directors: number;
      publicLiability: number;
      cyber: number;
    };
    // Regulatório e Federação
    regulatory: {
      licenses: number;
      federationFees: number;
      certifications: number;
      inspections: number;
      arbitrageFees: number;
      registrations: number;
      fines: number;
      legalFees: number;
    };
    // Tecnologia
    technology: {
      software: number;
      hardware: number;
      telecommunications: number;
      support: number;
      cloudServices: number;
      backup: number;
      cybersecurity: number;
      streamingPlatform: number;
    };
    // Competições e Eventos
    competitions: {
      registrationFees: number;
      travelExpenses: number;
      accommodation: number;
      meals: number;
      arbitrageFees: number;
      medicalSupport: number;
      security: number;
      organization: number;
    };
    // Transferências e Contratações
    transfers: {
      agentCommissions: number;
      transferFees: number;
      loanFees: number;
      scoutingExpenses: number;
      medicalExams: number;
      registrationFees: number;
      contractNegotiation: number;
    };
    // Depreciação e Amortização
    depreciation: {
      buildingsDepreciation: number;
      equipmentDepreciation: number;
      vehiclesDepreciation: number;
      playersAmortization: number;
      intangibleAmortization: number;
    };
    // Custos Financeiros
    financial: {
      bankFees: number;
      loanInterest: number;
      creditCardFees: number;
      exchangeRateLoss: number;
      investmentLoss: number;
      lateFees: number;
    };
    // Outros Custos Operacionais
    otherOperational: {
      donationsCharity: number;
      communityPrograms: number;
      environmentalPrograms: number;
      contingencyFund: number;
      lossOnAssetSale: number;
      extraordinaryExpenses: number;
    };
    // Campos customizados para custos
    customCosts: CustomField[];
  };
}

interface AppStore {
  // Dados do clube
  club: ClubData;
  setClub: (club: ClubData) => void;
  updateClub: (updates: Partial<ClubData>) => void;

  // Dados de mercado
  market: Market;
  setMarket: (market: Market) => void;

  // Dados financeiros centralizados
  financialData: FinancialData;
  setFinancialData: (data: FinancialData) => void;
  updateFinancialData: (updates: Partial<FinancialData>) => void;

  // Ações para campos customizados
  addCustomField: (type: 'revenues' | 'costs', field: Omit<CustomField, 'id'>) => void;
  removeCustomField: (type: 'revenues' | 'costs', fieldId: string) => void;
  updateCustomField: (type: 'revenues' | 'costs', fieldId: string, updates: Partial<CustomField>) => void;

  // Projeções financeiras
  projections: FinancialProjection[];
  setProjections: (projections: FinancialProjection[]) => void;

  // Análise de investimento
  analysis: InvestmentAnalysis | null;
  setAnalysis: (analysis: InvestmentAnalysis) => void;

  // KPIs
  kpis: KPIData;
  setKPIs: (kpis: KPIData) => void;

  // KPIs Estratégicos
  strategicKPIs: StrategicKPIs | null;
  setStrategicKPIs: (kpis: StrategicKPIs) => void;

  // Campos Customizados
  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;

  // Função para recalcular automaticamente
  triggerRecalculation: () => void;
  isRecalculating: boolean;
  lastCalculated: Date | null;
}

// Dados iniciais do mercado brasileiro
const initialMarketData: Market = {
  name: 'Brasil',
  currency: 'R$',
  taxRate: 0.163,
  inflationRate: 0.065,
  discountRate: 0.12,
  avgHourlyRate: 90,
  expectedOccupancy: 0.67,
  hoursPerDay: 14,
  daysPerWeek: 7,
  salaryBurden: 0.70,
  rentPerSqm: 25,
  utilityCostFactor: 0.08,
  maintenanceFactor: 0.05,
  marketingFactor: 0.03,
  workingCapitalDays: 45,
  depreciationRate: 0.10,
  corporateTax: 0.163,
  growthPotential: 0.12,
  marketSizeFactor: 1.0,
  competitionLevel: 'Alto',
  regulatoryComplexity: 'Média',
};

// Dados iniciais do clube
const initialClubData: ClubData = {
  name: 'Clube de Futebol Exemplo',
  numFields: 2,
  selectedMarket: 'Brasil',
  fieldTypes: [
    {
      name: 'Society 5x5',
      hourlyRate: 80,
      dailyHours: 14,
      occupancy: 0.65,
    },
    {
      name: 'Society 7x7',
      hourlyRate: 100,
      dailyHours: 14,
      occupancy: 0.70,
    },
  ],
};

// KPIs iniciais
const initialKPIs: KPIData = {
  revenue: { name: 'Receita Total', value: 0, unit: 'R$', trend: 'stable', target: 500000, benchmark: 450000 },
  profitability: { name: 'Margem de Lucro', value: 0, unit: '%', trend: 'stable', target: 20, benchmark: 18 },
  efficiency: { name: 'Taxa de Ocupação', value: 0, unit: '%', trend: 'stable', target: 75, benchmark: 70 },
  financial: { name: 'ROI', value: 0, unit: '%', trend: 'stable', target: 15, benchmark: 12 },
};

// Dados financeiros iniciais vazios expandidos
const initialFinancialData: FinancialData = {
  revenues: {
    fieldRental: {
      regularRentals: 0,
      tournaments: 0,
      corporateEvents: 0,
      seasonalAdjustment: 0,
      trainingRentals: 0,
      maintenanceFees: 0,
    },
    membership: {
      monthlyFees: 0,
      annualFees: 0,
      initationFees: 0,
      familyPackages: 0,
      corporateMembers: 0,
      vipMemberships: 0,
      loyaltyPrograms: 0,
    },
    sponsorship: {
      mainSponsor: 0,
      jerseySponsors: 0,
      facilityNaming: 0,
      equipmentSponsors: 0,
      eventSponsors: 0,
      digitalSponsors: 0,
      stadiumSponsors: 0,
      broadcastSponsors: 0,
    },
    soccerSchool: {
      monthlyTuition: 0,
      enrollmentFees: 0,
      camps: 0,
      privateClasses: 0,
      tournaments: 0,
      specialPrograms: 0,
      equipment: 0,
    },
    events: {
      corporateEvents: 0,
      privateParties: 0,
      tournaments: 0,
      camps: 0,
      weddings: 0,
      conferences: 0,
      shows: 0,
      other: 0,
    },
    merchandise: {
      jerseys: 0,
      accessories: 0,
      souvenirs: 0,
      equipment: 0,
      collectibles: 0,
      customProducts: 0,
    },
    foodBeverage: {
      restaurant: 0,
      bar: 0,
      catering: 0,
      vending: 0,
      events: 0,
      delivery: 0,
    },
    broadcastRights: {
      tvRights: 0,
      streamingRights: 0,
      radioRights: 0,
      internationalRights: 0,
      digitalRights: 0,
      archiveRights: 0,
    },
    playerTransfers: {
      transferFees: 0,
      loanFees: 0,
      solidarityMechanism: 0,
      trainingCompensation: 0,
      agentCommissions: 0,
      contractExtensions: 0,
    },
    ticketing: {
      seasonTickets: 0,
      singleGameTickets: 0,
      vipBoxes: 0,
      groupSales: 0,
      studentDiscounts: 0,
      corporatePackages: 0,
    },
    socialClub: {
      membershipFees: 0,
      socialEvents: 0,
      facilityRental: 0,
      restaurantRevenue: 0,
      otherServices: 0,
    },
    prizesMoney: {
      championshipPrizes: 0,
      cupPrizes: 0,
      performanceBonuses: 0,
      federationIncentives: 0,
    },
    licensing: {
      brandLicensing: 0,
      imageRights: 0,
      logoUsage: 0,
      merchandiseLicensing: 0,
    },
    digitalRevenues: {
      websiteAds: 0,
      socialMediaSponsors: 0,
      onlineStore: 0,
      subscription: 0,
      digitalContent: 0,
    },
    investments: {
      bankInterest: 0,
      stockDividends: 0,
      realEstate: 0,
      otherInvestments: 0,
    },
    customRevenues: [],
  },
  costs: {
    personnel: {
      technicalStaff: {
        headCoach: 0,
        assistantCoaches: 0,
        physicalTrainer: 0,
        goalkeeper: 0,
        analyst: 0,
        scout: 0,
        coordinator: 0,
        interpreter: 0,
        other: 0,
      },
      players: {
        salaries: 0,
        bonuses: 0,
        benefits: 0,
        laborCharges: 0,
        medicalInsurance: 0,
        imageRights: 0,
        performanceBonuses: 0,
        loyaltyBonuses: 0,
        thirteenthSalary: 0,
        vacation: 0,
      },
      administrativeStaff: {
        management: 0,
        accounting: 0,
        legal: 0,
        hr: 0,
        marketing: 0,
        communication: 0,
        finance: 0,
        operations: 0,
        commercial: 0,
        other: 0,
      },
      supportStaff: {
        security: 0,
        cleaning: 0,
        maintenance: 0,
        reception: 0,
        kitManager: 0,
        groundsKeeper: 0,
        driver: 0,
        cook: 0,
        other: 0,
      },
      medicalStaff: {
        teamDoctor: 0,
        physiotherapist: 0,
        psychologist: 0,
        nutritionist: 0,
        nurse: 0,
        masseur: 0,
      },
    },
    facilities: {
      rent: 0,
      propertyTax: 0,
      condominiumFees: 0,
      fieldMaintenance: 0,
      buildingMaintenance: 0,
      landscaping: 0,
      stadiumMaintenance: 0,
      securitySystems: 0,
      cleaningServices: 0,
      wasteManagement: 0,
    },
    utilities: {
      electricity: 0,
      water: 0,
      gas: 0,
      internet: 0,
      phone: 0,
      cable: 0,
      sewage: 0,
      heatingCooling: 0,
    },
    medical: {
      teamDoctor: 0,
      physiotherapy: 0,
      supplements: 0,
      medicalExams: 0,
      treatments: 0,
      surgeries: 0,
      emergencyMedical: 0,
      preventiveMedicine: 0,
      rehabilitation: 0,
      medicalEquipment: 0,
    },
    transportation: {
      teamTransport: 0,
      accommodation: 0,
      meals: 0,
      fuel: 0,
      vehicleMaintenance: 0,
      airTravel: 0,
      localTransport: 0,
      carRental: 0,
      parking: 0,
    },
    equipment: {
      sportingGoods: 0,
      uniforms: 0,
      trainingEquipment: 0,
      fieldEquipment: 0,
      safety: 0,
      balls: 0,
      goals: 0,
      medicalEquipment: 0,
      officeEquipment: 0,
      vehicles: 0,
    },
    marketing: {
      advertising: 0,
      digitalMarketing: 0,
      events: 0,
      materials: 0,
      sponsorshipActivation: 0,
      publicRelations: 0,
      socialMedia: 0,
      websiteMaintenance: 0,
      photography: 0,
      videoProduction: 0,
    },
    administrative: {
      accounting: 0,
      legal: 0,
      consulting: 0,
      banking: 0,
      office: 0,
      travel: 0,
      subscription: 0,
      software: 0,
      audit: 0,
      notary: 0,
    },
    insurance: {
      liability: 0,
      property: 0,
      players: 0,
      equipment: 0,
      vehicles: 0,
      directors: 0,
      publicLiability: 0,
      cyber: 0,
    },
    regulatory: {
      licenses: 0,
      federationFees: 0,
      certifications: 0,
      inspections: 0,
      arbitrageFees: 0,
      registrations: 0,
      fines: 0,
      legalFees: 0,
    },
    technology: {
      software: 0,
      hardware: 0,
      telecommunications: 0,
      support: 0,
      cloudServices: 0,
      backup: 0,
      cybersecurity: 0,
      streamingPlatform: 0,
    },
    competitions: {
      registrationFees: 0,
      travelExpenses: 0,
      accommodation: 0,
      meals: 0,
      arbitrageFees: 0,
      medicalSupport: 0,
      security: 0,
      organization: 0,
    },
    transfers: {
      agentCommissions: 0,
      transferFees: 0,
      loanFees: 0,
      scoutingExpenses: 0,
      medicalExams: 0,
      registrationFees: 0,
      contractNegotiation: 0,
    },
    depreciation: {
      buildingsDepreciation: 0,
      equipmentDepreciation: 0,
      vehiclesDepreciation: 0,
      playersAmortization: 0,
      intangibleAmortization: 0,
    },
    financial: {
      bankFees: 0,
      loanInterest: 0,
      creditCardFees: 0,
      exchangeRateLoss: 0,
      investmentLoss: 0,
      lateFees: 0,
    },
    otherOperational: {
      donationsCharity: 0,
      communityPrograms: 0,
      environmentalPrograms: 0,
      contingencyFund: 0,
      lossOnAssetSale: 0,
      extraordinaryExpenses: 0,
    },
    customCosts: [],
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Estado inicial
      club: initialClubData,
      market: initialMarketData,
      financialData: initialFinancialData,
      projections: [],
      analysis: null,
      kpis: initialKPIs,
      isRecalculating: false,
      lastCalculated: null,
      strategicKPIs: null,
      customFields: [],

      // Ações para clube
      setClub: (club) => set({ club }),
      updateClub: (updates) => set((state) => ({ 
        club: { ...state.club, ...updates } 
      })),

      // Ações para mercado
      setMarket: (market) => set({ market }),

      // Ações para dados financeiros
      setFinancialData: (financialData) => set({ financialData }),
      updateFinancialData: (updates) => set((state) => ({ 
        financialData: { 
          ...state.financialData, 
          ...updates,
          revenues: { ...state.financialData.revenues, ...updates.revenues },
          costs: { ...state.financialData.costs, ...updates.costs }
        } 
      })),

      // Ações para campos customizados
      addCustomField: (type, field) => set((state) => {
        const newField = { ...field, id: Date.now().toString() };
        if (type === 'revenues') {
          return {
            financialData: {
              ...state.financialData,
              revenues: {
                ...state.financialData.revenues,
                customRevenues: [...state.financialData.revenues.customRevenues, newField]
              }
            }
          };
        } else {
          return {
            financialData: {
              ...state.financialData,
              costs: {
                ...state.financialData.costs,
                customCosts: [...state.financialData.costs.customCosts, newField]
              }
            }
          };
        }
      }),

      removeCustomField: (type, fieldId) => set((state) => {
        if (type === 'revenues') {
          return {
            financialData: {
              ...state.financialData,
              revenues: {
                ...state.financialData.revenues,
                customRevenues: state.financialData.revenues.customRevenues.filter(
                  (field: CustomField) => field.id !== fieldId
                )
              }
            }
          };
        } else {
          return {
            financialData: {
              ...state.financialData,
              costs: {
                ...state.financialData.costs,
                customCosts: state.financialData.costs.customCosts.filter(
                  (field: CustomField) => field.id !== fieldId
                )
              }
            }
          };
        }
      }),

      updateCustomField: (type, fieldId, updates) => set((state) => {
        if (type === 'revenues') {
          return {
            financialData: {
              ...state.financialData,
              revenues: {
                ...state.financialData.revenues,
                customRevenues: state.financialData.revenues.customRevenues.map(
                  (field: CustomField) => field.id === fieldId ? { ...field, ...updates } : field
                )
              }
            }
          };
        } else {
          return {
            financialData: {
              ...state.financialData,
              costs: {
                ...state.financialData.costs,
                customCosts: state.financialData.costs.customCosts.map(
                  (field: CustomField) => field.id === fieldId ? { ...field, ...updates } : field
                )
              }
            }
          };
        }
      }),

      // Ações para projeções
      setProjections: (projections) => set({ projections }),

      // Ações para análise
      setAnalysis: (analysis) => set({ analysis }),

      // Ações para KPIs
      setKPIs: (kpis) => set({ kpis }),
      setStrategicKPIs: (kpis) => set({ strategicKPIs: kpis }),
      setCustomFields: (fields) => set({ customFields: fields }),

      // Função para disparar recálculo
      triggerRecalculation: () => {
        set({ isRecalculating: true });
        // Simula processamento assíncrono
        setTimeout(() => {
          set({ isRecalculating: false, lastCalculated: new Date() });
        }, 1000);
      },
    }),
    {
      name: 'club-finance-storage',
      version: 3, // Incrementar versão para reset de dados
    }
  )
);

// Hooks para acessar partes específicas do store
export const useClubData = () => useAppStore((state) => state.club);
export const useMarketData = () => useAppStore((state) => state.market);
export const useFinancialData = () => useAppStore((state) => state.financialData);
export const useProjections = () => useAppStore((state) => state.projections);
export const useAnalysis = () => useAppStore((state) => state.analysis);
export const useKPIs = () => useAppStore((state) => state.kpis);
export const useStrategicKPIs = () => useAppStore((state) => state.strategicKPIs);
export const useCustomFields = () => useAppStore((state) => state.customFields);

// Hook para ações
export const useActions = () => useAppStore((state) => ({
  setClub: state.setClub,
  updateClub: state.updateClub,
  setMarket: state.setMarket,
  setFinancialData: state.setFinancialData,
  updateFinancialData: state.updateFinancialData,
  addCustomField: state.addCustomField,
  removeCustomField: state.removeCustomField,
  updateCustomField: state.updateCustomField,
  setProjections: state.setProjections,
  setAnalysis: state.setAnalysis,
  setKPIs: state.setKPIs,
  setStrategicKPIs: state.setStrategicKPIs,
  setCustomFields: state.setCustomFields,
  triggerRecalculation: state.triggerRecalculation,
})); 
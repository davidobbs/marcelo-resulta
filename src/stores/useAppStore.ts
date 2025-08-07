import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { 
  ClubData, 
  Market, 
  FinancialProjection, 
  InvestmentAnalysis,
  StrategicKPIs,
  KPIData,
  CustomField,
  ValuationParams,
  FinancialData,
  Investor,
  PlayerAsset,
  CountryProfile
} from '@/types';
import { countryProfiles } from '@/lib/country-data';

interface AppStore {
  club: ClubData;
  setClub: (club: ClubData) => void;
  updateClub: (updates: Partial<ClubData>) => void;

  market: Market;
  setMarket: (market: Market) => void;

  financialData: FinancialData;
  setFinancialData: (data: FinancialData) => void;
  updateFinancialData: (updates: Partial<FinancialData>) => void;

  analysisPeriod: 'monthly' | 'bimonthly' | 'quarterly' | 'annual';
  setAnalysisPeriod: (period: 'monthly' | 'bimonthly' | 'quarterly' | 'annual') => void;

  valuationParams: ValuationParams;
  setValuationParams: (params: ValuationParams) => void;

  addCustomField: (type: 'revenues' | 'costs', field: Omit<CustomField, 'id'>) => void;
  removeCustomField: (type: 'revenues' | 'costs', fieldId: string) => void;
  updateCustomField: (type: 'revenues' | 'costs', fieldId: string, updates: Partial<CustomField>) => void;

  addInvestor: (investor: Omit<Investor, 'id'>) => void;
  removeInvestor: (investorId: string) => void;
  updateInvestor: (investorId: string, updates: Partial<Investor>) => void;

  addPlayerAsset: (asset: Omit<PlayerAsset, 'id'>) => void;
  removePlayerAsset: (assetId: string) => void;
  updatePlayerAsset: (assetId: string, updates: Partial<PlayerAsset>) => void;

  projections: FinancialProjection[];
  setProjections: (projections: FinancialProjection[]) => void;

  analysis: InvestmentAnalysis | null;
  setAnalysis: (analysis: InvestmentAnalysis) => void;

  kpis: KPIData;
  setKPIs: (kpis: KPIData) => void;

  strategicKPIs: StrategicKPIs | null;
  setStrategicKPIs: (kpis: StrategicKPIs) => void;

  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;

  triggerRecalculation: () => void;
  isRecalculating: boolean;
  lastCalculated: Date | null;
  
  // Internationalization
  selectedCountryCode: string;
  setCountry: (code: string) => void;
  getCurrentCountryProfile: () => CountryProfile;
}

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
  socialContribution: 0.09,
  vatRate: 0.18,
  issRate: 0.05,
  pisCofins: 0.0925,
  socialSecurity: 0.20,
};

const initialClubData: ClubData = {
  name: 'Clube de Futebol Exemplo',
  numFields: 2,
  selectedMarket: 'Brasil',
  fieldTypes: [
    { name: 'Society 5x5', hourlyRate: 80, dailyHours: 14, occupancy: 0.65 },
    { name: 'Society 7x7', hourlyRate: 100, dailyHours: 14, occupancy: 0.70 },
  ],
};

const initialKPIs: KPIData = {
  revenue: { name: 'Receita Total', value: 0, unit: 'R$', trend: 'stable', target: 500000, benchmark: 450000 },
  profitability: { name: 'Margem de Lucro', value: 0, unit: '%', trend: 'stable', target: 20, benchmark: 18 },
  efficiency: { name: 'Taxa de Ocupação', value: 0, unit: '%', trend: 'stable', target: 75, benchmark: 70 },
  financial: { name: 'ROI', value: 0, unit: '%', trend: 'stable', target: 15, benchmark: 12 },
};

const initialFinancialData: FinancialData = {
  revenues: {
    fieldRental: { total: 0, regularRentals: 0, tournaments: 0, corporateEvents: 0, seasonalAdjustment: 0, trainingRentals: 0, maintenanceFees: 0 },
    membership: { total: 0, monthlyFees: 0, annualFees: 0, initationFees: 0, familyPackages: 0, corporateMembers: 0, vipMemberships: 0, loyaltyPrograms: 0 },
    sponsorship: { mainSponsor: 0, jerseySponsors: 0, facilityNaming: 0, equipmentSponsors: 0, eventSponsors: 0, digitalSponsors: 0, stadiumSponsors: 0, broadcastSponsors: 0, trainingKitSponsor: 0, sleeveSponsor: 0, socialMediaSponsor: 0, regionalSponsors: 0, supplierPartners: 0, charityPartners: 0, academySponsors: 0, womensTeamSponsors: 0, esportsSponsors: 0, otherPartnerships: 0 },
    soccerSchool: { total: 0, monthlyTuition: 0, enrollmentFees: 0, camps: 0, privateClasses: 0, tournaments: 0, specialPrograms: 0, equipment: 0 },
    events: { total: 0, corporateEvents: 0, privateParties: 0, tournaments: 0, camps: 0, weddings: 0, conferences: 0, shows: 0, other: 0 },
    merchandise: { total: 0, jerseys: 0, accessories: 0, souvenirs: 0, equipment: 0, collectibles: 0, customProducts: 0 },
    foodBeverage: { total: 0, restaurant: 0, bar: 0, catering: 0, vending: 0, events: 0, delivery: 0 },
    broadcastRights: { tvRights: 0, streamingRights: 0, radioRights: 0, internationalRights: 0, digitalRights: 0, archiveRights: 0 },
    playerTransfers: { transferFees: 0, loanFees: 0, solidarityMechanism: 0, trainingCompensation: 0, agentCommissions: 0, contractExtensions: 0 },
    ticketing: { total: 0, seasonTickets: 0, singleGameTickets: 0, vipBoxes: 0, groupSales: 0, studentDiscounts: 0, corporatePackages: 0 },
    socialClub: { total: 0, membershipFees: 0, socialEvents: 0, facilityRental: 0, restaurantRevenue: 0, otherServices: 0 },
    prizesMoney: { championshipPrizes: 0, cupPrizes: 0, performanceBonuses: 0, federationIncentives: 0 },
    licensing: { brandLicensing: 0, imageRights: 0, logoUsage: 0, merchandiseLicensing: 0 },
    digitalRevenues: { websiteAds: 0, socialMediaSponsors: 0, onlineStore: 0, subscription: 0, digitalContent: 0 },
    investments: { bankInterest: 0, stockDividends: 0, realEstate: 0, otherInvestments: 0 },
    customRevenues: [],
  },
  costs: {
    personnel: {
      technicalStaff: { total: 0, headCoach: 0, assistantCoaches: 0, physicalTrainer: 0, goalkeeper: 0, analyst: 0, scout: 0, coordinator: 0, interpreter: 0, other: 0 },
      players: { salaries: 0, bonuses: 0, benefits: { total: 0, housing: 0, transportation: 0, other: 0 }, laborCharges: 0, medicalInsurance: 0, imageRights: 0, performanceBonuses: 0, loyaltyBonuses: 0, thirteenthSalary: 0, vacation: 0 },
      administrativeStaff: { total: 0, management: 0, accounting: 0, legal: 0, hr: 0, marketing: 0, communication: 0, finance: 0, operations: 0, commercial: 0, other: 0 },
      supportStaff: { total: 0, security: 0, cleaning: 0, maintenance: 0, reception: 0, kitManager: 0, groundsKeeper: 0, driver: 0, cook: 0, other: 0 },
      medicalStaff: { total: 0, teamDoctor: 0, physiotherapist: 0, psychologist: 0, nutritionist: 0, nurse: 0, masseur: 0 },
    },
    facilities: { total: 0, rent: 0, propertyTax: 0, condominiumFees: 0, fieldMaintenance: 0, buildingMaintenance: 0, landscaping: 0, stadiumMaintenance: 0, securitySystems: 0, cleaningServices: 0, wasteManagement: 0 },
    utilities: { total: 0, electricity: 0, water: 0, gas: 0, internet: 0, phone: 0, cable: 0, sewage: 0, heatingCooling: 0 },
    medical: { total: 0, teamDoctor: 0, physiotherapy: 0, supplements: 0, medicalExams: 0, treatments: 0, surgeries: 0, emergencyMedical: 0, preventiveMedicine: 0, rehabilitation: 0, medicalEquipment: 0 },
    transportation: { total: 0, teamTransport: 0, accommodation: 0, meals: 0, fuel: 0, vehicleMaintenance: 0, airTravel: 0, localTransport: 0, carRental: 0, parking: 0 },
    equipment: { total: 0, sportingGoods: 0, uniforms: 0, trainingEquipment: 0, fieldEquipment: 0, safety: 0, balls: 0, goals: 0, medicalEquipment: 0, officeEquipment: 0, vehicles: 0 },
    marketing: { total: 0, advertising: 0, digitalMarketing: 0, events: 0, materials: 0, sponsorshipActivation: 0, publicRelations: 0, socialMedia: 0, websiteMaintenance: 0, photography: 0, videoProduction: 0 },
    administrative: { total: 0, accounting: 0, legal: 0, consulting: 0, banking: 0, office: 0, travel: 0, subscription: 0, software: 0, audit: 0, notary: 0 },
    insurance: { total: 0, liability: 0, property: 0, players: 0, equipment: 0, vehicles: 0, directors: 0, publicLiability: 0, cyber: 0 },
    regulatory: { total: 0, licenses: 0, federationFees: 0, certifications: 0, inspections: 0, arbitrageFees: 0, registrations: 0, fines: 0, legalFees: 0 },
    technology: { total: 0, software: 0, hardware: 0, telecommunications: 0, support: 0, cloudServices: 0, backup: 0, cybersecurity: 0, streamingPlatform: 0 },
    competitions: { total: 0, registrationFees: 0, travelExpenses: 0, accommodation: 0, meals: 0, arbitrageFees: 0, medicalSupport: 0, security: 0, organization: 0 },
    transfers: { agentCommissions: 0, transferFees: 0, loanFees: 0, scoutingExpenses: 0, medicalExams: 0, registrationFees: 0, contractNegotiation: 0 },
    depreciation: { buildingsDepreciation: 0, equipmentDepreciation: 0, vehiclesDepreciation: 0, playersAmortization: 0, intangibleAmortization: 0 },
    financial: { bankFees: 0, loanInterest: 0, creditCardFees: 0, exchangeRateLoss: 0, investmentLoss: 0, lateFees: 0 },
    otherOperational: { donationsCharity: 0, communityPrograms: 0, environmentalPrograms: 0, contingencyFund: 0, lossOnAssetSale: 0, extraordinaryExpenses: 0 },
    customCosts: [],
  },
  assets: {
    playerPassValue: [],
  },
  investors: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      club: initialClubData,
      market: initialMarketData,
      financialData: initialFinancialData,
      analysisPeriod: 'monthly',
      valuationParams: {
        updateOnline: false,
        discountRate: 0.12,
        growthPotential: 0.08,
        marketSizeFactor: 1.0,
      },
      projections: [],
      analysis: null,
      kpis: initialKPIs,
      isRecalculating: false,
      lastCalculated: null,
      strategicKPIs: null,
      customFields: [],

      // Internationalization
      selectedCountryCode: 'BR', // Default to Brasil
      setCountry: (code) => set({ selectedCountryCode: code }),
      getCurrentCountryProfile: () => {
        const code = get().selectedCountryCode;
        return countryProfiles[code] || countryProfiles.BR; // Fallback to BR
      },

      setClub: (club) => set({ club }),
      updateClub: (updates) => set((state) => ({ club: { ...state.club, ...updates } })),
      setMarket: (market) => set({ market }),
      setFinancialData: (financialData) => set({ financialData }),
      updateFinancialData: (updates) => set((state) => ({ 
        financialData: { 
          ...state.financialData, 
          ...updates,
          revenues: { ...state.financialData.revenues, ...updates.revenues },
          costs: { ...state.financialData.costs, ...updates.costs }
        } 
      })),
      setAnalysisPeriod: (period) => set({ analysisPeriod: period }),
      setValuationParams: (params) => set({ valuationParams: params }),

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
        }
          return {
            financialData: {
              ...state.financialData,
              costs: {
                ...state.financialData.costs,
                customCosts: [...state.financialData.costs.customCosts, newField]
              }
            }
          };
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
        }
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
        }
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
      }),
      
      addInvestor: (investor) => set((state) => ({
        financialData: {
          ...state.financialData,
          investors: [...state.financialData.investors, { ...investor, id: Date.now().toString() }]
        }
      })),
      
      removeInvestor: (investorId) => set((state) => ({
        financialData: {
          ...state.financialData,
          investors: state.financialData.investors.filter((inv) => inv.id !== investorId)
        }
      })),

      updateInvestor: (investorId, updates) => set((state) => ({
        financialData: {
          ...state.financialData,
          investors: state.financialData.investors.map((inv) =>
            inv.id === investorId ? { ...inv, ...updates } : inv
          )
        }
      })),

      addPlayerAsset: (asset) => set((state) => ({
        financialData: {
          ...state.financialData,
          assets: {
            ...state.financialData.assets,
            playerPassValue: [...state.financialData.assets.playerPassValue, { ...asset, id: Date.now().toString() }]
          }
        }
      })),
      
      removePlayerAsset: (assetId) => set((state) => ({
        financialData: {
          ...state.financialData,
          assets: {
            ...state.financialData.assets,
            playerPassValue: state.financialData.assets.playerPassValue.filter((asset) => asset.id !== assetId)
          }
        }
      })),

      updatePlayerAsset: (assetId, updates) => set((state) => ({
        financialData: {
          ...state.financialData,
          assets: {
            ...state.financialData.assets,
            playerPassValue: state.financialData.assets.playerPassValue.map((asset) =>
              asset.id === assetId ? { ...asset, ...updates } : asset
            )
          }
        }
      })),

      setProjections: (projections) => set({ projections }),
      setAnalysis: (analysis) => set({ analysis }),
      setKPIs: (kpis) => set({ kpis }),
      setStrategicKPIs: (kpis) => set({ strategicKPIs: kpis }),
      setCustomFields: (fields) => set({ customFields: fields }),

      triggerRecalculation: () => {
        set({ isRecalculating: true });
        setTimeout(() => {
          set({ isRecalculating: false, lastCalculated: new Date() });
        }, 1000);
      },
    }),
    {
      name: 'club-finance-storage',
      version: 5, // Incremented version due to new state
    }
  )
);

export const useClubData = () => useAppStore((state) => state.club);
export const useMarketData = () => useAppStore((state) => state.market);
export const useFinancialData = () => useAppStore((state) => state.financialData);
export const useAnalysisPeriod = () => useAppStore((state) => state.analysisPeriod);
export const useValuationParams = () => useAppStore((state) => state.valuationParams);
export const useProjections = () => useAppStore((state) => state.projections);
export const useAnalysis = () => useAppStore((state) => state.analysis);
export const useKPIs = () => useAppStore((state) => state.kpis);
export const useStrategicKPIs = () => useAppStore((state) => state.strategicKPIs);
export const useCustomFields = () => useAppStore((state) => state.customFields);
export const useInvestors = () => useAppStore((state) => state.financialData.investors);
export const usePlayerAssets = () => useAppStore((state) => state.financialData.assets.playerPassValue);

// New hooks for internationalization
export const useCountry = () => useAppStore((state) => ({
    selectedCountryCode: state.selectedCountryCode,
    setCountry: state.setCountry,
    countryProfile: state.getCurrentCountryProfile(),
}));

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
  setAnalysisPeriod: state.setAnalysisPeriod,
  setValuationParams: state.setValuationParams,
  addInvestor: state.addInvestor,
  removeInvestor: state.removeInvestor,
  updateInvestor: state.updateInvestor,
  addPlayerAsset: state.addPlayerAsset,
  removePlayerAsset: state.removePlayerAsset,
  updatePlayerAsset: state.updatePlayerAsset,
  setCountry: state.setCountry,
}));

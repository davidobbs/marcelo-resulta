export interface ClubData {
  name: string;
  numFields: number;
  selectedMarket: string;
  fieldTypes: {
    name: string;
    hourlyRate: number;
    dailyHours: number;
    occupancy: number;
  }[];
}

export interface Market {
  name: string;
  currency: string;
  taxRate: number;
  inflationRate: number;
  discountRate: number;
  avgHourlyRate: number;
  expectedOccupancy: number;
  hoursPerDay: number;
  daysPerWeek: number;
  salaryBurden: number;
  rentPerSqm: number;
  utilityCostFactor: number;
  maintenanceFactor: number;
  marketingFactor: number;
  workingCapitalDays: number;
  depreciationRate: number;
  corporateTax: number;
  growthPotential: number;
  marketSizeFactor: number;
  competitionLevel: string;
  regulatoryComplexity: string;
  // Propriedades adicionais para impostos específicos do país
  socialContribution?: number;
  vatRate?: number;
  issRate?: number;
  pisCofins?: number;
  socialSecurity?: number;
}

// Tipos detalhados para receitas
export interface DetailedRevenue {
  total: number;
  fieldRental: {
    total: number;
    regularRentals: number;
    tournaments: number;
    corporateEvents: number;
    seasonalAdjustment: number;
  };
  membership: {
    total: number;
    monthlyFees: number;
    annualFees: number;
    initationFees: number;
    familyPackages: number;
    corporateMembers: number;
  };
  soccerSchool: {
    total: number;
    monthlyTuition: number;
    enrollmentFees: number;
    camps: number;
    privateClasses: number;
    tournaments: number;
  };
  sponsorship: {
    total: number;
    mainSponsor: number;
    jerseySponsors: number;
    facilityNaming: number;
    equipmentSponsors: number;
    eventSponsors: number;
    digitalSponsors: number;
  };
  merchandise: {
    total: number;
    jerseys: number;
    accessories: number;
    souvenirs: number;
    equipment: number;
  };
  events: {
    total: number;
    corporateEvents: number;
    privateParties: number;
    tournaments: number;
    camps: number;
    other: number;
  };
  foodBeverage: {
    total: number;
    restaurant: number;
    bar: number;
    snackBar: number;
    catering: number;
    vending: number;
  };
  other: CustomField[];
}

// Tipos detalhados para custos operacionais
export interface DetailedOperationalCosts {
  total: number;
  personnel: {
    total: number;
    technicalStaff: {
      total: number;
      headCoach: number;
      assistantCoaches: number;
      physicalTrainer: number;
      goalkeeper: number;
      analyst: number;
      other: number;
    };
    players: {
      total: number;
      salaries: number;
      bonuses: number;
      benefits: number;
      laborCharges: number;
      medicalInsurance: number;
    };
    administrativeStaff: {
      total: number;
      management: number;
      accounting: number;
      legal: number;
      hr: number;
      marketing: number;
      other: number;
    };
    supportStaff: {
      total: number;
      security: number;
      cleaning: number;
      maintenance: number;
      reception: number;
      other: number;
    };
  };
  facilities: {
    total: number;
    maintenance: number;
    cleaning: number;
    security: number;
    landscaping: number;
    repairs: number;
  };
  utilities: {
    total: number;
    electricity: number;
    water: number;
    gas: number;
    internet: number;
    phone: number;
    waste: number;
  };
  equipment: {
    total: number;
    fieldsEquipment: number;
    sportsEquipment: number;
    technology: number;
    vehicles: number;
    other: number;
  };
  marketing: {
    total: number;
    digitalMarketing: number;
    traditionalMedia: number;
    events: number;
    sponsorships: number;
    materials: number;
  };
  administrative: {
    total: number;
    accounting: number;
    legal: number;
    consulting: number;
    software: number;
    officeSupplies: number;
    banking: number;
  };
  insurance: {
    total: number;
    property: number;
    liability: number;
    equipmentInsurance: number;
    workersCompensation: number;
    other: number;
  };
  regulatory: {
    total: number;
    licenses: number;
    inspections: number;
    compliance: number;
    taxes: number;
    other: number;
  };
  medical: {
    total: number;
    teamDoctor: number;
    physiotherapy: number;
    supplements: number;
    medicalExams: number;
    treatments: number;
  };
  transportation: {
    total: number;
    teamTransport: number;
    accommodation: number;
    meals: number;
    fuel: number;
    vehicleMaintenance: number;
  };
  hospitality: {
    total: number;
    guestMeals: number;
    entertainment: number;
    gifts: number;
    events: number;
  };
  maintenance: {
    total: number;
    preventive: number;
    corrective: number;
    supplies: number;
    contracts: number;
  };
  technology: {
    total: number;
    software: number;
    hardware: number;
    telecommunications: number;
    support: number;
  };
  other: CustomField[];
}

export interface FinancialProjection {
  year: number;
  revenue: DetailedRevenue;
  costs: DetailedOperationalCosts;
  profit?: number;
  taxes: {
    total: number;
    corporateTax: number;
    vat: number;
    socialContributions: number;
    municipalTaxes: number;
  };
  cashFlow: {
    operational: number;
    investment: number;
    financing: number;
    net: number;
    accumulated: number;
  };
  metrics: {
    grossMargin: number;
    netMargin: number;
    ebitda: number;
    ebit: number;
    netProfit: number;
    roa: number;
    roe: number;
    debtToEquity: number;
    currentRatio: number;
  };
}

export interface InvestmentAnalysis {
  initialInvestment: InvestmentBreakdown;
  projections: FinancialProjection[];
  valuation: ValuationMetrics;
  sensitivity: {
    variables: SensitivityVariable[];
    results: SensitivityResult[];
  };
  scenarios: {
    optimistic: FinancialProjection[];
    realistic: FinancialProjection[];
    pessimistic: FinancialProjection[];
    monteCarloResults: MonteCarloResult[];
  };
}

export interface KPIMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
  benchmark: number;
}

export interface StrategicKPIs {
  financial: {
    revenueGrowthRate: KPIMetric;
    profitMargin: KPIMetric;
    cashFlowMargin: KPIMetric;
    returnOnAssets: KPIMetric;
    returnOnEquity: KPIMetric;
    debtToEquityRatio: KPIMetric;
    breakEvenPoint: KPIMetric;
  };
  operational: {
    fieldUtilizationRate: KPIMetric;
    averageRevenuePerField: KPIMetric;
    membershipRetentionRate: KPIMetric;
    staffProductivity: KPIMetric;
    maintenanceCostRatio: KPIMetric;
    energyEfficiency: KPIMetric;
  };
  customer: {
    customerSatisfactionScore: KPIMetric;
    netPromoterScore: KPIMetric;
    averageCustomerLifetime: KPIMetric;
    membershipGrowthRate: KPIMetric;
    churnRate: KPIMetric;
    averageRevenuePerCustomer: KPIMetric;
  };
  growth: {
    membershipGrowth: KPIMetric;
    revenueGrowth: KPIMetric;
    marketExpansion: KPIMetric;
    facilityExpansion: KPIMetric;
  };
  sustainability: {
    energyEfficiency: KPIMetric;
    wasteReduction: KPIMetric;
    waterUsage: KPIMetric;
    carbonFootprint: KPIMetric;
  };
}

export interface KPIData {
  revenue: Kpi;
  profitability: Kpi;
  efficiency: Kpi;
  financial: Kpi;
}

export interface Kpi {
  name: string;
  value: number;
  unit: string;
  trend: string;
  target: number;
  benchmark: number;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean' | 'select';
  category: string;
  value: number;
  formula?: string;
  unit?: string;
  validation: Record<string, unknown>;
  isEditable: boolean;
  isVisible: boolean;
  dependencies?: string[];
  description: string;
}

// Tipos adicionais para dados estratégicos
export interface ClubBasicInfo {
  name: string;
  foundedYear: number;
  legalStructure: string;
  taxId: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: Record<string, string>;
  };
  targetAudience: string[];
  mission?: string;
  vision?: string;
  values?: string[];
}

export interface FootballField {
  id: string;
  name: string;
  type: 'grass' | 'synthetic' | 'sand' | 'futsal';
  size: '11x11' | '7x7' | '5x5' | 'society';
  dimensions: {
    length: number;
    width: number;
  };
  capacity?: number;
  hourlyRate: number;
  utilizationRate: number;
  maintenanceCost: number;
  features: string[];
  status: 'active' | 'maintenance' | 'construction';
  amenities: string[];
}

export interface ClubFacility {
  id: string;
  name: string;
  type: string;
  area: number;
  capacity?: number;
  description?: string;
  features: string[];
  maintenanceSchedule?: string;
  status: 'active' | 'maintenance' | 'construction';
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  contractType: 'CLT' | 'Freelancer' | 'Volunteer' | 'Partner';
  salary?: number;
  monthlySalary: number;
  benefits?: string[];
  startDate: string;
  certifications?: string[];
  experience: number;
  status: 'active' | 'inactive' | 'vacation';
}

export interface ExternalFinancing {
  id: string;
  type: 'loan' | 'investment' | 'grant' | 'sponsorship';
  source: string;
  amount: number;
  interestRate?: number;
  term?: number;
  requirements?: string[];
  status: 'applied' | 'approved' | 'received' | 'rejected';
  applicationDate: string;
  approvalDate?: string;
  conditions?: string[];
}

// Tipos para análises
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface InvestmentBreakdown {
  construction: number;
  equipment: number;
  licenses: number;
  workingCapital: number;
  marketing: number;
  other: number;
  total: number;
}

export interface MonteCarloAnalysis {
  scenarios: number;
  variables: string[];
  results: MonteCarloResult[];
  confidence: {
    level: number;
    range: {
      min: number;
      max: number;
    };
  };
}

export interface MonteCarloResult {
  scenario: number;
  variables: Record<string, number>;
  npv: number;
  irr: number;
  payback: number;
}

export interface EnhancedSensitivityAnalysis {
  variables: SensitivityVariable[];
  results: SensitivityResult[];
  tornado: TornadoChart;
}

export interface SensitivityVariable {
  name: string;
  baseValue: number;
  variation: number;
  type: 'percentage' | 'absolute';
}

export interface SensitivityResult {
  variable: string;
  impact: {
    low: number;
    base: number;
    high: number;
  };
  elasticity: number;
}

export interface TornadoChart {
  variables: string[];
  impacts: number[];
}

export interface ValuationMetrics {
  npv: number;
  irr: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  breakEvenPoint: number;
  returnOnInvestment: number;
}

export interface ComprehensiveViabilityAnalysis {
  financial: ValuationMetrics;
  market: {
    size: number;
    growth: number;
    competition: string;
    opportunity: number;
  };
  operational: {
    efficiency: number;
    capacity: number;
    scalability: number;
  };
  risks: {
    financial: number;
    operational: number;
    market: number;
    regulatory: number;
  };
  recommendations: string[];
  score: number;
}
export interface FinancialVariable {
  id: string;
  name: string;
  formula: string;
  value: number;
  dependencies: string[];
  category: 'revenue' | 'cost' | 'metric' | 'projection';
  unit: 'currency' | 'percentage' | 'number' | 'days';
  description: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  breakEvenPoint: number;
  roi: number;
}

export interface FinancialProjection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
  cashFlow?: { operational: number; investment: number; financing: number; net: number; accumulated: number; };
  year?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProjectionCard {
  title: string;
  currentValue: number;
  projectedValue: number;
  growth: number;
  icon: React.ReactElement;
  color: string;
}

export interface CustomField {
  id: string;
  label: string;
  name: string;
  value: string | number;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  description?: string;
  category?: string;
  isEditable?: boolean;
  isVisible?: boolean;
}

export interface ClubData {
  name: string;
  numFields: number;
  selectedMarket: string;
  fieldTypes: { name: string; hourlyRate: number; dailyHours: number; occupancy: number; }[];
}

interface PersonnelCostCategory {
  total: number;
  [key: string]: number;
}

interface PlayerCosts {
  salaries: number;
  bonuses: number;
  benefits: { total: number; housing: number; transportation: number; other: number; };
  laborCharges: number;
  medicalInsurance: number;
  imageRights: number;
  performanceBonuses: number;
  loyaltyBonuses: number;
  thirteenthSalary: number;
  vacation: number;
}

interface PersonnelCosts {
  technicalStaff: PersonnelCostCategory;
  players: PlayerCosts;
  administrativeStaff: PersonnelCostCategory;
  supportStaff: PersonnelCostCategory;
  medicalStaff: PersonnelCostCategory;
}

export interface FinancialData {
  revenues: {
    fieldRental: Record<string, number | QuantifiableItem>;
    membership: Record<string, number | QuantifiableItem>;
    sponsorship: Record<string, number | QuantifiableItem>;
    soccerSchool: Record<string, number | QuantifiableItem>;
    events: Record<string, number | QuantifiableItem>;
    merchandise: Record<string, number | QuantifiableItem>;
    foodBeverage: Record<string, number | QuantifiableItem>;
    broadcastRights: Record<string, number | QuantifiableItem>;
    playerTransfers: Record<string, number | QuantifiableItem>;
    ticketing: Record<string, number | QuantifiableItem>;
    socialClub: Record<string, number | QuantifiableItem>;
    prizesMoney: Record<string, number | QuantifiableItem>;
    licensing: Record<string, number | QuantifiableItem>;
    digitalRevenues: Record<string, number | QuantifiableItem>;
    investments: Record<string, number | QuantifiableItem>;
    customRevenues: CustomField[];
  };
  costs: {
    personnel: PersonnelCosts;
    facilities: Record<string, number | QuantifiableItem>;
    utilities: Record<string, number | QuantifiableItem>;
    medical: Record<string, number | QuantifiableItem>;
    transportation: Record<string, number | QuantifiableItem>;
    equipment: Record<string, number | QuantifiableItem>;
    marketing: Record<string, number | QuantifiableItem>;
    administrative: Record<string, number | QuantifiableItem>;
    insurance: Record<string, number | QuantifiableItem>;
    regulatory: Record<string, number | QuantifiableItem>;
    technology: Record<string, number | QuantifiableItem>;
    competitions: Record<string, number | QuantifiableItem>;
    transfers: Record<string, number | QuantifiableItem>;
    depreciation: Record<string, number | QuantifiableItem>;
    financial: Record<string, number | QuantifiableItem>;
    otherOperational: Record<string, number | QuantifiableItem>;
    customCosts: CustomField[];
  };
  assets: { playerPassValue: PlayerAsset[] };
  investors: Investor[];
}

export interface QuantifiableItem {
  total: number;
  quantity?: number;
  unitPrice?: number;
  unitName?: string;
}

export interface Investor {
  id: string;
  name: string;
  investmentValue: number;
  equityPercentage: number;
}

export interface PlayerAsset {
  id: string;
  playerName: string;
  marketValue: number;
  contractEndDate: string;
  ownershipPercentage: number;
}

export interface KPIMetric {
  name: string;
  value: number;
  target: number;
  trend: string;
  unit: string;
  benchmark: number;
}

interface SensitivityResult {
  variation: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

export interface SensitivityAnalysis {
  variables: string[];
  results: SensitivityResult[];
}

export interface Scenarios {
  optimistic: FinancialProjection;
  realistic: FinancialProjection;
  pessimistic: FinancialProjection;
}

export interface InvestmentAnalysis {
  valuation: ValuationMetrics;
  sensitivity: SensitivityAnalysis;
  scenarios: Scenarios;
}

export interface KPIData {
  revenue: KPIMetric;
  profitability: KPIMetric;
  efficiency: KPIMetric;
  financial: KPIMetric;
}

export interface StrategicKPIs {
  financial: KPIMetric[];
  operational: KPIMetric[];
  customer: KPIMetric[];
  growth: KPIMetric[];
  sustainability: KPIMetric[];
}

export interface ValuationMetrics {
  npv: number;
  irr: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  roi: number;
  breakEvenPoint: number;
  enterpriseValue?: number;
  terminalValue?: number;
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
  socialContribution: number;
  vatRate: number;
  issRate: number;
  pisCofins: number;
  socialSecurity: number;
}

interface Tax {
  name: string;
  rate: number;
  type: 'corporate' | 'labor' | 'vat' | 'social_contribution' | 'other';
  appliesTo: ('profits' | 'revenues' | 'salaries')[];
  description: string;
}

export interface CountryProfile {
  code: string;
  name: string;
  currency: { code: string; symbol: string; };
  taxes: Tax[];
  federationFees?: {
    playerRegistration: number;
    annualFee: number;
  };
}

export interface ValuationParams {
  updateOnline: boolean;
  discountRate: number;
  growthPotential: number;
  marketSizeFactor: number;
}

export interface InvestmentBreakdown {
  total: number;
  construction?: number;
  licenses?: number;
  workingCapital?: number;
  marketing?: number;
  other?: number;
}

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
  };
  targetAudience: string[];
  missionStatement?: string;
}

export interface FootballField {
  id: string;
  name: string;
  type: string;
  dimensions: { length: number; width: number };
  surfaceType: string;
  lighting: boolean;
  covered: boolean;
  capacity: number;
  hourlyRate: number;
  maintenanceCost: number;
  utilizationRate: number;
}

export interface ClubFacility {
  id: string;
  name: string;
  type: string;
  area: number;
  capacity: number;
  monthlyOperatingCost: number;
  monthlyRevenue?: number;
}

export interface StaffMember {
  id: string;
  position: string;
  level: string;
  workload: string;
  monthlySalary: number;
  contractType: string;
}

export interface ExternalFinancing {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  provider?: string;
  collateral?: string;
}

// Tipos para ComprehensiveViabilityAnalysis
interface FinancialViability {
  npv: number;
  irr: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  modifiedIRR: number;
  discountedPayback: number;
  valueAtRisk: number;
  expectedValue: number;
}

interface MarketViability {
  marketSize: number;
  marketGrowthRate: number;
  competitivPosition: 'Líder' | 'Desafiante' | 'Seguidor' | 'Nicho';
  marketShareProjection: number;
  customerDemandForecast: {
    period: string;
    demandLevel: 'Baixa' | 'Média' | 'Alta';
    estimatedVolume: number;
    confidence: number;
  }[];
  competitivePressure: 'Baixa' | 'Média' | 'Alta';
}

interface OperationalViability {
  locationScore: number;
  infrastructureScore: number;
  staffingScore: number;
  operationalEfficiency: number;
  scalabilityScore: number;
  overallScore: number;
}

interface StrategicViability {
  competitiveAdvantage: string[];
  marketPosition: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicFit: number;
  longTermSustainability: number;
}

interface Risk {
  id: string;
  category: 'Financeiro' | 'Operacional' | 'Mercado' | 'Estratégico';
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  timeframe: 'Curto Prazo' | 'Médio Prazo' | 'Longo Prazo';
}

interface MitigationStrategy {
  riskId: string;
  strategy: string;
  cost: number;
  effectiveness: number;
  timeframe: string;
}

interface ContingencyPlan {
  trigger: string;
  actions: string[];
  resources: number;
  responsibleParty: string;
}

interface RiskAnalysis {
  risks: Risk[];
  overallRiskLevel: 'Baixo' | 'Médio' | 'Alto';
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
}

export interface ComprehensiveViabilityAnalysis {
  financialViability: FinancialViability;
  marketViability: MarketViability;
  operationalViability: OperationalViability;
  strategicViability: StrategicViability;
  riskAnalysis: RiskAnalysis;
  sensitivityAnalysis: SensitivityAnalysis;
}

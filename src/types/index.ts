// Tipos base do sistema
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
  socialContribution?: number;
  pisCofins?: number;
  issRate?: number;
  vatRate?: number;
  socialSecurity?: number;
  growthPotential: number;
  marketSizeFactor: number;
  competitionLevel: 'Baixo' | 'Médio' | 'Alto';
  regulatoryComplexity: 'Baixa' | 'Média' | 'Alta';
}

// NOVOS TIPOS PARA ANÁLISE COMPLETA DE CLUBES DE FUTEBOL

// Dados estratégicos iniciais (Ano 0)
export interface StrategicInputData {
  // Dados básicos do clube
  clubInfo: ClubBasicInfo;
  
  // Infraestrutura física
  infrastructure: ClubInfrastructure;
  
  // Dados financeiros iniciais
  initialFinancials: InitialFinancialData;
  
  // Estratégia de mercado
  marketStrategy: MarketStrategy;
  
  // Recursos humanos
  humanResources: HumanResourcesData;
  
  // Compliance e regulamentação
  compliance: ComplianceData;
}

export interface ComplianceData {
  licenses: LicensingRequirement[];
  regulations: RegulatoryCompliance[];
  certifications: Certification[];
  auditSchedule: AuditSchedule[];
}

export interface LicensingRequirement {
  id: string;
  type: 'Municipal' | 'Estadual' | 'Federal' | 'Federação' | 'Liga';
  name: string;
  status: 'Pendente' | 'Em Análise' | 'Aprovado' | 'Vencido';
  expirationDate?: Date;
  renewalCost: number;
  isRequired: boolean;
}

export interface RegulatoryCompliance {
  category: 'Trabalhista' | 'Tributária' | 'Ambiental' | 'Segurança' | 'Sanitária';
  requirement: string;
  status: 'Conforme' | 'Não Conforme' | 'Em Adequação';
  lastAudit?: Date;
  nextAudit?: Date;
  responsibleParty: string;
}

export interface Certification {
  name: string;
  issuingBody: string;
  validUntil?: Date;
  cost: number;
  isRequired: boolean;
}

export interface AuditSchedule {
  type: 'Contábil' | 'Fiscal' | 'Operacional' | 'Ambiental';
  frequency: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  nextDate: Date;
  estimatedCost: number;
}

export interface ClubBasicInfo {
  name: string;
  foundationDate?: Date;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  legalStructure: 'Sociedade Limitada' | 'Sociedade Anônima' | 'Associação' | 'Cooperativa';
  registrationNumber?: string;
  targetAudience: ('Amador' | 'Semi-Profissional' | 'Profissional' | 'Infantil' | 'Juvenil' | 'Adulto')[];
  missionStatement?: string;
  competitiveDivision?: string;
}

export interface ClubInfrastructure {
  // Campos de futebol
  fields: FootballField[];
  
  // Instalações complementares
  facilities: ClubFacility[];
  
  // Propriedade do terreno
  landOwnership: 'Próprio' | 'Alugado' | 'Cessão' | 'Comodato';
  landArea: number; // em m²
  builtArea: number; // em m²
  
  // Capacidade total
  totalCapacity: number;
  parkingSpaces: number;
}

export interface FootballField {
  id: string;
  name: string;
  type: 'Society 5x5' | 'Society 7x7' | 'Futsal' | 'Campo 11x11' | 'Campo Reduzido';
  dimensions: { length: number; width: number }; // em metros
  surfaceType: 'Grama Natural' | 'Grama Sintética' | 'Quadra' | 'Saibro';
  lighting: boolean;
  covered: boolean;
  capacity: number; // espectadores
  hourlyRate: number;
  maintenanceCost: number; // mensal
  utilizationRate: number; // % esperada
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface ClubFacility {
  id: string;
  name: string;
  type: 'Vestiário' | 'Academia' | 'Restaurante' | 'Loja' | 'Escritório' | 'Estacionamento' | 'Arquibancada' | 'Outro';
  area: number; // em m²
  capacity?: number;
  monthlyRevenue?: number;
  monthlyOperatingCost: number;
  description?: string;
}

// Dados financeiros iniciais detalhados
export interface InitialFinancialData {
  // Capital inicial
  initialCapital: number;
  ownersEquity: number;
  externalFinancing: ExternalFinancing[];
  
  // Investimentos iniciais detalhados
  initialInvestments: DetailedInvestments;
  
  // Ativos existentes
  existingAssets: ExistingAssets;
  
  // Passivos existentes
  existingLiabilities: ExistingLiabilities;
}

export interface ExternalFinancing {
  id: string;
  type: 'Empréstimo Bancário' | 'Financiamento' | 'Investidor Anjo' | 'Venture Capital' | 'Crowdfunding';
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment?: number;
  collateral?: string;
  provider: string;
}

export interface DetailedInvestments {
  // Infraestrutura
  landAcquisition?: number;
  fieldConstruction: FieldConstructionCosts[];
  facilityConstruction: FacilityConstructionCosts[];
  
  // Equipamentos
  sportsEquipment: EquipmentCosts[];
  technology: TechnologyCosts[];
  vehicles?: VehicleCosts[];
  
  // Intangíveis
  licensing: LicensingCosts[];
  branding: BrandingCosts[];
  
  // Capital de giro
  workingCapital: WorkingCapitalBreakdown;
  
  // Contingências
  contingencyReserve: number;
}

export interface FieldConstructionCosts {
  fieldId: string;
  grading: number;
  drainage: number;
  surface: number;
  lighting: number;
  fencing: number;
  goals: number;
  irrigation?: number;
  other: number;
  total: number;
}

export interface FacilityConstructionCosts {
  facilityType: string;
  civilConstruction: number;
  plumbing: number;
  electrical: number;
  finishing: number;
  equipment: number;
  other: number;
  total: number;
}

export interface EquipmentCosts {
  category: 'Bolas' | 'Uniformes' | 'Equipamentos de Treino' | 'Equipamentos Médicos' | 'Manutenção';
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  depreciationYears: number;
}

// Estratégia de mercado
export interface MarketStrategy {
  targetMarkets: TargetMarket[];
  pricingStrategy: PricingStrategy;
  marketingPlan: MarketingPlan;
  competitiveAnalysis: CompetitiveAnalysis;
  growthStrategy: GrowthStrategy;
}

export interface MarketingPlan {
  budget: number;
  channels: MarketingChannel[];
  campaigns: MarketingCampaign[];
  targetAcquisitionCost: number;
  expectedConversionRate: number;
}

export interface MarketingChannel {
  name: string;
  type: 'Digital' | 'Tradicional' | 'Eventos' | 'Parcerias';
  monthlyBudget: number;
  expectedReach: number;
  conversionRate: number;
}

export interface MarketingCampaign {
  name: string;
  objective: string;
  budget: number;
  duration: number; // dias
  expectedROI: number;
  channels: string[];
}

export interface CompetitiveAnalysis {
  competitors: Competitor[];
  marketPosition: 'Líder' | 'Desafiante' | 'Seguidor' | 'Nicho';
  competitiveAdvantages: string[];
  threats: string[];
  opportunities: string[];
}

export interface Competitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: number;
  location: string;
  services: string[];
}

export interface GrowthStrategy {
  shortTerm: GrowthObjective[];
  mediumTerm: GrowthObjective[];
  longTerm: GrowthObjective[];
  expansionPlans: ExpansionPlan[];
  investmentRequired: number;
}

export interface GrowthObjective {
  description: string;
  timeline: string;
  targetMetric: string;
  targetValue: number;
  requiredInvestment: number;
}

export interface ExpansionPlan {
  type: 'Novos Campos' | 'Nova Localização' | 'Novos Serviços' | 'Franquias';
  description: string;
  timeline: string;
  investmentRequired: number;
  expectedRevenue: number;
}

export interface TargetMarket {
  id: string;
  name: string;
  ageRange: { min: number; max: number };
  income: 'Baixa' | 'Média' | 'Alta';
  frequency: 'Diária' | 'Semanal' | 'Quinzenal' | 'Mensal';
  priceElasticity: number; // -1 a 1
  marketSize: number; // pessoas
  penetrationRate: number; // % esperada
}

export interface PricingStrategy {
  fieldRental: PricingModel[];
  membership: MembershipTier[];
  soccerSchool: SoccerSchoolPricing[];
  events: EventPricing[];
  merchandise: MerchandisePricing[];
}

export interface PricingModel {
  fieldType: string;
  timeSlot: 'Manhã' | 'Tarde' | 'Noite' | 'Fim de Semana';
  basePrice: number;
  discounts: DiscountRule[];
  seasonalFactors: SeasonalPricing[];
}

export interface MembershipTier {
  id: string;
  name: string;
  monthlyFee: number;
  benefits: string[];
  hoursIncluded: number;
  maxMembers: number;
  expectedMembers: number;
}

// Recursos humanos detalhados
export interface HumanResourcesData {
  staff: StaffMember[];
  payrollBurden: PayrollBurden;
  trainingBudget: number;
  benefitsPackage: BenefitsPackage;
}

export interface StaffMember {
  id: string;
  position: 'Técnico' | 'Preparador Físico' | 'Médico' | 'Fisioterapeuta' | 'Administrador' | 'Recepcionista' | 'Segurança' | 'Limpeza' | 'Manutenção';
  level: 'Júnior' | 'Pleno' | 'Sênior';
  workload: 'Integral' | 'Meio Período' | 'Freelancer';
  monthlySalary: number;
  startDate?: Date;
  contractType: 'CLT' | 'PJ' | 'Estagiário' | 'Voluntário';
}

export interface PayrollBurden {
  inss: number; // %
  fgts: number; // %
  vacation: number; // %
  thirteenthSalary: number; // %
  other: number; // %
  total: number; // %
}

// Receitas expandidas específicas para clubes
export interface DetailedRevenue {
  fieldRental: FieldRentalRevenue;
  membership: MembershipRevenue;
  soccerSchool: SoccerSchoolRevenue;
  sponsorship: SponsorshipRevenue;
  merchandise: MerchandiseRevenue;
  events: EventsRevenue;
  foodBeverage: FoodBeverageRevenue;
  broadcastRights?: BroadcastRevenue;
  playerTransfers?: PlayerTransferRevenue;
  ticketing?: TicketingRevenue;
  socialClub?: SocialClubRevenue;
  other: OtherRevenue[];
  total: number;
}

export interface FieldRentalRevenue {
  regularRentals: number;
  tournaments: number;
  corporateEvents: number;
  seasonalAdjustment: number;
  total: number;
}

export interface SponsorshipRevenue {
  mainSponsor?: number;
  jerseySponsors: number;
  facilityNaming: number;
  equipmentSponsors: number;
  eventSponsors: number;
  digitalSponsors: number;
  total: number;
}

export interface SoccerSchoolRevenue {
  monthlyTuition: number;
  enrollmentFees: number;
  camps: number;
  privateClasses: number;
  tournaments: number;
  total: number;
}

export interface BroadcastRevenue {
  tvRights: number;
  streamingRights: number;
  radioRights: number;
  internationalRights: number;
  total: number;
}

export interface PlayerTransferRevenue {
  transferFees: number;
  loanFees: number;
  solidarityMechanism: number;
  trainingCompensation: number;
  total: number;
}

export interface TicketingRevenue {
  seasonTickets: number;
  singleGameTickets: number;
  vipBoxes: number;
  groupSales: number;
  total: number;
}

export interface SocialClubRevenue {
  membershipFees: number;
  socialEvents: number;
  facilityRental: number;
  other: number;
  total: number;
}

export interface MembershipRevenue {
  monthlyFees: number;
  annualFees: number;
  initationFees: number;
  familyPackages: number;
  corporateMembers: number;
  total: number;
}

export interface EventsRevenue {
  corporateEvents: number;
  privateParties: number;
  tournaments: number;
  camps: number;
  other: number;
  total: number;
}

export interface MerchandiseRevenue {
  jerseys: number;
  accessories: number;
  souvenirs: number;
  equipment: number;
  total: number;
}

export interface FoodBeverageRevenue {
  restaurant: number;
  bar: number;
  catering: number;
  vending: number;
  total: number;
}

export interface OtherRevenue {
  source: string;
  amount: number;
  category: string;
}

// Custos operacionais expandidos
export interface DetailedOperationalCosts {
  personnel: PersonnelCosts;
  facilities: FacilityCosts;
  utilities: UtilityCosts;
  marketing: MarketingCosts;
  administrative: AdministrativeCosts;
  insurance: InsuranceCosts;
  regulatory: RegulatoryCosts;
  medical: MedicalCosts;
  transportation: TransportationCosts;
  hospitality: HospitalityCosts;
  equipment: EquipmentCosts;
  maintenance: MaintenanceCosts;
  technology: TechnologyCosts;
  total: number;
}

export interface PersonnelCosts {
  technicalStaff: TechnicalStaffCosts;
  players: PlayerCosts;
  administrativeStaff: AdministrativeStaffCosts;
  supportStaff: SupportStaffCosts;
  total: number;
}

export interface TechnicalStaffCosts {
  headCoach: number;
  assistantCoaches: number;
  physicalTrainer: number;
  goalkeeper: number;
  analyst: number;
  other: number;
  total: number;
}

export interface PlayerCosts {
  salaries: number;
  bonuses: number;
  benefits: number;
  laborCharges: number;
  medicalInsurance: number;
  total: number;
}

export interface AdministrativeStaffCosts {
  management: number;
  accounting: number;
  legal: number;
  hr: number;
  marketing: number;
  other: number;
  total: number;
}

export interface SupportStaffCosts {
  security: number;
  cleaning: number;
  maintenance: number;
  reception: number;
  other: number;
  total: number;
}

export interface FacilityCosts {
  rent: number;
  propertyTax: number;
  condominiumFees: number;
  fieldMaintenance: number;
  buildingMaintenance: number;
  landscaping: number;
  total: number;
}

export interface UtilityCosts {
  electricity: number;
  water: number;
  gas: number;
  internet: number;
  phone: number;
  waste: number;
  total: number;
}

export interface MarketingCosts {
  advertising: number;
  digitalMarketing: number;
  events: number;
  materials: number;
  sponsorshipActivation: number;
  total: number;
}

export interface AdministrativeCosts {
  accounting: number;
  legal: number;
  consulting: number;
  banking: number;
  office: number;
  travel: number;
  total: number;
}

export interface InsuranceCosts {
  liability: number;
  property: number;
  players: number;
  equipment: number;
  total: number;
}

export interface RegulatoryCosts {
  licenses: number;
  federationFees: number;
  certifications: number;
  inspections: number;
  total: number;
}

export interface MedicalCosts {
  teamDoctor: number;
  physiotherapy: number;
  supplements: number;
  medicalExams: number;
  treatments: number;
  total: number;
}

export interface TransportationCosts {
  teamTransport: number;
  accommodation: number;
  meals: number;
  fuel: number;
  vehicleMaintenance: number;
  total: number;
}

export interface HospitalityCosts {
  guestMeals: number;
  entertainment: number;
  gifts: number;
  events: number;
  total: number;
}

export interface EquipmentCosts {
  sportingGoods: number;
  uniformes: number;
  trainingEquipment: number;
  fieldEquipment: number;
  safety: number;
  total: number;
}

export interface MaintenanceCosts {
  preventive: number;
  corrective: number;
  supplies: number;
  contracts: number;
  total: number;
}

export interface TechnologyCosts {
  software: number;
  hardware: number;
  telecommunications: number;
  support: number;
  total: number;
}

// KPIs estratégicos específicos
export interface StrategicKPIs {
  financial: FinancialKPIs;
  operational: OperationalKPIs;
  customer: CustomerKPIs;
  growth: GrowthKPIs;
  sustainability: SustainabilityKPIs;
}

export interface FinancialKPIs {
  revenueGrowthRate: KPIMetric;
  profitMargin: KPIMetric;
  cashFlowMargin: KPIMetric;
  returnOnAssets: KPIMetric;
  returnOnEquity: KPIMetric;
  debtToEquityRatio: KPIMetric;
  breakEvenPoint: KPIMetric;
}

export interface OperationalKPIs {
  fieldUtilizationRate: KPIMetric;
  averageRevenuePerField: KPIMetric;
  membershipRetentionRate: KPIMetric;
  staffProductivity: KPIMetric;
  maintenanceCostRatio: KPIMetric;
  energyEfficiency: KPIMetric;
}

export interface CustomerKPIs {
  customerSatisfactionScore: KPIMetric;
  netPromoterScore: KPIMetric;
  averageCustomerLifetime: KPIMetric;
  membershipGrowthRate: KPIMetric;
  churnRate: KPIMetric;
  averageRevenuePerCustomer: KPIMetric;
}

// Análise de viabilidade expandida
export interface ComprehensiveViabilityAnalysis {
  financialViability: FinancialViabilityAnalysis;
  marketViability: MarketViabilityAnalysis;
  operationalViability: OperationalViabilityAnalysis;
  strategicViability: StrategicViabilityAnalysis;
  riskAnalysis: RiskAnalysis;
  sensitivityAnalysis: EnhancedSensitivityAnalysis;
}

export interface FinancialViabilityAnalysis {
  npv: number;
  irr: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  modifiedIRR: number;
  discountedPayback: number;
  valueAtRisk: number;
  expectedValue: number;
}

export interface MarketViabilityAnalysis {
  marketSize: number;
  marketGrowthRate: number;
  competitivPosition: 'Líder' | 'Desafiante' | 'Seguidor' | 'Nicho';
  marketShareProjection: number;
  customerDemandForecast: CustomerDemandForecast[];
  competitivePressure: 'Baixa' | 'Média' | 'Alta';
}

export interface RiskAnalysis {
  risks: IdentifiedRisk[];
  overallRiskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
}

export interface IdentifiedRisk {
  id: string;
  category: 'Financeiro' | 'Operacional' | 'Estratégico' | 'Regulatório' | 'Ambiental';
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  riskScore: number; // probability * impact
  timeframe: 'Curto Prazo' | 'Médio Prazo' | 'Longo Prazo';
}

// Sistema de campos editáveis
export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date' | 'boolean' | 'currency' | 'percentage';
  category: 'revenue' | 'cost' | 'asset' | 'liability' | 'kpi' | 'other';
  value: any;
  formula?: string; // Para campos calculados
  unit?: string;
  validation?: FieldValidation;
  isEditable: boolean;
  isVisible: boolean;
  dependencies?: string[]; // IDs de outros campos
  description?: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customRule?: string;
}

// Fórmulas e cálculos detalhados
export interface CalculationFormula {
  id: string;
  name: string;
  description: string;
  formula: string;
  variables: FormulaVariable[];
  category: 'financial' | 'operational' | 'strategic';
  resultUnit: string;
}

export interface FormulaVariable {
  name: string;
  description: string;
  type: 'input' | 'calculated' | 'constant';
  defaultValue?: number;
  source?: string; // Campo de origem
}

// Modelos de projeção avançados
export interface AdvancedProjectionModel {
  name: string;
  type: 'Linear' | 'Exponencial' | 'Logarítmica' | 'S-Curve' | 'Monte Carlo';
  parameters: ModelParameters;
  scenarios: ProjectionScenario[];
  confidence: number; // 0-1
}

export interface ModelParameters {
  [key: string]: number | string | boolean;
}

export interface ProjectionScenario {
  name: string;
  probability: number;
  growthRate: number;
  marketConditions: 'Otimista' | 'Realista' | 'Pessimista';
  assumptions: string[];
}

// Tipos existentes mantidos com algumas expansões...
export interface ClubData {
  name: string;
  fieldTypes: FieldType[];
  numFields: number;
  selectedMarket: string;
  strategicData?: StrategicInputData;
  customFields?: CustomField[];
}

export interface FieldType {
  name: string;
  hourlyRate: number;
  dailyHours: number;
  occupancy: number;
}

// Tipos financeiros expandidos
export interface FinancialProjection {
  year: number;
  revenue: DetailedRevenue;
  costs: DetailedOperationalCosts;
  taxes: Taxes;
  cashFlow: CashFlow;
  metrics: FinancialMetrics;
  kpis?: StrategicKPIs;
}

export interface Revenue {
  fieldRevenue: number;
  tournaments: number;
  cafeteria: number;
  events: number;
  sponsorship: number;
  total: number;
  gross: number;
  net: number;
}

export interface Costs {
  variable: VariableCosts;
  fixed: FixedCosts;
  total: number;
}

export interface VariableCosts {
  utilities: number;
  maintenance: number;
  supplies: number;
  total: number;
}

export interface FixedCosts {
  salaries: number;
  rent: number;
  insurance: number;
  marketing: number;
  depreciation: number;
  total: number;
}

export interface Taxes {
  corporateTax: number;
  vat: number;
  socialContributions: number;
  municipalTaxes: number;
  total: number;
}

export interface CashFlow {
  operational: number;
  investment: number;
  financing: number;
  net: number;
  accumulated: number;
}

export interface FinancialMetrics {
  grossMargin: number;
  netMargin: number;
  ebitda: number;
  ebit: number;
  netProfit: number;
  roa: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
}

// Tipos de análise de viabilidade expandidos
export interface InvestmentAnalysis {
  initialInvestment: InvestmentBreakdown;
  projections: FinancialProjection[];
  valuation: ValuationMetrics;
  sensitivity: SensitivityAnalysis;
  scenarios: ScenarioAnalysis;
  comprehensiveAnalysis?: ComprehensiveViabilityAnalysis;
}

export interface InvestmentBreakdown {
  fieldConstruction: number;
  equipment: number;
  facilityCosts: number;
  workingCapital: number;
  licensing: number;
  total: number;
}

export interface ValuationMetrics {
  npv: number;
  irr: number;
  roi: number;
  paybackPeriod: number;
  breakEvenPoint: number;
  enterpriseValue: number;
  terminalValue: number;
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  results: SensitivityResult[];
}

export interface EnhancedSensitivityAnalysis extends SensitivityAnalysis {
  tornadoChart: TornadoChartData[];
  spiderChart: SpiderChartData[];
  monteCarlo: MonteCarloAnalysis;
}

export interface SensitivityVariable {
  name: string;
  baseValue: number;
  range: number[];
  impact: number[];
}

export interface SensitivityResult {
  variable: string;
  changePercent: number;
  newValue: number;
  npvImpact: number;
}

export interface ScenarioAnalysis {
  optimistic: FinancialProjection[];
  realistic: FinancialProjection[];
  pessimistic: FinancialProjection[];
  monteCarloResults: MonteCarloResult[];
}

export interface MonteCarloResult {
  iteration: number;
  npv: number;
  irr: number;
  payback: number;
}

// Tipos de KPI expandidos
export interface KPIData {
  revenue: KPIMetric;
  profitability: KPIMetric;
  efficiency: KPIMetric;
  financial: KPIMetric;
}

export interface KPIMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
  benchmark: number;
  formula?: string;
  lastUpdate?: Date;
}

// Tipos de exportação expandidos
export interface ExportData {
  summary: Record<string, any>;
  dre: FinancialProjection[];
  cashFlow: CashFlow[];
  kpis: KPIData;
  sensitivity: SensitivityAnalysis;
  strategicAnalysis?: ComprehensiveViabilityAnalysis;
  customFields?: CustomField[];
  timestamp: string;
}

// Tipos de configuração expandidos
export interface AppState {
  club: ClubData;
  market: Market;
  projections: FinancialProjection[];
  analysis: InvestmentAnalysis;
  kpis: KPIData;
  strategicKPIs?: StrategicKPIs;
  customFields?: CustomField[];
  calculationFormulas?: CalculationFormula[];
}

// Tipos de formulário expandidos
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'checkbox' | 'currency' | 'percentage';
  value: any;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  category?: string;
  formula?: string;
  dependencies?: string[];
}

// Novos tipos auxiliares
export interface TechnologyCosts {
  category: 'Software' | 'Hardware' | 'Website' | 'App' | 'Sistemas';
  description: string;
  cost: number;
  monthlyFee?: number;
  licenseYears?: number;
}

export interface VehicleCosts {
  type: 'Van' | 'Ônibus' | 'Carro' | 'Motocicleta';
  purpose: string;
  cost: number;
  monthlyMaintenance: number;
}

export interface LicensingCosts {
  type: 'Federação' | 'Município' | 'Estado' | 'Bombeiros' | 'Anvisa' | 'Outros';
  description: string;
  cost: number;
  renewalPeriod: number; // anos
}

export interface BrandingCosts {
  category: 'Logo' | 'Uniformes' | 'Material Gráfico' | 'Website' | 'Marketing Digital';
  description: string;
  cost: number;
}

export interface WorkingCapitalBreakdown {
  cashReserve: number;
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  total: number;
}

export interface ExistingAssets {
  cash: number;
  equipment: number;
  property: number;
  investments: number;
  other: number;
  total: number;
}

export interface ExistingLiabilities {
  loans: number;
  accountsPayable: number;
  taxes: number;
  other: number;
  total: number;
}

export interface DiscountRule {
  type: 'Volume' | 'Fidelidade' | 'Horário' | 'Sazonal' | 'Estudante' | 'Corporativo';
  condition: string;
  discountPercent: number;
  validUntil?: Date;
}

export interface SeasonalPricing {
  period: string;
  factor: number; // multiplicador do preço base
}

export interface SoccerSchoolPricing {
  category: 'Infantil' | 'Juvenil' | 'Adulto' | 'Feminino' | 'Especial';
  ageRange: { min: number; max: number };
  monthlyFee: number;
  enrollmentFee: number;
  maxStudents: number;
}

export interface EventPricing {
  type: 'Torneio' | 'Festa' | 'Corporativo' | 'Casamento' | 'Aniversário';
  basePrice: number;
  pricePerPerson?: number;
  duration: number; // horas
  capacity: number;
}

export interface MerchandisePricing {
  category: 'Uniformes' | 'Acessórios' | 'Equipamentos' | 'Souvenirs';
  averageTicket: number;
  marginPercent: number;
  monthlyVolume: number;
}

export interface BenefitsPackage {
  healthInsurance: number;
  mealVoucher: number;
  transportVoucher: number;
  lifeInsurance: number;
  other: number;
  total: number;
}

export interface MembershipRevenue {
  basicTier: number;
  premiumTier: number;
  vipTier: number;
  corporateMemberships: number;
  total: number;
}

export interface MerchandiseRevenue {
  uniformes: number;
  acessorios: number;
  equipamentos: number;
  souvenirs: number;
  total: number;
}

export interface EventsRevenue {
  tournaments: number;
  corporateEvents: number;
  socialEvents: number;
  rentals: number;
  total: number;
}

export interface FoodBeverageRevenue {
  restaurant: number;
  bar: number;
  snackBar: number;
  vending: number;
  catering: number;
  total: number;
}

export interface BroadcastRevenue {
  tv: number;
  streaming: number;
  radio: number;
  total: number;
}

export interface PlayerTransferRevenue {
  sales: number;
  loans: number;
  commissions: number;
  total: number;
}

export interface OtherRevenue {
  source: string;
  amount: number;
  frequency: 'Mensal' | 'Trimestral' | 'Anual' | 'Único';
}

export interface EquipmentMaintenance {
  fieldsEquipment: number;
  sportsEquipment: number;
  technology: number;
  vehicles: number;
  other: number;
  total: number;
}

export interface UtilityCosts {
  electricity: number;
  water: number;
  gas: number;
  internet: number;
  phone: number;
  waste: number;
  total: number;
}

export interface InsuranceCosts {
  property: number;
  liability: number;
  equipmentInsurance: number;
  workersCompensation: number;
  other: number;
  total: number;
}

export interface MarketingCosts {
  digitalMarketing: number;
  traditionalMedia: number;
  events: number;
  sponsorships: number;
  materials: number;
  total: number;
}

export interface AdministrativeCosts {
  accounting: number;
  legal: number;
  consulting: number;
  software: number;
  officeSupplies: number;
  banking: number;
  total: number;
}

export interface RegulatoryCosts {
  licenses: number;
  inspections: number;
  compliance: number;
  taxes: number;
  other: number;
  total: number;
}

export interface OtherCosts {
  category: string;
  amount: number;
  frequency: 'Mensal' | 'Trimestral' | 'Anual' | 'Único';
}

export interface GrowthKPIs {
  membershipGrowth: KPIMetric;
  revenueGrowth: KPIMetric;
  marketExpansion: KPIMetric;
  facilityExpansion: KPIMetric;
}

export interface SustainabilityKPIs {
  energyEfficiency: KPIMetric;
  waterUsage: KPIMetric;
  wasteReduction: KPIMetric;
  carbonFootprint: KPIMetric;
}

export interface OperationalViabilityAnalysis {
  locationScore: number;
  infrastructureScore: number;
  staffingScore: number;
  operationalEfficiency: number;
  scalabilityScore: number;
  overallScore: number;
}

export interface StrategicViabilityAnalysis {
  competitiveAdvantage: string[];
  marketPosition: string;
  swotAnalysis: SWOTAnalysis;
  strategicFit: number;
  longTermSustainability: number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CustomerDemandForecast {
  period: string;
  demandLevel: 'Baixa' | 'Média' | 'Alta';
  estimatedVolume: number;
  confidence: number;
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  cost: number;
  effectiveness: number; // 0-1
  timeframe: string;
}

export interface ContingencyPlan {
  trigger: string;
  actions: string[];
  resources: number;
  responsibleParty: string;
}

export interface TornadoChartData {
  variable: string;
  lowImpact: number;
  highImpact: number;
  range: number;
}

export interface SpiderChartData {
  variable: string;
  baseCase: number;
  sensitivity: number[];
}

export interface MonteCarloAnalysis {
  iterations: number;
  results: MonteCarloResult[];
  statistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    percentiles: { p5: number; p25: number; p75: number; p95: number };
  };
}

// Tipos de gráfico expandidos
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    x?: any;
    y?: any;
  };
}

// Tipos de navegação
export interface NavItem {
  name: string;
  href: string;
  icon: any; // React component type
  badge?: string | number;
  description?: string;
}

// Tipos de notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos de API (caso futuro)
export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos utilitários
export type Currency = 'R$' | '€' | 'AED';
export type Period = 'monthly' | 'quarterly' | 'yearly';
export type TrendDirection = 'up' | 'down' | 'stable';
export type ComparisonPeriod = '1m' | '3m' | '6m' | '1y';

// Helpers de tipo
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>; 
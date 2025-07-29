import type {
  Market,
  FootballField,
  StaffMember,
  DetailedOperationalCosts,
  DetailedRevenue,
  StrategicKPIs,
} from '@/types';

/**
 * Calcula receita detalhada de aluguel de campos
 */
export function calculateFieldRentalRevenue(
  fields: FootballField[],
  market: Market,
  seasonalFactors: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
): { monthly: number; annual: number; byField: Record<string, number> } {
  const byField: Record<string, number> = {};
  let totalMonthly = 0;

  fields.forEach(field => {
    const hoursPerDay = market.hoursPerDay;
    const daysPerMonth = 30;
    const availableHours = hoursPerDay * daysPerMonth;
    const utilizedHours = availableHours * field.utilizationRate;
    const monthlyRevenue = utilizedHours * field.hourlyRate;
    
    byField[field.id] = monthlyRevenue;
    totalMonthly += monthlyRevenue;
  });

  // Aplicar fatores sazonais para receita anual
  const annualRevenue = seasonalFactors.reduce((total, factor) => 
    total + (totalMonthly * factor), 0
  );

  return {
    monthly: totalMonthly,
    annual: annualRevenue,
    byField
  };
}

/**
 * Calcula receitas de escolinha de futebol
 */
export function calculateSoccerSchoolRevenue(
  students: number,
  monthlyTuition: number,
  retentionRate: number = 0.9,
  growthRate: number = 0.05,
  years: number = 12
): number[] {
  const revenues: number[] = [];
  let currentStudents = students;

  for (let year = 0; year < years; year++) {
    const yearlyRevenue = currentStudents * monthlyTuition * 12;
    revenues.push(yearlyRevenue);
    
    // Aplicar crescimento e retenção
    currentStudents = Math.round(currentStudents * retentionRate * (1 + growthRate));
  }

  return revenues;
}

/**
 * Calcula receitas de patrocínio baseado em exposição e performance
 */
export function calculateSponsorshipRevenue(
  baseValue: number,
  exposureMultiplier: number = 1,
  performanceBonus: number = 0,
  contractYears: number = 3,
  inflationRate: number = 0.05
): number[] {
  const revenues: number[] = [];
  let currentValue = baseValue * exposureMultiplier + performanceBonus;

  for (let year = 0; year < contractYears; year++) {
    revenues.push(currentValue);
    currentValue *= (1 + inflationRate);
  }

  return revenues;
}

/**
 * Calcula custos operacionais detalhados do clube
 */
export function calculateDetailedOperationalCosts(
  fields: FootballField[],
  staff: StaffMember[],
  market: Market
): DetailedOperationalCosts {
  // Custos de pessoal
  const totalSalaries = staff.reduce((sum, member) => sum + member.monthlySalary * 12, 0);
  const socialCharges = totalSalaries * market.salaryBurden;

  // Separação hipotética de custos - em um caso real, os dados de staff teriam a categoria
  const administrativeStaffCosts = {
    management: totalSalaries * 0.4, // 40% para admin
    accounting: 0, legal: 0, hr: 0, marketing: 0, communication: 0, finance: 0, operations: 0, commercial: 0, other: 0,
    total: totalSalaries * 0.4 + socialCharges * 0.4,
  };
  
  const supportStaffCosts = {
    security: totalSalaries * 0.6, // 60% para suporte
    cleaning: 0, maintenance: 0, reception: 0, kitManager: 0, groundsKeeper: 0, driver: 0, cook: 0, other: 0,
    total: totalSalaries * 0.6 + socialCharges * 0.6,
  };

  const personnel = {
    technicalStaff: { headCoach: 0, assistantCoaches: 0, physicalTrainer: 0, goalkeeper: 0, analyst: 0, scout: 0, coordinator: 0, interpreter: 0, other: 0, total: 0 },
    players: { salaries: 0, bonuses: 0, benefits: 0, laborCharges: 0, medicalInsurance: 0, imageRights: 0, performanceBonuses: 0, loyaltyBonuses: 0, thirteenthSalary: 0, vacation: 0, total: 0 },
    administrativeStaff: administrativeStaffCosts,
    supportStaff: supportStaffCosts,
    total: totalSalaries + socialCharges
  };

  // Custos das instalações
  const fieldMaintenance = fields.reduce((sum, field) => sum + field.maintenanceCost * 12, 0);
  const cleaning = fields.length * 800 * 12; // R$ 800/campo/mês
  const security = 2000 * 12; // R$ 2000/mês
  const landscaping = fields.length * 300 * 12; // R$ 300/campo/mês
  const repairs = fieldMaintenance * 0.3; // 30% da manutenção

  const facilitiesCosts = {
    maintenance: fieldMaintenance,
    cleaning,
    security,
    landscaping,
    repairs,
    total: fieldMaintenance + cleaning + security + landscaping + repairs
  };

  // Custos de utilidades
  const electricity = fields.length * 800 * 12; // R$ 800/campo/mês
  const water = fields.length * 300 * 12;
  const gas = 200 * 12;
  const internet = 150 * 12;
  const phone = 100 * 12;
  const waste = fields.length * 100 * 12;

  const utilities = {
    electricity,
    water,
    gas,
    internet,
    phone,
    waste,
    total: electricity + water + gas + internet + phone + waste
  };

  // Seguros
  const property = 15000; // Anual
  const liability = 8000;
  const equipmentInsurance = 5000;
  const workersCompensation = totalSalaries * 0.02;

  const insurance = {
    property,
    liability,
    equipmentInsurance,
    workersCompensation,
    other: 3000,
    total: property + liability + equipmentInsurance + workersCompensation + 3000
  };

  // Marketing
  const digitalMarketing = 3000 * 12;
  const traditionalMedia = 2000 * 12;
  const events = 15000;
  const sponsorships = 5000;
  const materials = 3000;

  const marketing = {
    digitalMarketing,
    traditionalMedia,
    events,
    sponsorships,
    materials,
    total: digitalMarketing + traditionalMedia + events + sponsorships + materials
  };

  // Administrativo
  const accounting = 2000 * 12;
  const legal = 1000 * 12;
  const consulting = 5000;
  const software = 500 * 12;
  const officeSupplies = 300 * 12;
  const banking = 100 * 12;

  const administrative = {
    accounting,
    legal,
    consulting,
    software,
    officeSupplies,
    banking,
    total: accounting + legal + consulting + software + officeSupplies + banking
  };

  // Manutenção de equipamentos
  const fieldsEquipment = fieldMaintenance * 0.2;
  const sportsEquipment = 5000;
  const technology = 3000;
  const vehicles = 8000;

  const equipment = {
    fieldsEquipment,
    sportsEquipment,
    technology,
    vehicles,
    other: 2000,
    total: fieldsEquipment + sportsEquipment + technology + vehicles + 2000
  };

  // Regulatório
  const licenses = 5000;
  const inspections = 2000;
  const compliance = 3000;
  const taxes = 8000;

  const regulatory = {
    licenses,
    inspections,
    compliance,
    taxes,
    other: 2000,
    total: licenses + inspections + compliance + taxes + 2000
  };

  const totalCosts = personnel.total + facilitiesCosts.total + utilities.total + 
                    insurance.total + marketing.total + administrative.total + 
                    equipment.total + regulatory.total;

  return {
    personnel,
    facilities: facilitiesCosts,
    equipment,
    utilities,
    insurance,
    marketing,
    administrative,
    regulatory,
    medical: { total: 0, teamDoctor: 0, physiotherapy: 0, supplements: 0, medicalExams: 0, treatments: 0 },
    transportation: { total: 0, teamTransport: 0, accommodation: 0, meals: 0, fuel: 0, vehicleMaintenance: 0 },
    hospitality: { total: 0, guestMeals: 0, entertainment: 0, gifts: 0, events: 0 },
    maintenance: { total: 0, preventive: 0, corrective: 0, supplies: 0, contracts: 0 },
    technology: { total: 0, software: 0, hardware: 0, telecommunications: 0, support: 0 },
    other: [],
    total: totalCosts
  };
}

/**
 * Calcula KPIs estratégicos específicos para clubes
 */
export function calculateStrategicKPIs(
  revenue: DetailedRevenue,
  costs: DetailedOperationalCosts,
  fields: FootballField[],
  members: number = 0
): StrategicKPIs {
  const totalRevenue = revenue.total;
  const totalCosts = costs.total;
  const netProfit = totalRevenue - totalCosts;

  // KPIs Financeiros
  const financial = {
    revenueGrowthRate: { name: 'Taxa de Crescimento da Receita', value: 0.15, unit: '%', trend: 'up' as const, target: 0.15, benchmark: 0.12 },
    profitMargin: { name: 'Margem de Lucro', value: netProfit / totalRevenue, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.15 },
    cashFlowMargin: { name: 'Margem de Fluxo de Caixa', value: (netProfit * 0.9) / totalRevenue, unit: '%', trend: 'up' as const, target: 0.18, benchmark: 0.12 },
    returnOnAssets: { name: 'Retorno sobre Ativos', value: 0.25, unit: '%', trend: 'up' as const, target: 0.25, benchmark: 0.20 },
    returnOnEquity: { name: 'Retorno sobre Patrimônio', value: 0.30, unit: '%', trend: 'up' as const, target: 0.30, benchmark: 0.25 },
    debtToEquityRatio: { name: 'Dívida/Patrimônio', value: 0.4, unit: 'x', trend: 'down' as const, target: 0.3, benchmark: 0.5 },
    breakEvenPoint: { name: 'Ponto de Equilíbrio', value: 18, unit: 'meses', trend: 'down' as const, target: 18, benchmark: 24 }
  };

  // KPIs Operacionais
  const avgUtilization = fields.reduce((sum, field) => sum + field.utilizationRate, 0) / fields.length;
  const avgRevenuePerField = revenue.fieldRental.total / fields.length;

  const operational = {
    fieldUtilizationRate: { name: 'Taxa de Utilização dos Campos', value: avgUtilization, unit: '%', trend: 'up' as const, target: 0.75, benchmark: 0.65 },
    averageRevenuePerField: { name: 'Receita Média por Campo', value: avgRevenuePerField / 12, unit: 'R$/mês', trend: 'up' as const, target: 15000, benchmark: 12000 },
    membershipRetentionRate: { name: 'Taxa de Retenção de Membros', value: 0.85, unit: '%', trend: 'up' as const, target: 0.90, benchmark: 0.80 },
    staffProductivity: { name: 'Produtividade da Equipe', value: totalRevenue / costs.personnel.total, unit: 'x', trend: 'up' as const, target: 3.0, benchmark: 2.5 },
    maintenanceCostRatio: { name: 'Custo de Manutenção / Receita', value: costs.facilities.maintenance / totalRevenue, unit: '%', trend: 'down' as const, target: 0.08, benchmark: 0.12 },
    energyEfficiency: { name: 'Eficiência Energética', value: 0.75, unit: '%', trend: 'up' as const, target: 0.80, benchmark: 0.70 }
  };

  // KPIs de Clientes
  const customer = {
    customerSatisfactionScore: { name: 'Satisfação do Cliente', value: 8.5, unit: '/10', trend: 'up' as const, target: 9.0, benchmark: 8.0 },
    netPromoterScore: { name: 'Net Promoter Score', value: 65, unit: 'pontos', trend: 'up' as const, target: 70, benchmark: 50 },
    averageCustomerLifetime: { name: 'Tempo Médio de Permanência', value: 24, unit: 'meses', trend: 'up' as const, target: 30, benchmark: 18 },
    membershipGrowthRate: { name: 'Crescimento de Membros', value: 0.10, unit: '%/mês', trend: 'up' as const, target: 0.12, benchmark: 0.08 },
    churnRate: { name: 'Taxa de Cancelamento', value: 0.05, unit: '%/mês', trend: 'down' as const, target: 0.03, benchmark: 0.08 },
    averageRevenuePerCustomer: { name: 'Receita Média por Cliente', value: totalRevenue / Math.max(members, 100), unit: 'R$/ano', trend: 'up' as const, target: 2000, benchmark: 1500 }
  };

  // KPIs de Crescimento
  const growth = {
    membershipGrowth: { name: 'Crescimento de Membros', value: 0.15, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.10 },
    revenueGrowth: { name: 'Crescimento da Receita', value: 0.18, unit: '%', trend: 'up' as const, target: 0.20, benchmark: 0.12 },
    marketExpansion: { name: 'Expansão de Mercado', value: 0.05, unit: '%', trend: 'up' as const, target: 0.10, benchmark: 0.03 },
    facilityExpansion: { name: 'Expansão de Instalações', value: 0, unit: 'novos campos', trend: 'stable' as const, target: 1, benchmark: 0 }
  };

  // KPIs de Sustentabilidade
  const sustainability = {
    energyEfficiency: { name: 'Eficiência Energética', value: 0.78, unit: '%', trend: 'up' as const, target: 0.85, benchmark: 0.70 },
    waterUsage: { name: 'Uso de Água', value: 150, unit: 'm³/campo/mês', trend: 'down' as const, target: 120, benchmark: 180 },
    wasteReduction: { name: 'Redução de Resíduos', value: 0.30, unit: '%', trend: 'up' as const, target: 0.50, benchmark: 0.20 },
    carbonFootprint: { name: 'Pegada de Carbono', value: 8.5, unit: 'tCO2/ano', trend: 'down' as const, target: 6.0, benchmark: 12.0 }
  };

  return {
    financial,
    operational,
    customer,
    growth,
    sustainability
  };
} 
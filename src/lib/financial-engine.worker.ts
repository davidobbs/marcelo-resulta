import { FinancialVariable, FinancialMetrics, FinancialProjection, ValidationResult } from '@/types';

let variables: FinancialVariable[] = [];

const calculateMetrics = (): FinancialMetrics => {
  const totalRevenue = variables.filter(v => v.category === 'revenue').reduce((acc, v) => acc + v.value, 0);
  const totalCosts = variables.filter(v => v.category === 'cost').reduce((acc, v) => acc + v.value, 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  return { totalRevenue, totalCosts, netProfit, profitMargin, breakEvenPoint: 0, roi: 0 };
};

const generateProjections = (months: number): FinancialProjection[] => {
  // Lógica de projeção simplificada
  return Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    revenue: 100000 + i * 10000,
    costs: 50000 + i * 5000,
    profit: 50000 + i * 5000,
    cumulativeProfit: (i + 1) * 50000 + (i * (i + 1) / 2) * 5000
  }));
};

const validateData = (): ValidationResult => {
  return { isValid: true, errors: [] };
};

self.onmessage = (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case 'recalculate':
      const metrics = calculateMetrics();
      const projections = generateProjections(12);
      const validation = validateData();
      self.postMessage({ action: 'recalculate_result', payload: { variables, metrics, projections, validation } });
      break;
    case 'add_variable':
      variables.push(payload);
      break;
    case 'update_variable':
      variables = variables.map(v => v.id === payload.id ? { ...v, value: payload.value } : v);
      break;
    case 'get_all_variables':
      self.postMessage({ action: 'get_all_variables_result', payload: variables });
      break;
    case 'calculate_aggregated_metrics':
      self.postMessage({ action: 'calculate_aggregated_metrics_result', payload: calculateMetrics() });
      break;
    case 'generate_projections':
      self.postMessage({ action: 'generate_projections_result', payload: generateProjections(payload.months) });
      break;
    case 'validate_data':
      self.postMessage({ action: 'validate_data_result', payload: validateData() });
      break;
  }
};
import { FinancialVariable } from '@/types';

export class FinancialEngine {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('./financial-engine.worker.ts', import.meta.url));
  }

  recalculate(force: boolean = false): Promise<any> {
    return new Promise((resolve) => {
      this.worker.onmessage = (event) => {
        if (event.data.action === 'recalculate_result') {
          resolve(event.data.payload);
        }
      };
      this.worker.postMessage({ action: 'recalculate', payload: { force } });
    });
  }

  addVariable(variable: FinancialVariable) {
    this.worker.postMessage({ action: 'add_variable', payload: variable });
  }

  updateVariable(id: string, value: number) {
    this.worker.postMessage({ action: 'update_variable', payload: { id, value } });
  }

  getAllVariables(): Promise<FinancialVariable[]> {
    return new Promise((resolve) => {
      this.worker.onmessage = (event) => {
        if (event.data.action === 'get_all_variables_result') {
          resolve(event.data.payload);
        }
      };
      this.worker.postMessage({ action: 'get_all_variables' });
    });
  }

  calculateAggregatedMetrics(): Promise<any> {
    return new Promise((resolve) => {
      this.worker.onmessage = (event) => {
        if (event.data.action === 'calculate_aggregated_metrics_result') {
          resolve(event.data.payload);
        }
      };
      this.worker.postMessage({ action: 'calculate_aggregated_metrics' });
    });
  }

  generateProjections(months: number): Promise<any> {
    return new Promise((resolve) => {
      this.worker.onmessage = (event) => {
        if (event.data.action === 'generate_projections_result') {
          resolve(event.data.payload);
        }
      };
      this.worker.postMessage({ action: 'generate_projections', payload: { months } });
    });
  }

  validateData(): Promise<any> {
    return new Promise((resolve) => {
      this.worker.onmessage = (event) => {
        if (event.data.action === 'validate_data_result') {
          resolve(event.data.payload);
        }
      };
      this.worker.postMessage({ action: 'validate_data' });
    });
  }
}

let financialEngineInstance: FinancialEngine | null = null;

if (typeof window !== 'undefined') {
  financialEngineInstance = new FinancialEngine();
}

export const financialEngine = financialEngineInstance;

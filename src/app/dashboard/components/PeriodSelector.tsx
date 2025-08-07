'use client';

import React from 'react';
import { useAppStore } from '@/stores/useAppStore';

type AnalysisPeriod = 'monthly' | 'bimonthly' | 'quarterly' | 'annual';

export function PeriodSelector() {
  const { analysisPeriod, setAnalysisPeriod } = useAppStore(state => ({
    analysisPeriod: state.analysisPeriod,
    setAnalysisPeriod: state.setAnalysisPeriod,
  }));

  return (
    <div>
      <label htmlFor="period" className="sr-only">
        Período de Análise
      </label>
      <select
        id="period"
        name="period"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={analysisPeriod}
        onChange={(e) => setAnalysisPeriod(e.target.value as AnalysisPeriod)}
      >
        <option value="monthly">Mensal</option>
        <option value="bimonthly">Bimestral</option>
        <option value="quarterly">Trimestral</option>
        <option value="annual">Anual</option>
      </select>
    </div>
  );
}

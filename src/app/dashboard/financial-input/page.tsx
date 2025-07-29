'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useAppStore, useFinancialData, useActions } from '@/stores/useAppStore';

import { toast } from 'sonner';
import StepContent from './components/StepContent';
import FinancialSummary from './components/FinancialSummary';
import { flowSteps, revenueCategories, personnelCategories, operationalCategories } from './components/categories';
import set from 'lodash/set';

// Função para somar valores numéricos em um objeto aninhado
const sumNestedValues = (obj: Record<string, unknown>): number => {
  let sum = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      sum += obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sum += sumNestedValues(obj[key] as Record<string, unknown>);
    }
  }
  return sum;
};


export default function FinancialInputPage() {
  const { recalculate } = useFinancialCalculations();
  const { club } = useAppStore();
  const financialData = useFinancialData();
  const { updateClub, setFinancialData, triggerRecalculation } = useActions();

  const [currentStep, setCurrentStep] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSave = useCallback(async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      useAppStore.persist.rehydrate();
      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Progresso salvo automaticamente!');
    } catch {
      toast.error('Não foi possível salvar os dados.');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    const interval = setInterval(() => autoSave(), 60000); // Salva a cada 60 segundos
    return () => clearInterval(interval);
  }, [autoSave]);

  const handleClubChange = (field: keyof typeof club, value: string | number) => {
    updateClub({ [field]: value });
    setHasChanges(true);
  };

  const handleFinancialChange = (path: (string | number)[], value: number) => {
    const newState = set({ ...financialData }, path, value);
    setFinancialData(newState);
    setHasChanges(true);
  };

  const calculateTotals = useCallback(() => {
    const revenueTotal = sumNestedValues(financialData.revenues || {});
    const costTotal = sumNestedValues(financialData.costs || {});
    return { revenueTotal, costTotal, profit: revenueTotal - costTotal };
  }, [financialData]);


  const nextStep = () => {
    if (currentStep < flowSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinalize = async () => {
    setIsCalculating(true);
    try {
      await autoSave();
      triggerRecalculation(); 
      recalculate(); 
      toast.success('Análises e projeções geradas com sucesso!');
    } catch {
      // Erro capturado e tratado via toast
      toast.error('Ocorreu um erro ao gerar as análises.');
    } finally {
      setIsCalculating(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Configuração Financeira Detalhada</h1>
          <p className="text-gray-600">
            Etapa {currentStep + 1} de {flowSteps.length}:{' '}
            <span className="font-semibold">{flowSteps[currentStep].title}</span>
          </p>
          {lastSaved && <span className="text-sm text-gray-500">Último salvamento: {lastSaved.toLocaleTimeString()}</span>}
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <RefreshCw className={`animate-spin text-blue-500 ${isSaving ? 'opacity-100' : 'opacity-0'}`} />
          <AlertCircle className={`text-yellow-500 ${hasChanges && !isSaving ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / flowSteps.length) * 100}%` }}
        ></div>
      </div>

      <FinancialSummary totals={totals} />

      <div className="space-y-6">
        <StepContent
          currentStep={currentStep}
          club={club}
          financialData={financialData}
          handleClubChange={handleClubChange}
          handleFinancialChange={handleFinancialChange}
          handleFinalize={handleFinalize}
          isCalculating={isCalculating}
          revenueCategories={revenueCategories}
          personnelCategories={personnelCategories}
          operationalCategories={operationalCategories}
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 flex items-center gap-2 hover:bg-gray-400 transition-colors"
        >
          <ArrowLeft size={16} /> Anterior
        </button>
        {currentStep < flowSteps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            Próximo <ArrowRight size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle size={20} />
            <span>Última Etapa</span>
          </div>
        )}
      </div>
    </div>
  );
} 
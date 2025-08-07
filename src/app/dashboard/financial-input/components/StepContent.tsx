import React, { useState, useEffect, useCallback } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, RefreshCw, Scale, Calculator, FilePlus2 } from 'lucide-react';
import type { ClubData, FinancialData, QuantifiableItem } from '@/types';
import { formatCurrency } from '@/utils/format';
import get from 'lodash/get';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  quantifiable?: boolean;
  isSeparator?: false;
}

interface Separator {
    key: string;
    isSeparator: true;
    label: string;
    placeholder: string;
}

type FormField = Field | Separator;

interface Category {
  key: string;
  name: string;
  icon: React.ElementType;
  color: string;
  fields: FormField[];
  isSpecial?: boolean;
}

interface StepContentProps {
  currentStep: number;
  club: ClubData;
  financialData: FinancialData;
  handleClubChange: (field: keyof ClubData, value: string | number) => void;
  handleFinancialChange: (path: string[], value: number | Partial<QuantifiableItem>) => void;
  handleFinalize: () => void;
  isCalculating: boolean;
  revenueCategories: Category[];
  personnelCategories: Category[];
  operationalCategories: Category[];
}

const InputField = ({ value, onChange, placeholder }: { value: number | string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }) => (
    <input
      type="number"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
    />
);

const QuantifiableInputField = ({ path, value, onChange, placeholder }: { path: string[], value: number | QuantifiableItem, onChange: (path: string[], value: number | Partial<QuantifiableItem>) => void, placeholder: string }) => {
  const [isDetailed, setIsDetailed] = useState(false);
  const initialValue = typeof value === 'object' && value !== null ? value : { total: value || 0 };

  const [details, setDetails] = useState<QuantifiableItem>({
    total: initialValue.total || 0,
    quantity: initialValue.quantity || 1,
    unitPrice: initialValue.unitPrice || initialValue.total,
    unitName: initialValue.unitName || 'un'
  });

  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (isDetailed) {
      const newTotal = (details.quantity || 0) * (details.unitPrice || 0);
      stableOnChange(path, { ...details, total: newTotal });
    }
  }, [details, isDetailed, path, stableOnChange]);

  const handleDetailChange = (field: keyof QuantifiableItem, fieldValue: string | number) => {
    setDetails(prev => ({ ...prev, [field]: fieldValue }));
  };
  
  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(e.target.value) || 0;
    stableOnChange(path, newTotal);
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="number"
          value={initialValue.total || ''}
          onChange={handleTotalChange}
          placeholder={placeholder}
          disabled={isDetailed}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
        <button onClick={() => setIsDetailed(!isDetailed)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
          <Scale size={18} />
        </button>
      </div>
      {isDetailed && (
        <div className="grid grid-cols-3 gap-2 mt-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <input type="number" value={details.quantity} onChange={e => handleDetailChange('quantity', parseFloat(e.target.value))} placeholder="Qtd" className="w-full border-gray-300 rounded-md dark:bg-gray-700" />
          <input type="text" value={details.unitName} onChange={e => handleDetailChange('unitName', e.target.value)} placeholder="Unidade" className="w-full border-gray-300 rounded-md dark:bg-gray-700" />
          <input type="number" value={details.unitPrice} onChange={e => handleDetailChange('unitPrice', parseFloat(e.target.value))} placeholder="Preço/Un." className="w-full border-gray-300 rounded-md dark:bg-gray-700" />
        </div>
      )}
    </div>
  );
};

const calculateCategoryTotal = (categoryData: Record<string, number | QuantifiableItem>): number => {
    if (!categoryData) return 0;
    return Object.values(categoryData).reduce((acc: number, fieldValue) => {
        if (typeof fieldValue === 'number') {
            return acc + fieldValue;
        }
        if (typeof fieldValue === 'object' && fieldValue !== null && typeof fieldValue.total === 'number') {
            return acc + fieldValue.total;
        }
        return acc;
    }, 0);
};

const CategoryAccordion = ({ categories, financialData, handleFinancialChange, basePath }: { categories: Category[], financialData: FinancialData, handleFinancialChange: (path: string[], value: number | Partial<QuantifiableItem>) => void, basePath: string[] }) => (
  <Accordion.Root type="multiple" defaultValue={[categories[0]?.key]} className="space-y-4">
    {categories.map((category: Category) => {
      const Icon = category.icon;
      const categoryData = get(financialData, [...basePath, category.key], {});
      const total = calculateCategoryTotal(categoryData);

      return (
        <Accordion.Item key={category.key} value={category.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <Accordion.Header>
            <Accordion.Trigger className="flex justify-between items-center w-full p-4 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex items-center gap-3">
                <Icon className={`${category.color} w-6 h-6`} />
                <span>{category.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-gray-600 dark:text-gray-300">{formatCurrency(total)}</span>
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </div>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {category.fields.map((field, idx) => {
                if (field.isSeparator) {
                  return (
                    <div key={`sep-${idx}`} className="md:col-span-2 lg:col-span-3 pt-2">
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 border-b dark:border-gray-600 pb-1">{field.label}</h4>
                    </div>
                  );
                }

                const path = [...basePath, category.key, field.key];
                const value = get(financialData, path, 0);

                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                    {field.quantifiable ? (
                      <QuantifiableInputField
                      path={path}
                      value={value}
                      onChange={handleFinancialChange}
                      placeholder={field.placeholder}
                    />
                    ) : (
                      <InputField
                        value={value as number}
                        onChange={(e) => handleFinancialChange(path, parseFloat(e.target.value) || 0)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      );
    })}
  </Accordion.Root>
);

const CustomFieldsAccordion = ({ type, financialData, handleFinancialChange }: { type: 'revenues' | 'costs', financialData: FinancialData, handleFinancialChange: (path: string[], value: number | Partial<QuantifiableItem>) => void }) => {
    const fields = type === 'revenues' 
        ? financialData.revenues.customRevenues 
        : financialData.costs.customCosts;

    if (!fields || fields.length === 0) {
        return null;
    }

    const basePath = type === 'revenues' ? ['revenues', 'customRevenues'] : ['costs', 'customCosts'];
    
    const total = fields.reduce((acc, field) => acc + (Number(field.value) || 0), 0);

    return (
        <div className="mt-6">
            <Accordion.Root type="single" defaultValue="custom-fields" collapsible>
                <Accordion.Item value="custom-fields" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex justify-between items-center w-full p-4 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <FilePlus2 className="text-cyan-600 w-6 h-6" />
                                <span>Campos Customizados ({type === 'revenues' ? 'Receitas' : 'Custos'})</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-base font-medium text-gray-600 dark:text-gray-300">{formatCurrency(total)}</span>
                                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </div>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {fields.map((field, index) => {
                                const path = [...basePath, String(index), 'value'];
                                
                                return (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" title={field.description || field.name}>{field.label}</label>
                                        <InputField
                                            value={field.value as number}
                                            onChange={(e) => handleFinancialChange(path, parseFloat(e.target.value) || 0)}
                                            placeholder={`Valor para ${field.label}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    );
};


const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  club,
  financialData,
  handleClubChange,
  handleFinancialChange,
  handleFinalize,
  isCalculating,
  revenueCategories,
  personnelCategories,
  operationalCategories,
}) => {
  if (currentStep === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Clube</label>
            <input
              type="text"
              value={club.name || ''}
              onChange={e => handleClubChange('name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Campos</label>
            <input
              type="number"
              value={club.numFields || 0}
              onChange={e => handleClubChange('numFields', parseInt(e.target.value, 10))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
        <>
            <CategoryAccordion categories={revenueCategories} financialData={financialData} handleFinancialChange={handleFinancialChange} basePath={['revenues']} />
            <CustomFieldsAccordion type="revenues" financialData={financialData} handleFinancialChange={handleFinancialChange} />
        </>
    )
  }

  if (currentStep === 2) {
    return <CategoryAccordion categories={personnelCategories} financialData={financialData} handleFinancialChange={handleFinancialChange} basePath={['costs', 'personnel']} />;
  }

  if (currentStep === 3) {
    const filteredOperationalCategories = operationalCategories.filter(c => c.key !== 'personnel');
    return (
        <>
            <CategoryAccordion categories={filteredOperationalCategories} financialData={financialData} handleFinancialChange={handleFinancialChange} basePath={['costs']} />
            <CustomFieldsAccordion type="costs" financialData={financialData} handleFinancialChange={handleFinancialChange} />
        </>
    )
  }

  if (currentStep === 4) {
    return (
      <div className="space-y-6 text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tudo pronto!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você inseriu todos os dados necessários. Clique no botão abaixo para processar as informações e
          gerar suas análises financeiras completas, projeções e KPIs.
        </p>
        <button
          onClick={handleFinalize}
          disabled={isCalculating}
          className="w-full max-w-md mx-auto py-3 px-4 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
        >
          {isCalculating ? <RefreshCw className="animate-spin" /> : <Calculator />}
          {isCalculating ? 'Processando Análises...' : 'Gerar Análises Financeiras'}
        </button>
      </div>
    );
  }

  return null;
};

export default StepContent; 

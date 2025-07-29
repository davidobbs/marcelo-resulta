import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Calculator, RefreshCw } from 'lucide-react';
import { ClubData } from '@/types';
import { FinancialData } from '@/stores/useAppStore';
import { formatCurrency } from '@/utils/format';

// Tipagem para os campos e categorias
interface Field {
  key: string;
  label: string;
  placeholder: string;
}

interface Category {
  key: string;
  name: string;
  icon: React.ElementType;
  color: string;
  fields: Field[];
}

interface StepContentProps {
  currentStep: number;
  club: ClubData;
  financialData: FinancialData;
  handleClubChange: (field: keyof ClubData, value: string | number) => void;
  handleFinancialChange: (path: string[], value: number) => void;
  handleFinalize: () => void;
  isCalculating: boolean;
  revenueCategories: Category[];
  personnelCategories: Category[];
  operationalCategories: Category[];
}

// Tipagem para props do InputField
interface InputFieldProps {
  path: string[];
  value: number | string;
  onChange: (path: string[], value: number) => void;
  placeholder: string;
}

// Componente de Input reutilizável para consistência
const InputField = ({ path, value, onChange, placeholder }: InputFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numberValue = parseFloat(rawValue);
    onChange(path, isNaN(numberValue) ? 0 : numberValue);
  };

  return (
    <input
      type="number"
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  );
};

// Tipagem para props do CategoryAccordion
interface CategoryAccordionProps {
  categories: Category[];
  financialData: FinancialData;
  handleFinancialChange: (path: string[], value: number) => void;
  basePath: string[];
}

// Componente Accordion para exibir as categorias
const CategoryAccordion = ({ categories, financialData, handleFinancialChange, basePath }: CategoryAccordionProps) => (
  <Accordion.Root type="multiple" defaultValue={[categories[0]?.key]} className="space-y-4">
    {categories.map((category: Category) => {
      const Icon = category.icon;
             // Calcula o total para a categoria usando navegação segura
       let categoryData: Record<string, number> = {};
       try {
         if (basePath.length === 2) {
           const data = (financialData as unknown as Record<string, Record<string, Record<string, number>>>)[basePath[0]]?.[basePath[1]]?.[category.key];
           categoryData = (typeof data === 'object' && data !== null) ? data : {};
         } else {
           const data = (financialData as unknown as Record<string, Record<string, number>>)[basePath[0]]?.[category.key];
           categoryData = (typeof data === 'object' && data !== null) ? data : {};
         }
       } catch {
         categoryData = {};
       }
      
      const total = Object.values(categoryData).reduce((sum: number, value: unknown) => 
        sum + (typeof value === 'number' ? value : 0), 0);

      return (
        <Accordion.Item key={category.key} value={category.key} className="bg-white rounded-lg shadow-md overflow-hidden">
          <Accordion.Header>
            <Accordion.Trigger className="flex justify-between items-center w-full p-4 font-semibold text-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <Icon className={`${category.color} w-6 h-6`} />
                <span>{category.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-gray-600">{formatCurrency(total)}</span>
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </div>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="p-4 bg-gray-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {category.fields.map((field: Field) => {
                const path = [...basePath, category.key, field.key];
                // Navega de forma segura no objeto financialData
                let value: number | string = '';
                try {
                  value = path.reduce((obj: unknown, key: string) => {
                    if (obj && typeof obj === 'object' && key in obj) {
                      return (obj as Record<string, unknown>)[key];
                    }
                    return '';
                  }, financialData as unknown) as number | string;
                } catch {
                  value = '';
                }

                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <InputField
                      path={path}
                      value={value}
                      onChange={handleFinancialChange}
                      placeholder={field.placeholder}
                    />
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
  // Etapa 0: Informações Básicas
  if (currentStep === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Clube</label>
            <input
              type="text"
              value={club.name || ''}
              onChange={e => handleClubChange('name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Campos</label>
            <input
              type="number"
              value={club.numFields || 0}
              onChange={e => handleClubChange('numFields', parseInt(e.target.value, 10))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // Etapa 1: Receitas
  if (currentStep === 1) {
    return (
      <CategoryAccordion
        categories={revenueCategories}
        financialData={financialData}
        handleFinancialChange={handleFinancialChange}
        basePath={['revenues']}
      />
    );
  }

  // Etapa 2: Custos com Pessoal
  if (currentStep === 2) {
    return (
      <CategoryAccordion
        categories={personnelCategories}
        financialData={financialData}
        handleFinancialChange={handleFinancialChange}
        basePath={['costs', 'personnel']}
      />
    );
  }

  // Etapa 3: Custos Operacionais
  if (currentStep === 3) {
    return (
      <CategoryAccordion
        categories={operationalCategories}
        financialData={financialData}
        handleFinancialChange={handleFinancialChange}
        basePath={['costs']}
      />
    );
  }

  // Etapa 4: Finalização
  if (currentStep === 4) {
    return (
      <div className="space-y-6 text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Tudo pronto!</h2>
        <p className="text-gray-600">
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
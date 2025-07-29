import { formatCurrency } from '@/utils/format';
import { DollarSign, Minus } from 'lucide-react';

interface FinancialSummaryProps {
  totals: {
    revenueTotal: number;
    costTotal: number;
    profit: number;
  };
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ totals }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="p-4 bg-green-50 rounded-lg">
      <div className="flex items-center">
        <div className="p-2 bg-green-200 rounded-md">
          <Minus className="text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-lg font-semibold">{formatCurrency(totals.revenueTotal)}</p>
          <p className="text-sm text-gray-500">Total Receitas</p>
        </div>
      </div>
    </div>
    <div className="p-4 bg-red-50 rounded-lg">
      <div className="flex items-center">
        <div className="p-2 bg-red-200 rounded-md">
          <Minus className="text-red-600" />
        </div>
        <div className="ml-4">
          <p className="text-lg font-semibold">{formatCurrency(totals.costTotal)}</p>
          <p className="text-sm text-gray-500">Total Custos</p>
        </div>
      </div>
    </div>
    <div className="p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center">
        <div className="p-2 bg-blue-200 rounded-md">
          <DollarSign className="text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-lg font-semibold">{formatCurrency(totals.profit)}</p>
          <p className="text-sm text-gray-500">Lucro</p>
        </div>
      </div>
    </div>
  </div>
);

export default FinancialSummary; 
'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Investor } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { Plus, Trash2, Edit, User, DollarSign, Percent, Save, X } from 'lucide-react';
import { toast } from 'sonner';

type InvestorFormData = Omit<Investor, 'id'>;

export default function InvestorsPage() {
  const { investors, addInvestor, removeInvestor, updateInvestor } = useAppStore(state => ({
    investors: state.financialData.investors,
    addInvestor: state.addInvestor,
    removeInvestor: state.removeInvestor,
    updateInvestor: state.updateInvestor,
  }));
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    investmentValue: 0,
    equityPercentage: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.investmentValue <= 0 || formData.equityPercentage <= 0) {
      toast.error('Preencha todos os campos corretamente.');
      return;
    }

    if (editingInvestor) {
      updateInvestor(editingInvestor.id, formData);
      toast.success('Investidor atualizado com sucesso!');
    } else {
      addInvestor(formData);
      toast.success('Investidor adicionado com sucesso!');
    }
    
    closeForm();
  };
  
  const openForm = (investor?: Investor) => {
    if (investor) {
      setEditingInvestor(investor);
      setFormData({
        name: investor.name,
        investmentValue: investor.investmentValue,
        equityPercentage: investor.equityPercentage,
      });
    } else {
      setEditingInvestor(null);
      setFormData({ name: '', investmentValue: 0, equityPercentage: 0 });
    }
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingInvestor(null);
  };
  
  const handleDelete = (id: string) => {
    if(window.confirm('Tem certeza que deseja remover este investidor?')) {
        removeInvestor(id);
        toast.success('Investidor removido.');
    }
  }

  const totalInvested = investors.reduce((sum, inv) => sum + inv.investmentValue, 0);
  const totalEquity = investors.reduce((sum, inv) => sum + inv.equityPercentage, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <User className="h-8 w-8 text-purple-600" />
            Gestão de Investidores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Adicione, edite e visualize os investidores do clube.
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Investidor
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-6 bg-gray-50 dark:bg-gray-800">
            <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-semibold">{editingInvestor ? 'Editar Investidor' : 'Novo Investidor'}</h2>
                <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5"/>
                </button>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="form-label flex items-center gap-2" htmlFor="name"><User className="w-4 h-4"/>Nome do Investidor</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Ex: João da Silva" />
                    </div>
                    <div>
                        <label className="form-label flex items-center gap-2" htmlFor="investmentValue"><DollarSign className="w-4 h-4"/>Valor Investido</label>
                        <input type="number" id="investmentValue" name="investmentValue" value={formData.investmentValue} onChange={handleInputChange} className="form-input" placeholder="Ex: 500000" />
                    </div>
                    <div>
                        <label className="form-label flex items-center gap-2" htmlFor="equityPercentage"><Percent className="w-4 h-4"/>% de Participação</label>
                        <input type="number" id="equityPercentage" name="equityPercentage" value={formData.equityPercentage} onChange={handleInputChange} className="form-input" placeholder="Ex: 10" />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {editingInvestor ? 'Salvar Alterações' : 'Adicionar Investidor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="metric-card">
            <p className="metric-label">Total de Investidores</p>
            <p className="metric-value">{investors.length}</p>
        </div>
        <div className="metric-card">
            <p className="metric-label">Capital Total Investido</p>
            <p className="metric-value text-green-600">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="metric-card">
            <p className="metric-label">% do Clube com Investidores</p>
            <p className="metric-value text-purple-600">{formatPercentage(totalEquity)}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
            <h2 className="text-xl font-semibold">Lista de Investidores</h2>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Nome</th>
                  <th className="table-header-cell text-right">Valor Investido</th>
                  <th className="table-header-cell text-right">% Participação</th>
                  <th className="table-header-cell text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {investors.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum investidor cadastrado.</td>
                    </tr>
                ) : (
                    investors.map(investor => (
                        <tr key={investor.id} className="table-row">
                            <td className="table-cell font-medium">{investor.name}</td>
                            <td className="table-cell text-right text-green-600">{formatCurrency(investor.investmentValue)}</td>
                            <td className="table-cell text-right text-purple-600">{formatPercentage(investor.equityPercentage)}</td>
                            <td className="table-cell">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openForm(investor)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                        <Edit className="w-4 h-4 text-blue-600"/>
                                    </button>
                                    <button onClick={() => handleDelete(investor.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                        <Trash2 className="w-4 h-4 text-red-600"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

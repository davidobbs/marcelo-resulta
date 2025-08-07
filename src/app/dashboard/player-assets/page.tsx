'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { PlayerAsset } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { Plus, Trash2, Edit, User, DollarSign, Percent, Save, X, ShieldCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type PlayerAssetFormData = Omit<PlayerAsset, 'id'>;

export default function PlayerAssetsPage() {
  const { playerAssets, addPlayerAsset, removePlayerAsset, updatePlayerAsset } = useAppStore(state => ({
    playerAssets: state.financialData.assets.playerPassValue,
    addPlayerAsset: state.addPlayerAsset,
    removePlayerAsset: state.removePlayerAsset,
    updatePlayerAsset: state.updatePlayerAsset,
  }));
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PlayerAsset | null>(null);
  const [formData, setFormData] = useState<PlayerAssetFormData>({
    playerName: '',
    marketValue: 0,
    ownershipPercentage: 100,
    contractEndDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'playerName' || name === 'contractEndDate' ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.playerName || formData.marketValue <= 0 || !formData.contractEndDate) {
      toast.error('Preencha o nome, valor de mercado e data de fim de contrato.');
      return;
    }
     if (formData.ownershipPercentage <= 0 || formData.ownershipPercentage > 100) {
      toast.error('O percentual de posse deve ser entre 1 e 100.');
      return;
    }

    if (editingAsset) {
      updatePlayerAsset(editingAsset.id, formData);
      toast.success('Ativo atualizado com sucesso!');
    } else {
      addPlayerAsset(formData);
      toast.success('Ativo adicionado com sucesso!');
    }
    
    closeForm();
  };
  
  const openForm = (asset?: PlayerAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        playerName: asset.playerName,
        marketValue: asset.marketValue,
        ownershipPercentage: asset.ownershipPercentage,
        contractEndDate: asset.contractEndDate,
      });
    } else {
      setEditingAsset(null);
      setFormData({ playerName: '', marketValue: 0, ownershipPercentage: 100, contractEndDate: '' });
    }
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
  };
  
  const handleDelete = (id: string) => {
    if(window.confirm('Tem certeza que deseja remover este ativo?')) {
        removePlayerAsset(id);
        toast.success('Ativo removido.');
    }
  }

  const totalMarketValue = playerAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
  const totalClubValue = playerAssets.reduce((sum, asset) => sum + (asset.marketValue * (asset.ownershipPercentage / 100)), 0);


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            Ativos de Jogadores (Passe)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie o valor de mercado e a posse dos passes dos atletas do clube.
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Ativo
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-6 bg-gray-50 dark:bg-gray-800">
            <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-semibold">{editingAsset ? 'Editar Ativo' : 'Novo Ativo de Jogador'}</h2>
                <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5"/>
                </button>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2" htmlFor="playerName"><User className="w-4 h-4"/>Nome do Jogador</label>
                        <input type="text" id="playerName" name="playerName" value={formData.playerName} onChange={handleInputChange} className="form-input" placeholder="Ex: Vinícius Júnior" />
                    </div>
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2" htmlFor="marketValue"><DollarSign className="w-4 h-4"/>Valor de Mercado (Total)</label>
                        <input type="number" id="marketValue" name="marketValue" value={formData.marketValue} onChange={handleInputChange} className="form-input" placeholder="Ex: 150000000" />
                    </div>
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2" htmlFor="ownershipPercentage"><Percent className="w-4 h-4"/>% do Passe do Clube</label>
                        <input type="number" id="ownershipPercentage" name="ownershipPercentage" value={formData.ownershipPercentage} onChange={handleInputChange} className="form-input" placeholder="Ex: 80" />
                    </div>
                    <div className="form-group">
                        <label className="form-label flex items-center gap-2" htmlFor="contractEndDate"><Calendar className="w-4 h-4"/>Fim do Contrato</label>
                        <input type="date" id="contractEndDate" name="contractEndDate" value={formData.contractEndDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {editingAsset ? 'Salvar Alterações' : 'Adicionar Ativo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="metric-card">
            <p className="metric-label">Jogadores como Ativos</p>
            <p className="metric-value">{playerAssets.length}</p>
        </div>
        <div className="metric-card">
            <p className="metric-label">Valor de Mercado Total (100%)</p>
            <p className="metric-value">{formatCurrency(totalMarketValue)}</p>
        </div>
        <div className="metric-card">
            <p className="metric-label">Valor do Clube nos Passes</p>
            <p className="metric-value text-green-600">{formatCurrency(totalClubValue)}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
            <h2 className="text-xl font-semibold">Lista de Ativos de Jogadores</h2>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Jogador</th>
                  <th className="table-header-cell text-right">Valor de Mercado (100%)</th>
                  <th className="table-header-cell text-center">% do Clube</th>
                  <th className="table-header-cell text-right">Valor do Clube</th>
                   <th className="table-header-cell text-center">Fim do Contrato</th>
                  <th className="table-header-cell text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {playerAssets.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">Nenhum ativo de jogador cadastrado.</td>
                    </tr>
                ) : (
                    playerAssets.map(asset => (
                        <tr key={asset.id} className="table-row">
                            <td className="table-cell font-medium">{asset.playerName}</td>
                            <td className="table-cell text-right">{formatCurrency(asset.marketValue)}</td>
                            <td className="table-cell text-center text-purple-600 font-medium">{formatPercentage(asset.ownershipPercentage)}</td>
                            <td className="table-cell text-right text-green-600 font-bold">{formatCurrency(asset.marketValue * (asset.ownershipPercentage / 100))}</td>
                            <td className="table-cell text-center">{new Date(asset.contractEndDate).toLocaleDateString()}</td>
                            <td className="table-cell">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openForm(asset)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                        <Edit className="w-4 h-4 text-blue-600"/>
                                    </button>
                                    <button onClick={() => handleDelete(asset.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
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

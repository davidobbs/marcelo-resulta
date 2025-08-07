'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { CustomField } from '@/types';
import { Trash2, Edit, Save, X, FilePlus2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

type FieldType = 'revenues' | 'costs';

export default function CustomFieldsPage() {
  const { customFields, addCustomField, removeCustomField, updateCustomField } = useAppStore(state => ({
    customFields: state.customFields,
    addCustomField: state.addCustomField,
    removeCustomField: state.removeCustomField,
    updateCustomField: state.updateCustomField,
  }));

  const customRevenues = customFields.filter(f => f.category === 'revenues');
  const customCosts = customFields.filter(f => f.category === 'costs');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [currentType, setCurrentType] = useState<FieldType>('revenues');
  const initialFormState: Omit<CustomField, 'id' | 'value'> = {
    label: '',
    name: '',
    type: 'currency',
    category: 'revenues',
    isEditable: true,
    isVisible: true,
    description: '',
  };
  const [formData, setFormData] = useState<Omit<CustomField, 'id' | 'value'>>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.label) {
      toast.error('O nome técnico e o rótulo do campo são obrigatórios.');
      return;
    }
    
    const fieldToSave: Omit<CustomField, 'id'> = { ...formData, value: 0, category: currentType };

    if (editingField) {
      updateCustomField(currentType, editingField.id, fieldToSave);
      toast.success('Campo atualizado com sucesso!');
    } else {
      addCustomField(currentType, fieldToSave);
      toast.success('Campo customizado adicionado com sucesso!');
    }
    
    closeForm();
  };
  
  const openForm = (type: FieldType, field?: CustomField) => {
    setCurrentType(type);
    if (field) {
      setEditingField(field);
      const { value: _, id: __, ...dataToEdit } = field;
      setFormData(dataToEdit);
    } else {
      setEditingField(null);
      setFormData({ ...initialFormState, category: type });
    }
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingField(null);
  };
  
  const handleDelete = (type: FieldType, id: string) => {
    if(window.confirm('Tem certeza que deseja remover este campo customizado? Esta ação não pode ser desfeita.')) {
        removeCustomField(type, id);
        toast.success('Campo removido.');
    }
  }

  const renderFieldList = (fields: CustomField[], type: FieldType) => (
    <div className="card">
        <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold capitalize">{type === 'revenues' ? 'Receitas' : 'Custos'} Customizados</h2>
            <button onClick={() => openForm(type)} className="btn-primary-outline flex items-center gap-2 text-sm">
                <FilePlus2 className="w-4 h-4" />
                Adicionar Campo de {type === 'revenues' ? 'Receita' : 'Custo'}
            </button>
        </div>
        <div className="card-body p-0">
            {fields.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Nenhum campo customizado de {type === 'revenues' ? 'receita' : 'custo'} encontrado.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {fields.map(field => (
                        <li key={field.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div>
                                <p className="font-semibold">{field.label}</p>
                                <p className="text-sm text-gray-500">{field.description || `Nome técnico: ${field.name}`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge">{field.type}</span>
                                <button onClick={() => openForm(type, field)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <Edit className="w-4 h-4 text-blue-600"/>
                                </button>
                                <button onClick={() => handleDelete(type, field.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <Trash2 className="w-4 h-4 text-red-600"/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-cyan-600" />
          Campos Customizados
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Adicione ou modifique campos de entrada de dados para adequar o sistema à realidade do seu clube.
        </p>
      </div>

      {isFormOpen && (
        <div className="card mb-6 bg-gray-50 dark:bg-gray-800">
            <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-semibold">{editingField ? 'Editar Campo' : 'Novo Campo'} de {currentType === 'revenues' ? 'Receita' : 'Custo'}</h2>
                <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5"/>
                </button>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label" htmlFor="label">Rótulo (O que aparece para o usuário)</label>
                            <input type="text" id="label" name="label" value={formData.label} onChange={handleInputChange} className="form-input" placeholder="Ex: Receita com eSports" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Nome Técnico (sem espaços/acentos)</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Ex: esportsRevenue" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="description">Descrição</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows={2} placeholder="Descreva brevemente para que serve este campo." />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="type">Tipo do Campo</label>
                        <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="form-select">
                            <option value="currency">Moeda</option>
                            <option value="number">Número</option>
                            <option value="percentage">Porcentagem</option>
                            <option value="text">Texto</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {editingField ? 'Salvar Alterações' : 'Criar Campo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderFieldList(customRevenues, 'revenues')}
        {renderFieldList(customCosts, 'costs')}
      </div>
    </div>
  );
}
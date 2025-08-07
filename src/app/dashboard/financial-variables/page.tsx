'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Percent,
  Hash,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { financialEngine } from '@/lib/financial-engine';
import { FinancialVariable } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface VariableEditorProps {
  variable: FinancialVariable | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (variable: FinancialVariable) => void;
}

const VariableEditor: React.FC<VariableEditorProps> = ({ 
  variable, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<FinancialVariable>>({
    id: '',
    name: '',
    formula: 'direct_input',
    value: 0,
    dependencies: [],
    category: 'revenue',
    unit: 'currency',
    description: ''
  });

  useEffect(() => {
    if (variable) {
      setFormData(variable);
    } else {
      setFormData({
        id: '',
        name: '',
        formula: 'direct_input',
        value: 0,
        dependencies: [],
        category: 'revenue',
        unit: 'currency',
        description: ''
      });
    }
  }, [variable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.name) {
      onSave(formData as FinancialVariable);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {variable ? 'Editar Variável' : 'Nova Variável'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID da Variável
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="ex: monthly_revenue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Variável
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="ex: Receita Mensal"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="revenue">Receita</option>
                <option value="cost">Custo</option>
                <option value="metric">Métrica</option>
                <option value="projection">Projeção</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="currency">Moeda (R$)</option>
                <option value="percentage">Percentual (%)</option>
                <option value="number">Número</option>
                <option value="days">Dias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fórmula
            </label>
            <textarea
              value={formData.formula}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
              rows={3}
              placeholder="ex: field_rental_rate * monthly_hours * utilization_rate"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use 'direct_input' para valores inseridos manualmente
            </p>
          </div>

          {formData.formula !== 'direct_input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Atual
              </label>
              <input
                type="number"
                value={formData.value}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor calculado automaticamente pela fórmula
              </p>
            </div>
          )}

          {formData.formula === 'direct_input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={2}
              placeholder="Descreva o propósito desta variável..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function FinancialVariablesPage() {
  const [variables, setVariables] = useState<FinancialVariable[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<FinancialVariable | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });

  useEffect(() => {
    const loadData = async () => {
      await loadVariables();
    };
    loadData();
  }, []);

  const loadVariables = async () => {
    if (!financialEngine) return;
    const allVariables = await financialEngine.getAllVariables();
    setVariables(allVariables);
    
    const validationResult = await financialEngine.validateData();
    setValidation(validationResult);
  };

  const handleSaveVariable = (variable: FinancialVariable) => {
    if (!financialEngine) return;
    financialEngine.addVariable(variable);
    if (variable.formula === 'direct_input') {
      financialEngine.updateVariable(variable.id, variable.value);
    }
    loadVariables();
  };

  const handleEditVariable = (variable: FinancialVariable) => {
    setEditingVariable(variable);
    setIsEditorOpen(true);
  };

  const handleUpdateValue = (id: string, value: number) => {
    if (!financialEngine) return;
    financialEngine.updateVariable(id, value);
    loadVariables();
  };

  const filteredVariables = selectedCategory === 'all' 
    ? variables 
    : variables.filter(v => v.category === selectedCategory);

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'currency': return <DollarSign className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      case 'days': return <Calendar className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'currency': return formatCurrency(value);
      case 'percentage': return formatPercentage(value);
      case 'days': return `${value} dias`;
      default: return value.toLocaleString('pt-BR');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'metric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'projection': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Variáveis Financeiras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure e gerencie as variáveis e fórmulas do sistema financeiro
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadVariables}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recalcular
          </button>
          <button
            onClick={() => {
              setEditingVariable(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Variável
          </button>
        </div>
      </div>

      {/* Status de Validação */}
      {!validation.isValid && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                Problemas de Validação
              </h3>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600 dark:text-red-400">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation.isValid && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-800 dark:text-green-300">
              Todas as variáveis estão configuradas corretamente
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'revenue', label: 'Receitas' },
          { key: 'cost', label: 'Custos' },
          { key: 'metric', label: 'Métricas' },
          { key: 'projection', label: 'Projeções' }
        ].map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedCategory === category.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Lista de Variáveis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVariables.map(variable => (
          <div 
            key={variable.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {variable.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(variable.category)}`}>
                    {variable.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {variable.description}
                </p>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                  ID: {variable.id}
                </p>
              </div>
              <button
                onClick={() => handleEditVariable(variable)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {getUnitIcon(variable.unit)}
                  <span>Valor Atual:</span>
                </div>
                <div className="text-right">
                  {variable.formula === 'direct_input' ? (
                    <input
                      type="number"
                      step="0.01"
                      value={variable.value}
                      onChange={(e) => handleUpdateValue(variable.id, parseFloat(e.target.value) || 0)}
                      className="text-right text-lg font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 w-32 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatValue(variable.value, variable.unit)}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Fórmula:</p>
                    <p className="font-mono text-xs bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded text-gray-800 dark:text-gray-300">
                      {variable.formula}
                    </p>
                  </div>
                </div>
              </div>

              {variable.dependencies.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dependências:</p>
                  <div className="flex flex-wrap gap-1">
                    {variable.dependencies.map(dep => (
                      <span 
                        key={dep}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor de Variáveis */}
      <VariableEditor
        variable={editingVariable}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingVariable(null);
        }}
        onSave={handleSaveVariable}
      />
    </div>
  );
}
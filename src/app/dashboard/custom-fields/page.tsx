'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Calculator,
  DollarSign,
  TrendingUp,
  Settings,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import type { CustomField, FieldValidation } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';

export default function CustomFieldsPage() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<Partial<CustomField>>({});
  const [showFormula, setShowFormula] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'revenue' | 'cost' | 'asset' | 'liability' | 'kpi' | 'other'>('all');

  // Dados de exemplo para demonstração
  useEffect(() => {
    const exampleFields: CustomField[] = [
      {
        id: 'custom_1',
        name: 'sponsorshipRevenue',
        label: 'Receita de Patrocínio Premium',
        type: 'currency',
        category: 'revenue',
        value: 150000,
        unit: 'R$',
        validation: {
          required: true,
          min: 0,
        },
        isEditable: true,
        isVisible: true,
        description: 'Receita anual estimada de patrocínios premium'
      },
      {
        id: 'custom_2',
        name: 'socialMediaReach',
        label: 'Alcance em Redes Sociais',
        type: 'number',
        category: 'kpi',
        value: 50000,
        unit: 'seguidores',
        validation: {
          required: false,
          min: 0,
        },
        isEditable: true,
        isVisible: true,
        description: 'Número total de seguidores nas redes sociais'
      },
      {
        id: 'custom_3',
        name: 'energyCostPerField',
        label: 'Custo de Energia por Campo',
        type: 'currency',
        category: 'cost',
        value: 800,
        formula: 'totalEnergyCost / numberOfFields',
        unit: 'R$/mês',
        validation: {
          required: true,
          min: 0,
        },
        isEditable: false,
        isVisible: true,
        dependencies: ['totalEnergyCost', 'numberOfFields'],
        description: 'Custo mensal de energia dividido pelo número de campos'
      },
      {
        id: 'custom_4',
        name: 'membershipConversionRate',
        label: 'Taxa de Conversão de Membros',
        type: 'percentage',
        category: 'kpi',
        value: 0.15,
        formula: 'newMembers / totalVisitors',
        unit: '%',
        validation: {
          required: false,
          min: 0,
          max: 1,
        },
        isEditable: false,
        isVisible: true,
        dependencies: ['newMembers', 'totalVisitors'],
        description: 'Percentual de visitantes que se tornam membros'
      },
      {
        id: 'custom_5',
        name: 'equipmentValue',
        label: 'Valor dos Equipamentos',
        type: 'currency',
        category: 'asset',
        value: 125000,
        unit: 'R$',
        validation: {
          required: true,
          min: 0,
        },
        isEditable: true,
        isVisible: true,
        description: 'Valor total dos equipamentos esportivos e de manutenção'
      }
    ];
    setCustomFields(exampleFields);
  }, []);

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'currency', label: 'Moeda' },
    { value: 'percentage', label: 'Percentual' },
    { value: 'date', label: 'Data' },
    { value: 'boolean', label: 'Sim/Não' },
    { value: 'select', label: 'Lista' },
  ];

  const categories = [
    { value: 'revenue', label: 'Receita', icon: DollarSign, color: 'text-green-600' },
    { value: 'cost', label: 'Custo', icon: TrendingUp, color: 'text-red-600' },
    { value: 'asset', label: 'Ativo', icon: Plus, color: 'text-blue-600' },
    { value: 'liability', label: 'Passivo', icon: Trash2, color: 'text-orange-600' },
    { value: 'kpi', label: 'KPI', icon: Settings, color: 'text-purple-600' },
    { value: 'other', label: 'Outro', icon: Calculator, color: 'text-gray-600' },
  ];

  const startEditing = (field?: CustomField) => {
    if (field) {
      setEditingField(field);
      setIsEditing(field.id);
    } else {
      setEditingField({
        name: '',
        label: '',
        type: 'number',
        category: 'other',
        value: 0,
        validation: {},
        isEditable: true,
        isVisible: true,
        description: ''
      });
      setIsEditing('new');
    }
  };

  const saveField = () => {
    if (!editingField.name || !editingField.label) {
      alert('Nome e rótulo são obrigatórios');
      return;
    }

    const field: CustomField = {
      id: isEditing === 'new' ? `custom_${Date.now()}` : isEditing as string,
      name: editingField.name || '',
      label: editingField.label || '',
      type: editingField.type || 'number',
      category: editingField.category || 'other',
      value: editingField.value || 0,
      formula: editingField.formula,
      unit: editingField.unit,
      validation: editingField.validation || {},
      isEditable: editingField.isEditable ?? true,
      isVisible: editingField.isVisible ?? true,
      dependencies: editingField.dependencies,
      description: editingField.description || ''
    };

    if (isEditing === 'new') {
      setCustomFields([...customFields, field]);
    } else {
      setCustomFields(customFields.map(f => f.id === field.id ? field : f));
    }

    setIsEditing(null);
    setEditingField({});
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditingField({});
  };

  const deleteField = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este campo?')) {
      setCustomFields(customFields.filter(f => f.id !== id));
    }
  };

  const toggleVisibility = (id: string) => {
    setCustomFields(customFields.map(f => 
      f.id === id ? { ...f, isVisible: !f.isVisible } : f
    ));
  };

  const duplicateField = (field: CustomField) => {
    const newField: CustomField = {
      ...field,
      id: `custom_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Cópia)`
    };
    setCustomFields([...customFields, newField]);
  };

  const formatValue = (field: CustomField) => {
    switch (field.type) {
      case 'currency':
        return formatCurrency(field.value as number);
      case 'percentage':
        return formatPercentage(field.value as number);
      case 'boolean':
        return field.value ? 'Sim' : 'Não';
      default:
        return `${field.value}${field.unit ? ` ${field.unit}` : ''}`;
    }
  };

  const filteredFields = activeCategory === 'all' 
    ? customFields 
    : customFields.filter(f => f.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Calculator;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Campos Customizáveis
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie campos personalizados para expandir a análise financeira
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <input
            type="file"
            accept=".json"
            onChange={() => {}} // TODO: Implementar importação
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button 
            onClick={() => {
              // Exporta os campos customizados
              const dataStr = JSON.stringify(customFields, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'custom-fields.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => startEditing()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Campo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <p className="metric-label">Total de Campos</p>
              <p className="metric-value">{customFields.length}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-600" />
            <div>
              <p className="metric-label">Campos Visíveis</p>
              <p className="metric-value">{customFields.filter(f => f.isVisible).length}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            <div>
              <p className="metric-label">Campos Calculados</p>
              <p className="metric-value">{customFields.filter(f => f.formula).length}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="metric-label">KPIs Customizados</p>
              <p className="metric-value">{customFields.filter(f => f.category === 'kpi').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({customFields.length})
        </button>
        {categories.map((category) => {
          const count = customFields.filter(f => f.category === category.value).length;
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value as any)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeCategory === category.value
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de Campos */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Campos Customizados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredFields.length} campo(s) encontrado(s)
          </p>
        </div>
        <div className="card-body p-0">
          <div className="space-y-2">
            {filteredFields.map((field) => {
              const CategoryIcon = getCategoryIcon(field.category);
              
              return (
                <div
                  key={field.id}
                  className={`p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    field.category === 'revenue' ? 'border-green-500' :
                    field.category === 'cost' ? 'border-red-500' :
                    field.category === 'asset' ? 'border-blue-500' :
                    field.category === 'liability' ? 'border-orange-500' :
                    field.category === 'kpi' ? 'border-purple-500' :
                    'border-gray-500'
                  } ${!field.isVisible ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CategoryIcon className={`w-5 h-5 ${getCategoryColor(field.category)}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {field.label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {field.name} • {fieldTypes.find(t => t.value === field.type)?.label}
                          </p>
                        </div>
                        
                        {field.formula && (
                          <button
                            onClick={() => setShowFormula(showFormula === field.id ? null : field.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium"
                          >
                            Fórmula
                          </button>
                        )}
                        
                        {!field.isEditable && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-xs font-medium">
                            Calculado
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Valor Atual:</span>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatValue(field)}
                          </div>
                        </div>
                        
                        {field.validation?.min !== undefined && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Valor Mínimo:</span>
                            <div className="font-medium">{field.validation.min}</div>
                          </div>
                        )}
                        
                        {field.validation?.max !== undefined && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Valor Máximo:</span>
                            <div className="font-medium">{field.validation.max}</div>
                          </div>
                        )}
                      </div>
                      
                      {field.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {field.description}
                        </p>
                      )}
                      
                      {showFormula === field.id && field.formula && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Fórmula:
                            </span>
                          </div>
                          <code className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 px-2 py-1 rounded">
                            {field.formula}
                          </code>
                          {field.dependencies && field.dependencies.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Depende de: {field.dependencies.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(field.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={field.isVisible ? 'Ocultar campo' : 'Mostrar campo'}
                      >
                        {field.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => duplicateField(field)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Duplicar campo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => startEditing(field)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Editar campo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteField(field.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Excluir campo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredFields.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum campo encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {activeCategory === 'all' 
                    ? 'Não há campos customizados criados ainda.'
                    : `Não há campos na categoria "${categories.find(c => c.value === activeCategory)?.label}".`
                  }
                </p>
                <button
                  onClick={() => startEditing()}
                  className="btn-primary"
                >
                  Criar Primeiro Campo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isEditing === 'new' ? 'Novo Campo Customizado' : 'Editar Campo'}
                </h2>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Campo *
                    </label>
                    <input
                      type="text"
                      value={editingField.name || ''}
                      onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                      className="input-field"
                      placeholder="ex: customRevenue"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome técnico (sem espaços, apenas letras, números e _)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rótulo *
                    </label>
                    <input
                      type="text"
                      value={editingField.label || ''}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      className="input-field"
                      placeholder="ex: Receita Customizada"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select
                      value={editingField.type || 'number'}
                      onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                      className="input-field"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={editingField.category || 'other'}
                      onChange={(e) => setEditingField({ ...editingField, category: e.target.value as any })}
                      className="input-field"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor Inicial
                    </label>
                    <input
                      type="number"
                      value={editingField.value || 0}
                      onChange={(e) => setEditingField({ ...editingField, value: Number(e.target.value) })}
                      className="input-field"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unidade
                    </label>
                    <input
                      type="text"
                      value={editingField.unit || ''}
                      onChange={(e) => setEditingField({ ...editingField, unit: e.target.value })}
                      className="input-field"
                      placeholder="ex: R$, %, kg, pessoas"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingField.description || ''}
                    onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Descreva o propósito e uso deste campo..."
                  />
                </div>
                
                {/* Fórmula (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fórmula (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingField.formula || ''}
                    onChange={(e) => setEditingField({ ...editingField, formula: e.target.value })}
                    className="input-field"
                    placeholder="ex: fieldRevenue * 0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se definida, o campo será calculado automaticamente
                  </p>
                </div>
                
                {/* Validação */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Validação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingField.validation?.required || false}
                          onChange={(e) => setEditingField({
                            ...editingField,
                            validation: {
                              ...editingField.validation,
                              required: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Campo obrigatório</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Valor mínimo
                      </label>
                      <input
                        type="number"
                        value={editingField.validation?.min || ''}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          validation: {
                            ...editingField.validation,
                            min: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        className="input-field"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Valor máximo
                      </label>
                      <input
                        type="number"
                        value={editingField.validation?.max || ''}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          validation: {
                            ...editingField.validation,
                            max: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        className="input-field"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Configurações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingField.isEditable ?? true}
                        onChange={(e) => setEditingField({ ...editingField, isEditable: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Campo editável</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingField.isVisible ?? true}
                        onChange={(e) => setEditingField({ ...editingField, isVisible: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Campo visível</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={cancelEditing}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveField}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditing === 'new' ? 'Criar Campo' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
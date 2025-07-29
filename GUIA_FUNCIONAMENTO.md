# Guia de Funcionamento - ClubFinancePilot

## Sistema de Análise Financeira para Clubes de Futebol

### 1. Entrada de Dados Financeiros (/dashboard/financial-input)

Interface para inserção de dados iniciais:

**Receitas:**
- Aluguel de campos (valores por tipo e horário)
- Mensalidades de sócios
- Escolinha de futebol
- Patrocínios e publicidade
- Eventos e torneios
- Cafeteria e lanchonete

**Custos:**
- Folha de pagamento
- Manutenção de campos
- Utilidades (luz, água, internet)
- Marketing e publicidade
- Seguros e licenças
- Equipamentos e materiais

### 2. **NOVO** Fluxo de Caixa Detalhado (/dashboard/fluxo-caixa)

Interface completamente reformulada com recursos avançados:

#### 2.1 Modos de Visualização

**Visualização Anual:**
- Resumo geral das entradas e saídas
- Distribuição por categorias
- Cards com métricas principais
- Status financeiro visual

**Visualização Mensal:**
- Detalhamento mês por mês
- Edição inline de valores
- Entradas e saídas específicas
- Saldo mensal e acumulado
- Cálculo automático de margem

**Visualização Detalhada:**
- Tabela completa dos 12 meses
- Comparativo visual
- Navegação rápida entre meses
- Análise de tendências

#### 2.2 Recursos de Edição

**Edição Inline:**
- Clique duplo para editar qualquer valor
- Salvamento automático
- Validação em tempo real
- Atualização instantânea dos totais

**Adição de Entradas/Saídas:**
- Modal intuitivo para novos lançamentos
- Categorização automática
- Subcategorias personalizáveis
- Marcação de recorrência
- Sistema de tags

**Categorias Pré-definidas:**

*Entradas:*
- Aluguel de Campos
- Mensalidades
- Escolinha de Futebol
- Patrocínios
- Eventos
- Merchandising
- Alimentação
- Transmissão
- Transferências
- Outros

*Saídas:*
- Pessoal
- Instalações
- Utilidades
- Marketing
- Administrativo
- Seguros
- Impostos
- Equipamentos
- Manutenção
- Tecnologia
- Outros

#### 2.3 Funcionalidades Avançadas

**Filtros e Busca:**
- Filtro por categoria
- Busca por descrição
- Filtro por tipo (entrada/saída)
- Filtro por período

**Cards de Resumo:**
- Total de Entradas (verde)
- Total de Saídas (vermelho)
- Saldo Líquido (azul/laranja)
- Acumulado (roxo)

**Controles de Gestão:**
- Botão "Adicionar" para novos lançamentos
- Botão "Recalcular" para atualizar projeções
- Seletores de ano e mês
- Alternância entre modos de visualização

#### 2.4 Distribuição Automática

O sistema distribui automaticamente os valores anuais das projeções em dados mensais:

**Entradas Base:**
- Receita de campos: distribuída igualmente pelos 12 meses
- Outras receitas: calculadas proporcionalmente

**Saídas Base:**
- Custos de pessoal: distribuídos mensalmente
- Utilidades: distribuídas com base no consumo
- Custos fixos: divididos igualmente

**Customizações:**
- Valores podem ser editados individualmente
- Novos lançamentos são salvos separadamente
- Recorrência pode ser definida para lançamentos automáticos

#### 2.5 Cálculos Automáticos

**Por Mês:**
- Total de Entradas = Σ todas entradas do mês
- Total de Saídas = Σ todas saídas do mês
- Saldo Mensal = Entradas - Saídas
- Margem = (Saldo Mensal / Entradas) × 100

**Acumulado:**
- Saldo Acumulado = Σ saldos mensais até o período
- Indicadores visuais para status positivo/negativo

### 3. Demonstrativo de Resultados (/dashboard/dre)

Relatório financeiro estruturado:
- Receita bruta e líquida
- Custos diretos e indiretos
- EBITDA e margem operacional
- Resultado líquido
- Comparativo anual

### 4. Capital de Giro (/dashboard/capital-giro)

Análise da necessidade de capital:
- Ciclo operacional
- Ciclo financeiro
- Necessidade de capital de giro
- Reserva de segurança

### 5. KPIs Estratégicos (/dashboard/kpis)

Indicadores-chave de performance:
- Taxa de ocupação dos campos
- Receita por campo
- Margem de contribuição
- ROI e payback
- Análise de break-even

### 6. Projeções 2035 (/dashboard/projecoes)

Cenários de longo prazo:
- Crescimento conservador/otimista
- Análise de sensibilidade
- Simulação Monte Carlo
- Valuation do negócio

### 7. Análise de Viabilidade (/dashboard/viabilidade)

Estudo completo de viabilidade:
- VPL (Valor Presente Líquido)
- TIR (Taxa Interna de Retorno)
- Payback descontado
- Índice de rentabilidade

### 8. Valuation (/dashboard/valuation)

Avaliação do clube:
- Método do fluxo de caixa descontado
- Múltiplos de mercado
- Valor patrimonial
- Análise comparativa

### 9. **NOVO** Dados Estratégicos (/dashboard/strategic-data)

Entrada de dados detalhados do Ano 0:
- Informações básicas do clube
- Configuração de campos e infraestrutura
- Dados financeiros iniciais
- Estratégia de mercado
- Recursos humanos
- Compliance e licenças

### 10. **NOVO** Análise Estratégica (/dashboard/strategic-analysis)

Dashboard executivo com:
- KPIs por categoria (financeiros, operacionais, clientes)
- Análise de sensibilidade (Tornado Chart)
- Gestão de riscos
- Simulações Monte Carlo
- Relatórios automatizados

### 11. **NOVO** Campos Customizáveis (/dashboard/custom-fields)

Sistema flexível para:
- Criação de campos personalizados
- Fórmulas de cálculo automático
- Categorização por tipo
- Validação e importação/exportação

## Como Usar o Sistema

### Fluxo de Trabalho Recomendado:

1. **Configuração Inicial:**
   - Acesse `/dashboard/strategic-data`
   - Preencha dados básicos do clube
   - Configure campos e instalações
   - Defina investimentos iniciais

2. **Entrada de Dados Operacionais:**
   - Use `/dashboard/financial-input` para dados básicos
   - Acesse `/dashboard/fluxo-caixa` para detalhamento mensal
   - Adicione lançamentos específicos conforme necessário

3. **Análise e Planejamento:**
   - Revise os KPIs em `/dashboard/kpis`
   - Analise projeções em `/dashboard/projecoes`
   - Execute análise de viabilidade

4. **Monitoramento Contínuo:**
   - Use o fluxo de caixa para acompanhamento mensal
   - Ajuste valores conforme realizado
   - Monitore indicadores de performance

### Dicas de Uso:

**Fluxo de Caixa:**
- Use o modo "Mensal" para gestão do dia a dia
- Modo "Detalhado" para visão geral do ano
- Adicione lançamentos específicos conforme necessário
- Marque itens recorrentes para automação

**Filtros e Busca:**
- Use filtros para focar em categorias específicas
- Busca por descrição para encontrar lançamentos
- Categorize adequadamente para relatórios precisos

**Edição de Valores:**
- Clique no ícone de edição ou dê duplo clique
- Enter para confirmar, Esc para cancelar
- Valores são salvos automaticamente
- Recálculo automático dos totais

## Benefícios da Nova Interface

### 1. **Facilidade de Uso**
- Interface intuitiva e responsiva
- Edição inline sem páginas extras
- Feedback visual imediato
- Navegação simplificada

### 2. **Flexibilidade Total**
- Adicione quantos lançamentos quiser
- Categorize conforme sua necessidade
- Edite valores individuais
- Configure recorrências

### 3. **Controle Detalhado**
- Visão mensal granular
- Acompanhamento do acumulado
- Cálculo automático de margens
- Indicadores visuais de status

### 4. **Produtividade**
- Filtros e busca avançada
- Adição rápida de lançamentos
- Distribuição automática de valores
- Recálculo instantâneo

### 5. **Análise Aprofundada**
- Múltiplos modos de visualização
- Comparativo mensal
- Tendências e padrões
- Dados para tomada de decisão

O sistema agora oferece um controle completo e detalhado do fluxo de caixa, permitindo desde a gestão operacional diária até o planejamento estratégico de longo prazo, tudo em uma interface moderna e intuitiva. 
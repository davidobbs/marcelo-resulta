import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_investment_requirements
from utils.financial_calculations import calculate_npv, calculate_irr, format_currency
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Fluxo de Caixa", page_icon="📈", layout="wide")

st.title("📈 Análise de Fluxo de Caixa")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']
num_fields = st.session_state.get('num_fields', 2)

# Sidebar para configurações
with st.sidebar:
    st.header("⚙️ Configurações do Fluxo de Caixa")
    
    # Período de análise
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2036)), index=0)
    projection_years = st.slider("Anos de Projeção:", 1, 12, 5)
    
    st.markdown("### 💰 Parâmetros Financeiros")
    
    # Receitas
    monthly_revenue_year1 = st.number_input(
        "Receita Mensal Ano 1:", 
        value=60000.0,
        help="Receita mensal esperada no primeiro ano"
    )
    
    revenue_growth = st.slider(
        "Crescimento Anual da Receita:", 
        0.0, 0.30, 
        market_config['growth_potential']
    )
    
    # Custos operacionais
    variable_cost_rate = st.slider(
        "Custos Variáveis (% Receita):", 
        0.0, 0.50, 0.25
    )
    
    monthly_fixed_costs = st.number_input(
        "Custos Fixos Mensais:", 
        value=35000.0,
        help="Salários, aluguel, utilities, etc."
    )
    
    cost_inflation = st.slider(
        "Inflação dos Custos:", 
        0.0, 0.15, 
        market_config['inflation_rate']
    )
    
    st.markdown("### 🏗️ Investimentos")
    
    # Investimento inicial
    investment_data = get_investment_requirements(market, num_fields)
    total_initial_investment = investment_data['total']
    
    st.write(f"**Investimento Calculado:** {format_currency(total_initial_investment, currency)}")
    
    initial_investment = st.number_input(
        "Investimento Inicial Total:", 
        value=float(total_initial_investment),
        help="CAPEX total necessário para iniciar operação"
    )
    
    # Investimentos adicionais
    annual_capex = st.number_input(
        "CAPEX Anual de Manutenção:", 
        value=15000.0,
        help="Investimentos anuais em equipamentos e melhorias"
    )
    
    st.markdown("### 💳 Financiamento")
    
    # Estrutura de capital
    equity_percentage = st.slider("% Capital Próprio:", 0.0, 1.0, 0.7)
    debt_percentage = 1.0 - equity_percentage
    
    if debt_percentage > 0:
        loan_term_years = st.slider("Prazo do Empréstimo (anos):", 1, 10, 5)
        annual_interest_rate = st.slider("Taxa de Juros Anual:", 0.05, 0.25, 0.12)
    else:
        loan_term_years = 0
        annual_interest_rate = 0

# Calcular financiamento
equity_amount = initial_investment * equity_percentage
debt_amount = initial_investment * debt_percentage

# Calcular prestação do empréstimo (se houver)
if debt_amount > 0 and loan_term_years > 0:
    monthly_interest_rate = annual_interest_rate / 12
    num_payments = loan_term_years * 12
    
    if monthly_interest_rate > 0:
        monthly_payment = debt_amount * (monthly_interest_rate * (1 + monthly_interest_rate) ** num_payments) / ((1 + monthly_interest_rate) ** num_payments - 1)
    else:
        monthly_payment = debt_amount / num_payments
else:
    monthly_payment = 0
    num_payments = 0

# Função para calcular fluxo de caixa mensal
def calculate_monthly_cash_flow(year, month, base_revenue, growth_rate, var_cost_rate, fixed_costs, inflation_rate):
    """Calcula fluxo de caixa mensal"""
    
    # Fator de crescimento acumulado
    years_elapsed = year + (month - 1) / 12
    growth_factor = (1 + growth_rate) ** years_elapsed
    inflation_factor = (1 + inflation_rate) ** years_elapsed
    
    # Sazonalidade (exemplo básico)
    seasonal_factors = [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0]
    seasonal_factor = seasonal_factors[month - 1]
    
    # Receitas
    monthly_revenue = base_revenue * growth_factor * seasonal_factor
    
    # Custos
    variable_costs = monthly_revenue * var_cost_rate
    fixed_costs_adjusted = fixed_costs * inflation_factor
    
    # Impostos (simplificado)
    taxes = monthly_revenue * market_config['tax_rate']
    
    # Fluxo operacional
    operational_cash_flow = monthly_revenue - variable_costs - fixed_costs_adjusted - taxes
    
    return {
        'receita': monthly_revenue,
        'custos_variaveis': variable_costs,
        'custos_fixos': fixed_costs_adjusted,
        'impostos': taxes,
        'fluxo_operacional': operational_cash_flow
    }

# Gerar projeções mensais
monthly_projections = []
cumulative_cash = -equity_amount  # Começa com o investimento em capital próprio

for year in range(projection_years):
    for month in range(1, 13):
        # Calcular fluxo do mês
        cash_flow = calculate_monthly_cash_flow(
            year, month, monthly_revenue_year1, revenue_growth,
            variable_cost_rate, monthly_fixed_costs, cost_inflation
        )
        
        # Fluxo de investimento
        investment_flow = 0
        if year == 0 and month == 1:
            investment_flow = -initial_investment
        elif month == 1:  # CAPEX anual
            investment_flow = -annual_capex * (1 + cost_inflation) ** year
        
        # Fluxo de financiamento
        financing_flow = 0
        if year == 0 and month == 1:
            financing_flow = debt_amount  # Entrada do empréstimo
        
        # Pagamento de empréstimo
        loan_payment = 0
        total_months_elapsed = year * 12 + month
        if debt_amount > 0 and total_months_elapsed <= num_payments:
            loan_payment = monthly_payment
            financing_flow -= loan_payment
        
        # Fluxo líquido
        net_cash_flow = cash_flow['fluxo_operacional'] + investment_flow + financing_flow
        cumulative_cash += net_cash_flow
        
        # Adicionar aos dados
        monthly_projections.append({
            'ano': start_year + year,
            'mes': month,
            'periodo': f"{month:02d}/{start_year + year}",
            'mes_absoluto': year * 12 + month,
            'receita': cash_flow['receita'],
            'custos_variaveis': cash_flow['custos_variaveis'],
            'custos_fixos': cash_flow['custos_fixos'],
            'impostos': cash_flow['impostos'],
            'fluxo_operacional': cash_flow['fluxo_operacional'],
            'fluxo_investimento': investment_flow,
            'fluxo_financiamento': financing_flow,
            'pagamento_emprestimo': loan_payment,
            'fluxo_liquido': net_cash_flow,
            'saldo_acumulado': cumulative_cash
        })

# Criar DataFrame
cf_df = pd.DataFrame(monthly_projections)

# Agregação anual
annual_cf = cf_df.groupby('ano').agg({
    'receita': 'sum',
    'custos_variaveis': 'sum',
    'custos_fixos': 'sum',
    'impostos': 'sum',
    'fluxo_operacional': 'sum',
    'fluxo_investimento': 'sum',
    'fluxo_financiamento': 'sum',
    'fluxo_liquido': 'sum'
}).reset_index()

annual_cf['saldo_final'] = cf_df.groupby('ano')['saldo_acumulado'].last().values

# Interface principal
col1, col2 = st.columns([3, 1])

with col2:
    st.markdown("### 📋 Resumo dos Parâmetros")
    st.write(f"**Mercado:** {market}")
    st.write(f"**Período:** {projection_years} anos")
    st.write(f"**Investimento:** {format_currency(initial_investment, currency)}")
    st.write(f"**Capital Próprio:** {format_currency(equity_amount, currency)} ({equity_percentage:.1%})")
    if debt_amount > 0:
        st.write(f"**Empréstimo:** {format_currency(debt_amount, currency)} ({debt_percentage:.1%})")
        st.write(f"**Prestação:** {format_currency(monthly_payment, currency)}/mês")
    st.write(f"**Crescimento:** {revenue_growth:.1%} aa")

with col1:
    st.markdown("### 📊 Fluxo de Caixa Anual")
    
    # Tabela resumo anual
    display_annual = annual_cf.copy()
    monetary_cols = ['receita', 'custos_variaveis', 'custos_fixos', 'impostos', 
                    'fluxo_operacional', 'fluxo_investimento', 'fluxo_financiamento', 
                    'fluxo_liquido', 'saldo_final']
    
    for col in monetary_cols:
        display_annual[f'{col}_fmt'] = display_annual[col].apply(lambda x: format_currency(x, currency))
    
    # Selecionar colunas para exibição
    display_cols = ['ano', 'receita_fmt', 'fluxo_operacional_fmt', 'fluxo_investimento_fmt', 
                   'fluxo_financiamento_fmt', 'fluxo_liquido_fmt', 'saldo_final_fmt']
    
    display_annual_final = display_annual[display_cols].copy()
    display_annual_final.columns = ['Ano', 'Receita', 'Fluxo Operacional', 'Fluxo Investimento', 
                                   'Fluxo Financiamento', 'Fluxo Líquido', 'Saldo Acumulado']
    
    st.dataframe(display_annual_final, use_container_width=True)

# Gráficos de análise
st.markdown("## 📊 Análises Gráficas")

tab1, tab2, tab3, tab4 = st.tabs(["Fluxo de Caixa", "Evolução Mensal", "Estrutura de Custos", "Análise de Sensibilidade"])

with tab1:
    # Gráfico de fluxo de caixa anual
    fig_annual = go.Figure()
    
    fig_annual.add_trace(go.Bar(
        x=annual_cf['ano'],
        y=annual_cf['fluxo_operacional'],
        name='Fluxo Operacional',
        marker_color='blue'
    ))
    
    fig_annual.add_trace(go.Bar(
        x=annual_cf['ano'],
        y=annual_cf['fluxo_investimento'],
        name='Fluxo de Investimento',
        marker_color='red'
    ))
    
    fig_annual.add_trace(go.Bar(
        x=annual_cf['ano'],
        y=annual_cf['fluxo_financiamento'],
        name='Fluxo de Financiamento',
        marker_color='orange'
    ))
    
    fig_annual.add_trace(go.Scatter(
        x=annual_cf['ano'],
        y=annual_cf['saldo_final'],
        name='Saldo Acumulado',
        line=dict(color='green', width=3),
        mode='lines+markers',
        yaxis='y2'
    ))
    
    fig_annual.update_layout(
        title='Fluxo de Caixa Anual',
        xaxis_title='Ano',
        yaxis_title=f'Fluxo Anual ({currency})',
        yaxis2=dict(
            title=f'Saldo Acumulado ({currency})',
            side='right',
            overlaying='y'
        ),
        barmode='relative'
    )
    
    st.plotly_chart(fig_annual, use_container_width=True)

with tab2:
    # Evolução mensal (primeiro ano)
    first_year_data = cf_df[cf_df['ano'] == start_year]
    
    fig_monthly = go.Figure()
    
    fig_monthly.add_trace(go.Bar(
        x=first_year_data['mes'],
        y=first_year_data['receita'],
        name='Receita',
        marker_color='lightblue'
    ))
    
    fig_monthly.add_trace(go.Bar(
        x=first_year_data['mes'],
        y=-(first_year_data['custos_variaveis'] + first_year_data['custos_fixos'] + first_year_data['impostos']),
        name='Custos Totais',
        marker_color='lightcoral'
    ))
    
    fig_monthly.add_trace(go.Scatter(
        x=first_year_data['mes'],
        y=first_year_data['fluxo_operacional'],
        name='Fluxo Operacional',
        line=dict(color='green', width=3),
        mode='lines+markers'
    ))
    
    fig_monthly.update_layout(
        title=f'Evolução Mensal - {start_year}',
        xaxis_title='Mês',
        yaxis_title=f'Valor ({currency})'
    )
    
    st.plotly_chart(fig_monthly, use_container_width=True)

with tab3:
    # Estrutura de custos por ano
    cost_structure = annual_cf.copy()
    cost_structure['outros_custos'] = cost_structure['receita'] - cost_structure['custos_variaveis'] - cost_structure['custos_fixos'] - cost_structure['impostos'] - cost_structure['fluxo_operacional']
    
    fig_costs = go.Figure()
    
    fig_costs.add_trace(go.Bar(
        x=cost_structure['ano'],
        y=cost_structure['custos_variaveis'],
        name='Custos Variáveis',
        marker_color='lightblue'
    ))
    
    fig_costs.add_trace(go.Bar(
        x=cost_structure['ano'],
        y=cost_structure['custos_fixos'],
        name='Custos Fixos',
        marker_color='orange'
    ))
    
    fig_costs.add_trace(go.Bar(
        x=cost_structure['ano'],
        y=cost_structure['impostos'],
        name='Impostos',
        marker_color='red'
    ))
    
    fig_costs.add_trace(go.Bar(
        x=cost_structure['ano'],
        y=cost_structure['fluxo_operacional'],
        name='Lucro Operacional',
        marker_color='green'
    ))
    
    fig_costs.update_layout(
        title='Estrutura de Custos e Rentabilidade',
        xaxis_title='Ano',
        yaxis_title=f'Valor ({currency})',
        barmode='stack'
    )
    
    st.plotly_chart(fig_costs, use_container_width=True)

with tab4:
    st.markdown("### 🎲 Análise de Sensibilidade")
    
    # Parâmetros para análise
    sensitivity_param = st.selectbox(
        "Parâmetro para Análise:",
        options=["Receita", "Custos Fixos", "Custos Variáveis", "Taxa de Crescimento"]
    )
    
    variation_range = st.slider("Variação (%):", 10, 50, 20)
    
    # Calcular cenários
    base_npv = calculate_npv(annual_cf['fluxo_liquido'].tolist(), market_config['discount_rate'])
    
    variations = np.arange(-variation_range/100, variation_range/100 + 0.01, 0.05)
    sensitivity_results = []
    
    for var in variations:
        # Ajustar parâmetro conforme seleção
        if sensitivity_param == "Receita":
            adjusted_revenue = monthly_revenue_year1 * (1 + var)
            test_cf = []
            for year in range(projection_years):
                for month in range(1, 13):
                    cf = calculate_monthly_cash_flow(
                        year, month, adjusted_revenue, revenue_growth,
                        variable_cost_rate, monthly_fixed_costs, cost_inflation
                    )
                    if year == 0 and month == 1:
                        cf['fluxo_operacional'] -= initial_investment
                    test_cf.append(cf['fluxo_operacional'])
            
        elif sensitivity_param == "Custos Fixos":
            adjusted_fixed = monthly_fixed_costs * (1 + var)
            test_cf = []
            for year in range(projection_years):
                for month in range(1, 13):
                    cf = calculate_monthly_cash_flow(
                        year, month, monthly_revenue_year1, revenue_growth,
                        variable_cost_rate, adjusted_fixed, cost_inflation
                    )
                    if year == 0 and month == 1:
                        cf['fluxo_operacional'] -= initial_investment
                    test_cf.append(cf['fluxo_operacional'])
        
        # Agrupar por ano
        annual_test_cf = []
        for year in range(projection_years):
            year_sum = sum(test_cf[year*12:(year+1)*12])
            annual_test_cf.append(year_sum)
        
        test_npv = calculate_npv(annual_test_cf, market_config['discount_rate'])
        
        sensitivity_results.append({
            'variacao_percent': var * 100,
            'npv': test_npv,
            'npv_change': ((test_npv - base_npv) / base_npv * 100) if base_npv != 0 else 0
        })
    
    sensitivity_df = pd.DataFrame(sensitivity_results)
    
    fig_sensitivity = go.Figure()
    
    fig_sensitivity.add_trace(go.Scatter(
        x=sensitivity_df['variacao_percent'],
        y=sensitivity_df['npv'],
        mode='lines+markers',
        name='NPV',
        line=dict(color='blue', width=3)
    ))
    
    fig_sensitivity.add_hline(y=0, line_dash="dash", line_color="red")
    fig_sensitivity.add_vline(x=0, line_dash="dash", line_color="gray")
    
    fig_sensitivity.update_layout(
        title=f'Sensibilidade do NPV à variação em {sensitivity_param}',
        xaxis_title='Variação (%)',
        yaxis_title=f'NPV ({currency})'
    )
    
    st.plotly_chart(fig_sensitivity, use_container_width=True)

# Indicadores financeiros
st.markdown("## 🎯 Indicadores Financeiros")

# Calcular indicadores
cash_flows_for_calc = annual_cf['fluxo_liquido'].tolist()
cash_flows_for_calc[0] -= equity_amount  # Ajustar primeiro ano

npv = calculate_npv(cash_flows_for_calc, market_config['discount_rate'])
irr = calculate_irr(cash_flows_for_calc)

# Payback simples
cumulative = 0
payback_period = None
for i, cf in enumerate(cash_flows_for_calc):
    cumulative += cf
    if cumulative >= 0:
        payback_period = i + (cumulative - cf) / cf if cf != 0 else i
        break

# ROI
total_investment_equity = equity_amount
total_returns = annual_cf['fluxo_operacional'].sum()
roi = (total_returns - total_investment_equity) / total_investment_equity if total_investment_equity > 0 else 0

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        "NPV (Valor Presente Líquido)",
        format_currency(npv, currency),
        delta="Positivo" if npv > 0 else "Negativo"
    )

with col2:
    irr_display = f"{irr*100:.1f}%" if irr else "N/A"
    benchmark = market_config['discount_rate'] * 100
    st.metric(
        "TIR (Taxa Interna de Retorno)",
        irr_display,
        delta=f"vs {benchmark:.1f}% (custo capital)"
    )

with col3:
    payback_display = f"{payback_period:.1f} anos" if payback_period else "N/A"
    st.metric(
        "Payback Period",
        payback_display,
        delta="Tempo de retorno"
    )

with col4:
    st.metric(
        "ROI Total",
        f"{roi*100:.1f}%",
        delta=f"Sobre {format_currency(total_investment_equity, currency)}"
    )

# Análise de viabilidade
st.markdown("### 📊 Análise de Viabilidade")

viability_score = 0
viability_factors = []

if npv > 0:
    viability_score += 25
    viability_factors.append("✅ NPV positivo")
else:
    viability_factors.append("❌ NPV negativo")

if irr and irr > market_config['discount_rate']:
    viability_score += 25
    viability_factors.append("✅ TIR superior ao custo de capital")
else:
    viability_factors.append("❌ TIR inferior ao custo de capital")

if payback_period and payback_period <= 4:
    viability_score += 25
    viability_factors.append("✅ Payback em até 4 anos")
else:
    viability_factors.append("❌ Payback superior a 4 anos")

if cf_df['saldo_acumulado'].iloc[-1] > 0:
    viability_score += 25
    viability_factors.append("✅ Saldo de caixa positivo no final")
else:
    viability_factors.append("❌ Saldo de caixa negativo no final")

col1, col2 = st.columns([1, 2])

with col1:
    # Gauge de viabilidade
    fig_gauge = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = viability_score,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Score de Viabilidade"},
        gauge = {
            'axis': {'range': [None, 100]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 25], 'color': "lightgray"},
                {'range': [25, 50], 'color': "yellow"},
                {'range': [50, 75], 'color': "orange"},
                {'range': [75, 100], 'color': "green"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 75
            }
        }
    ))
    
    fig_gauge.update_layout(height=300)
    st.plotly_chart(fig_gauge, use_container_width=True)

with col2:
    st.markdown("**Fatores de Viabilidade:**")
    for factor in viability_factors:
        st.write(factor)
    
    if viability_score >= 75:
        st.success("🎯 **Projeto Viável**: Indicadores financeiros favoráveis.")
    elif viability_score >= 50:
        st.warning("⚠️ **Projeto Questionável**: Alguns indicadores desfavoráveis.")
    else:
        st.error("❌ **Projeto Inviável**: Maioria dos indicadores desfavoráveis.")

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'Fluxo_Caixa_Mensal': cf_df,
    'Fluxo_Caixa_Anual': annual_cf,
    'Indicadores': pd.DataFrame([{
        'NPV': npv,
        'IRR': irr,
        'ROI': roi,
        'Payback': payback_period,
        'Score_Viabilidade': viability_score
    }]),
    'Sensibilidade': sensitivity_df
}

export_to_streamlit(export_data, "fluxo_de_caixa")

# Recomendações finais
st.markdown("## 💡 Recomendações Estratégicas")

recommendations = []

if npv < 0:
    recommendations.append("📉 **Revisar Premissas**: NPV negativo indica necessidade de otimização de receitas ou redução de custos.")

if debt_percentage > 0.5:
    recommendations.append("💳 **Alto Endividamento**: Considere reduzir alavancagem para diminuir risco financeiro.")

if payback_period and payback_period > 5:
    recommendations.append("⏱️ **Payback Longo**: Período de retorno extenso aumenta exposição a riscos de mercado.")

max_negative_cash = cf_df['saldo_acumulado'].min()
if max_negative_cash < -initial_investment * 0.2:
    recommendations.append(f"💰 **Necessidade de Capital**: Prepare reserva adicional de {format_currency(abs(max_negative_cash), currency)} para cobrir fluxo negativo.")

avg_monthly_operational = cf_df['fluxo_operacional'].mean()
if avg_monthly_operational < monthly_fixed_costs * 1.2:
    recommendations.append("⚠️ **Margem Apertada**: Fluxo operacional próximo aos custos fixos. Monitore ocupação das quadras.")

if len(recommendations) == 0:
    recommendations.append("✅ **Projeto Bem Estruturado**: Fluxo de caixa apresenta características favoráveis.")

for rec in recommendations:
    st.info(rec)

st.warning("⚠️ **Importante**: As projeções são baseadas nas premissas inseridas. Monitore mensalmente os resultados reais e ajuste as projeções conforme necessário. Mantenha sempre uma reserva de caixa para contingências.")

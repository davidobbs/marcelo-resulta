import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_seasonal_factors, get_industry_benchmarks
from utils.financial_calculations import (
    calculate_npv, calculate_irr, project_revenue, 
    monte_carlo_simulation, format_currency
)
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Projeções 2035", page_icon="🔮", layout="wide")

st.title("🔮 Projeções Estratégicas até 2035")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']
num_fields = st.session_state.get('num_fields', 2)

# Sidebar para configurações de longo prazo
with st.sidebar:
    st.header("⚙️ Configurações de Projeção")
    
    # Período fixo até 2035
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2030)), index=0)
    end_year = 2035
    projection_years = end_year - start_year + 1
    
    st.info(f"📅 Projeção: {start_year} - {end_year} ({projection_years} anos)")
    
    st.markdown("### 📊 Cenários de Crescimento")
    
    # Cenários macroeconômicos
    scenario_type = st.selectbox(
        "Cenário Principal:",
        ["Conservador", "Base", "Otimista", "Personalizado"],
        index=1
    )
    
    if scenario_type == "Personalizado":
        custom_growth = st.slider("Crescimento Médio Anual:", 0.0, 0.25, 0.08)
        custom_volatility = st.slider("Volatilidade:", 0.0, 0.30, 0.15)
    else:
        # Cenários predefinidos baseados no mercado
        scenarios = {
            "Conservador": {"growth": market_config['growth_potential'] * 0.6, "volatility": 0.20},
            "Base": {"growth": market_config['growth_potential'], "volatility": 0.15},
            "Otimista": {"growth": market_config['growth_potential'] * 1.4, "volatility": 0.25}
        }
        custom_growth = scenarios[scenario_type]["growth"]
        custom_volatility = scenarios[scenario_type]["volatility"]
    
    st.markdown("### 💰 Parâmetros Base")
    
    # Receita inicial
    initial_annual_revenue = st.number_input(
        "Receita Anual Inicial:", 
        value=600000.0,
        help="Receita do primeiro ano completo de operação"
    )
    
    # Margem operacional
    base_ebitda_margin = st.slider(
        "Margem EBITDA Base (%):", 
        0.05, 0.50, 0.25
    )
    
    # Investimentos
    annual_capex_rate = st.slider(
        "CAPEX Anual (% da receita):", 
        0.02, 0.15, 0.05
    )
    
    st.markdown("### 🌟 Fatores de Evolução")
    
    # Evolução da margem
    margin_improvement = st.slider(
        "Melhoria da Margem (pontos % por ano):", 
        0.0, 2.0, 0.5
    )
    
    # Expansão de capacidade
    expansion_years = st.multiselect(
        "Anos de Expansão:",
        options=list(range(start_year + 2, end_year + 1)),
        default=[start_year + 3, start_year + 7],
        help="Anos em que haverá expansão de quadras"
    )
    
    expansion_capacity = st.slider(
        "Aumento de Capacidade por Expansão (%):",
        20, 100, 50
    )
    
    st.markdown("### 🔄 Fatores Externos")
    
    # Impacto de tendências
    digitalization_impact = st.slider(
        "Impacto da Digitalização (% adicional):", 
        0, 15, 5
    )
    
    sustainability_bonus = st.slider(
        "Bônus Sustentabilidade (% adicional):", 
        0, 10, 3
    )
    
    market_maturation = st.slider(
        "Maturação do Mercado (redução % ao ano):", 
        0.0, 2.0, 0.5
    )

# Função para calcular projeções com múltiplos fatores
def calculate_long_term_projections(years, base_revenue, base_growth, volatility, margin_base, margin_improvement, expansion_years, expansion_rate):
    """Calcula projeções de longo prazo com múltiplos cenários"""
    
    projections = []
    current_capacity = 1.0  # Capacidade base
    current_revenue = base_revenue
    
    for year in range(years):
        year_number = start_year + year
        
        # Crescimento base com maturação
        maturation_factor = max(0.02, base_growth - (market_maturation / 100) * year)
        
        # Volatilidade cíclica (simula ciclos econômicos)
        cycle_factor = 1 + (volatility * 0.5 * np.sin(2 * np.pi * year / 7))  # Ciclo de 7 anos
        
        # Crescimento orgânico
        organic_growth = maturation_factor * cycle_factor
        
        # Expansão de capacidade
        if year_number in expansion_years:
            current_capacity *= (1 + expansion_rate / 100)
            expansion_boost = expansion_rate / 100 * 0.8  # 80% do aumento é realizado no primeiro ano
        else:
            expansion_boost = 0
        
        # Fatores tecnológicos e sustentabilidade
        tech_factor = min(0.15, (digitalization_impact / 100) * year / 5)  # Crescimento gradual
        sustainability_factor = min(0.10, (sustainability_bonus / 100) * year / 3)
        
        # Crescimento total
        total_growth = organic_growth + expansion_boost + tech_factor + sustainability_factor
        current_revenue *= (1 + total_growth)
        
        # Margem EBITDA evolutiva
        current_margin = min(0.50, margin_base + (margin_improvement / 100) * year)
        
        # Calcular valores
        ebitda = current_revenue * current_margin
        
        # Custos estimados
        variable_costs = current_revenue * 0.30  # 30% custos variáveis
        fixed_costs = current_revenue * (0.70 - current_margin)  # Resto são custos fixos
        
        # CAPEX
        capex = current_revenue * (annual_capex_rate / 100)
        
        # Depreciação (10% dos ativos)
        accumulated_capex = capex * (year + 1) * 2  # Estimativa de base de ativos
        depreciation = accumulated_capex * 0.10
        
        # EBIT
        ebit = ebitda - depreciation
        
        # Impostos
        taxes = max(0, ebit * market_config['tax_rate'])
        
        # Lucro líquido
        net_income = ebit - taxes
        
        # Fluxo de caixa livre
        free_cash_flow = net_income + depreciation - capex
        
        projections.append({
            'ano': year_number,
            'receita': current_revenue,
            'crescimento_anual': total_growth * 100,
            'ebitda': ebitda,
            'ebitda_margin': current_margin * 100,
            'ebit': ebit,
            'net_income': net_income,
            'capex': capex,
            'free_cash_flow': free_cash_flow,
            'capacidade_relativa': current_capacity,
            'custos_variaveis': variable_costs,
            'custos_fixos': fixed_costs,
            'impostos': taxes,
            'depreciacao': depreciation
        })
    
    return projections

# Calcular projeções principais
main_projections = calculate_long_term_projections(
    projection_years, initial_annual_revenue, custom_growth, custom_volatility,
    base_ebitda_margin, margin_improvement, expansion_years, expansion_capacity
)

# Criar DataFrame principal
proj_df = pd.DataFrame(main_projections)

# Calcular cenários alternativos
conservative_proj = calculate_long_term_projections(
    projection_years, initial_annual_revenue, custom_growth * 0.6, custom_volatility * 1.5,
    base_ebitda_margin * 0.8, margin_improvement * 0.5, [], 0
)

optimistic_proj = calculate_long_term_projections(
    projection_years, initial_annual_revenue, custom_growth * 1.4, custom_volatility * 0.8,
    base_ebitda_margin * 1.1, margin_improvement * 1.5, expansion_years, expansion_capacity * 1.5
)

# Interface principal
st.markdown("## 📈 Visão Geral das Projeções")

col1, col2, col3 = st.columns(3)

# Métricas principais
final_revenue = proj_df['receita'].iloc[-1]
initial_revenue = proj_df['receita'].iloc[0]
cagr = ((final_revenue / initial_revenue) ** (1 / (projection_years - 1)) - 1) * 100

total_free_cf = proj_df['free_cash_flow'].sum()
total_investment = proj_df['capex'].sum()

with col1:
    st.metric(
        "Receita Final (2035)",
        format_currency(final_revenue, currency),
        delta=f"CAGR: {cagr:.1f}%"
    )

with col2:
    st.metric(
        "Fluxo de Caixa Livre Acumulado",
        format_currency(total_free_cf, currency),
        delta="Período completo"
    )

with col3:
    st.metric(
        "Investimento Total",
        format_currency(total_investment, currency),
        delta=f"CAPEX acumulado"
    )

# Gráfico principal de evolução
st.markdown("### 📊 Evolução de Longo Prazo")

fig_main = go.Figure()

# Cenário base
fig_main.add_trace(go.Scatter(
    x=proj_df['ano'],
    y=proj_df['receita'],
    name='Cenário Base',
    line=dict(color='blue', width=3),
    mode='lines+markers'
))

# Cenários alternativos
conservative_df = pd.DataFrame(conservative_proj)
optimistic_df = pd.DataFrame(optimistic_proj)

fig_main.add_trace(go.Scatter(
    x=conservative_df['ano'],
    y=conservative_df['receita'],
    name='Cenário Conservador',
    line=dict(color='red', dash='dash', width=2),
    mode='lines'
))

fig_main.add_trace(go.Scatter(
    x=optimistic_df['ano'],
    y=optimistic_df['receita'],
    name='Cenário Otimista',
    line=dict(color='green', dash='dash', width=2),
    mode='lines'
))

# Marcar anos de expansão
for exp_year in expansion_years:
    fig_main.add_vline(x=exp_year, line_dash="dot", line_color="orange", 
                      annotation_text=f"Expansão {exp_year}")

fig_main.update_layout(
    title='Projeção de Receita até 2035 - Múltiplos Cenários',
    xaxis_title='Ano',
    yaxis_title=f'Receita Anual ({currency})',
    hovermode='x unified'
)

st.plotly_chart(fig_main, use_container_width=True)

# Análises detalhadas
st.markdown("## 📊 Análises Detalhadas")

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "Rentabilidade", 
    "Fluxo de Caixa", 
    "Análise de Riscos", 
    "Marcos Estratégicos",
    "Valuation"
])

with tab1:
    # Análise de rentabilidade
    fig_profit = go.Figure()
    
    fig_profit.add_trace(go.Scatter(
        x=proj_df['ano'],
        y=proj_df['ebitda_margin'],
        name='Margem EBITDA (%)',
        line=dict(color='blue'),
        yaxis='y'
    ))
    
    fig_profit.add_trace(go.Bar(
        x=proj_df['ano'],
        y=proj_df['ebitda'],
        name='EBITDA',
        marker_color='lightblue',
        yaxis='y2',
        opacity=0.7
    ))
    
    fig_profit.update_layout(
        title='Evolução da Rentabilidade',
        xaxis_title='Ano',
        yaxis=dict(title='Margem EBITDA (%)', side='left'),
        yaxis2=dict(title=f'EBITDA ({currency})', side='right', overlaying='y')
    )
    
    st.plotly_chart(fig_profit, use_container_width=True)
    
    # Tabela de rentabilidade
    st.markdown("#### 📋 Detalhamento da Rentabilidade")
    
    profit_summary = proj_df[['ano', 'receita', 'ebitda', 'ebitda_margin', 'net_income']].copy()
    
    # Formatar valores
    profit_summary['receita_fmt'] = profit_summary['receita'].apply(lambda x: format_currency(x, currency))
    profit_summary['ebitda_fmt'] = profit_summary['ebitda'].apply(lambda x: format_currency(x, currency))
    profit_summary['net_income_fmt'] = profit_summary['net_income'].apply(lambda x: format_currency(x, currency))
    profit_summary['ebitda_margin_fmt'] = profit_summary['ebitda_margin'].apply(lambda x: f"{x:.1f}%")
    
    display_profit = profit_summary[['ano', 'receita_fmt', 'ebitda_fmt', 'ebitda_margin_fmt', 'net_income_fmt']]
    display_profit.columns = ['Ano', 'Receita', 'EBITDA', 'Margem EBITDA', 'Lucro Líquido']
    
    st.dataframe(display_profit, use_container_width=True)

with tab2:
    # Análise de fluxo de caixa
    fig_cashflow = go.Figure()
    
    # Fluxo de caixa livre anual
    fig_cashflow.add_trace(go.Bar(
        x=proj_df['ano'],
        y=proj_df['free_cash_flow'],
        name='Fluxo de Caixa Livre',
        marker_color=['green' if x > 0 else 'red' for x in proj_df['free_cash_flow']]
    ))
    
    # Linha de CAPEX
    fig_cashflow.add_trace(go.Scatter(
        x=proj_df['ano'],
        y=-proj_df['capex'],
        name='CAPEX (negativo)',
        line=dict(color='orange', dash='dash'),
        mode='lines+markers'
    ))
    
    fig_cashflow.update_layout(
        title='Fluxo de Caixa Livre e Investimentos',
        xaxis_title='Ano',
        yaxis_title=f'Valor ({currency})'
    )
    
    st.plotly_chart(fig_cashflow, use_container_width=True)
    
    # Fluxo de caixa acumulado
    proj_df['fcf_acumulado'] = proj_df['free_cash_flow'].cumsum()
    
    fig_cumulative = go.Figure()
    
    fig_cumulative.add_trace(go.Scatter(
        x=proj_df['ano'],
        y=proj_df['fcf_acumulado'],
        name='FCF Acumulado',
        line=dict(color='green', width=3),
        mode='lines+markers',
        fill='tonexty'
    ))
    
    fig_cumulative.add_hline(y=0, line_dash="dash", line_color="red")
    
    fig_cumulative.update_layout(
        title='Fluxo de Caixa Livre Acumulado',
        xaxis_title='Ano',
        yaxis_title=f'FCF Acumulado ({currency})'
    )
    
    st.plotly_chart(fig_cumulative, use_container_width=True)

with tab3:
    # Análise de riscos
    st.markdown("### 🎲 Simulação Monte Carlo")
    
    # Parâmetros para simulação
    num_simulations = st.slider("Número de Simulações:", 100, 2000, 1000)
    
    if st.button("🎯 Executar Simulação"):
        # Definir variáveis de incerteza
        base_values = {
            'revenue_growth': custom_growth,
            'ebitda_margin': base_ebitda_margin,
            'market_risk': 0.0
        }
        
        uncertainties = {
            'revenue_growth': custom_volatility,
            'ebitda_margin': 0.10,  # 10% de incerteza na margem
            'market_risk': 0.15  # 15% de risco de mercado
        }
        
        # Executar simulação
        simulation_results = []
        
        for _ in range(num_simulations):
            # Gerar fatores aleatórios
            growth_factor = np.random.normal(1, uncertainties['revenue_growth'])
            margin_factor = np.random.normal(1, uncertainties['ebitda_margin'])
            market_factor = np.random.normal(1, uncertainties['market_risk'])
            
            # Ajustar parâmetros
            sim_growth = base_values['revenue_growth'] * growth_factor * market_factor
            sim_margin = base_values['ebitda_margin'] * margin_factor
            
            # Calcular projeção para a simulação
            sim_proj = calculate_long_term_projections(
                projection_years, initial_annual_revenue, sim_growth, 0,
                sim_margin, margin_improvement, expansion_years, expansion_capacity
            )
            
            sim_df = pd.DataFrame(sim_proj)
            final_fcf = sim_df['free_cash_flow'].sum()
            final_revenue = sim_df['receita'].iloc[-1]
            
            simulation_results.append({
                'final_revenue': final_revenue,
                'total_fcf': final_fcf,
                'revenue_cagr': ((final_revenue / initial_annual_revenue) ** (1 / (projection_years - 1)) - 1) * 100
            })
        
        sim_results_df = pd.DataFrame(simulation_results)
        
        # Mostrar resultados da simulação
        col1, col2, col3 = st.columns(3)
        
        with col1:
            mean_revenue = sim_results_df['final_revenue'].mean()
            std_revenue = sim_results_df['final_revenue'].std()
            st.metric(
                "Receita 2035 (Média)",
                format_currency(mean_revenue, currency),
                delta=f"±{format_currency(std_revenue, currency)}"
            )
        
        with col2:
            mean_fcf = sim_results_df['total_fcf'].mean()
            std_fcf = sim_results_df['total_fcf'].std()
            st.metric(
                "FCF Total (Média)",
                format_currency(mean_fcf, currency),
                delta=f"±{format_currency(std_fcf, currency)}"
            )
        
        with col3:
            positive_fcf_prob = (sim_results_df['total_fcf'] > 0).mean() * 100
            st.metric(
                "Probabilidade FCF > 0",
                f"{positive_fcf_prob:.1f}%",
                delta="Sucesso"
            )
        
        # Histograma dos resultados
        fig_hist = go.Figure()
        
        fig_hist.add_trace(go.Histogram(
            x=sim_results_df['final_revenue'],
            name='Receita 2035',
            nbinsx=50,
            marker_color='blue',
            opacity=0.7
        ))
        
        fig_hist.add_vline(x=mean_revenue, line_dash="dash", line_color="red", 
                          annotation_text="Média")
        
        fig_hist.update_layout(
            title='Distribuição da Receita Final (Simulação Monte Carlo)',
            xaxis_title=f'Receita em 2035 ({currency})',
            yaxis_title='Frequência'
        )
        
        st.plotly_chart(fig_hist, use_container_width=True)
        
        # Percentis de risco
        percentiles = [5, 25, 50, 75, 95]
        revenue_percentiles = np.percentile(sim_results_df['final_revenue'], percentiles)
        fcf_percentiles = np.percentile(sim_results_df['total_fcf'], percentiles)
        
        risk_df = pd.DataFrame({
            'Percentil': [f"P{p}" for p in percentiles],
            'Receita_2035': [format_currency(v, currency) for v in revenue_percentiles],
            'FCF_Total': [format_currency(v, currency) for v in fcf_percentiles]
        })
        
        st.markdown("#### 📊 Análise de Percentis (Risco)")
        st.dataframe(risk_df, use_container_width=True)
    
    else:
        st.info("👆 Clique no botão acima para executar a simulação Monte Carlo")

with tab4:
    # Marcos estratégicos
    st.markdown("### 🎯 Marcos Estratégicos e Pontos de Inflexão")
    
    # Identificar marcos importantes
    milestones = []
    
    # Primeiro ano com FCF positivo
    positive_fcf_years = proj_df[proj_df['free_cash_flow'] > 0]
    if not positive_fcf_years.empty:
        first_positive_year = positive_fcf_years['ano'].iloc[0]
        milestones.append({
            'Ano': first_positive_year,
            'Marco': 'Primeiro FCF Positivo',
            'Valor': format_currency(positive_fcf_years['free_cash_flow'].iloc[0], currency),
            'Significado': 'Início da geração consistente de caixa'
        })
    
    # Anos de expansão
    for exp_year in expansion_years:
        milestone_row = proj_df[proj_df['ano'] == exp_year]
        if not milestone_row.empty:
            milestones.append({
                'Ano': exp_year,
                'Marco': 'Expansão de Capacidade',
                'Valor': f"+{expansion_capacity}%",
                'Significado': 'Aumento significativo da capacidade operacional'
            })
    
    # Receita de R$ 1 milhão (ou equivalente)
    million_threshold = 1000000 if currency == "R$" else 500000
    million_years = proj_df[proj_df['receita'] >= million_threshold]
    if not million_years.empty:
        million_year = million_years['ano'].iloc[0]
        milestones.append({
            'Ano': million_year,
            'Marco': f'Receita {format_currency(million_threshold, currency)}',
            'Valor': format_currency(million_years['receita'].iloc[0], currency),
            'Significado': 'Marco de escala significativa'
        })
    
    # Margem EBITDA > 30%
    high_margin_years = proj_df[proj_df['ebitda_margin'] >= 30]
    if not high_margin_years.empty:
        high_margin_year = high_margin_years['ano'].iloc[0]
        milestones.append({
            'Ano': high_margin_year,
            'Marco': 'Margem EBITDA > 30%',
            'Valor': f"{high_margin_years['ebitda_margin'].iloc[0]:.1f}%",
            'Significado': 'Atingimento de alta eficiência operacional'
        })
    
    if milestones:
        milestones_df = pd.DataFrame(milestones)
        st.dataframe(milestones_df, use_container_width=True)
    else:
        st.info("Nenhum marco estratégico identificado no período.")
    
    # Análise de fases do negócio
    st.markdown("#### 📈 Fases do Desenvolvimento do Negócio")
    
    phases = []
    
    # Fase inicial (primeiros 2-3 anos)
    initial_phase = proj_df.head(3)
    avg_growth_initial = initial_phase['crescimento_anual'].mean()
    
    phases.append({
        'Fase': 'Estabelecimento (Anos 1-3)',
        'Característica': 'Crescimento acelerado e estruturação',
        'Crescimento_Médio': f"{avg_growth_initial:.1f}%",
        'Foco': 'Ocupação das quadras e construção da base de clientes'
    })
    
    # Fase de crescimento (anos intermediários)
    if len(proj_df) > 6:
        growth_phase = proj_df.iloc[3:7]
        avg_growth_growth = growth_phase['crescimento_anual'].mean()
        
        phases.append({
            'Fase': 'Crescimento (Anos 4-7)',
            'Característica': 'Expansão e otimização',
            'Crescimento_Médio': f"{avg_growth_growth:.1f}%",
            'Foco': 'Expansão de capacidade e diversificação de receitas'
        })
    
    # Fase de maturidade
    if len(proj_df) > 7:
        maturity_phase = proj_df.iloc[7:]
        avg_growth_maturity = maturity_phase['crescimento_anual'].mean()
        
        phases.append({
            'Fase': 'Maturidade (Anos 8+)',
            'Característica': 'Estabilização e eficiência',
            'Crescimento_Médio': f"{avg_growth_maturity:.1f}%",
            'Foco': 'Maximização de margens e inovação'
        })
    
    phases_df = pd.DataFrame(phases)
    st.dataframe(phases_df, use_container_width=True)

with tab5:
    # Valuation e valor terminal
    st.markdown("### 💎 Valuation e Valor da Empresa")
    
    # Parâmetros de valuation
    col1, col2 = st.columns(2)
    
    with col1:
        terminal_growth_rate = st.slider("Taxa de Crescimento Terminal:", 0.0, 0.05, 0.02)
        discount_rate = st.slider("Taxa de Desconto (WACC):", 0.08, 0.20, market_config['discount_rate'])
    
    with col2:
        exit_multiple = st.slider("Múltiplo de Saída (EV/EBITDA):", 5.0, 15.0, 8.0)
        
    # Calcular valuation por DCF
    cash_flows = proj_df['free_cash_flow'].tolist()
    
    # Valor presente dos fluxos explícitos
    pv_explicit_flows = sum(cf / (1 + discount_rate) ** (i + 1) for i, cf in enumerate(cash_flows))
    
    # Valor terminal
    terminal_fcf = cash_flows[-1] * (1 + terminal_growth_rate)
    terminal_value = terminal_fcf / (discount_rate - terminal_growth_rate)
    pv_terminal_value = terminal_value / (1 + discount_rate) ** len(cash_flows)
    
    # Enterprise Value
    enterprise_value = pv_explicit_flows + pv_terminal_value
    
    # Valuation por múltiplos
    final_ebitda = proj_df['ebitda'].iloc[-1]
    multiple_valuation = final_ebitda * exit_multiple
    pv_multiple_valuation = multiple_valuation / (1 + discount_rate) ** len(cash_flows)
    
    # Mostrar resultados
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Valor Presente dos FCFs",
            format_currency(pv_explicit_flows, currency),
            delta="Fluxos explícitos"
        )
    
    with col2:
        st.metric(
            "Valor Terminal (VP)",
            format_currency(pv_terminal_value, currency),
            delta=f"Taxa: {terminal_growth_rate:.1%}"
        )
    
    with col3:
        st.metric(
            "Enterprise Value (DCF)",
            format_currency(enterprise_value, currency),
            delta="Método DCF"
        )
    
    with col4:
        st.metric(
            "Valuation por Múltiplos",
            format_currency(pv_multiple_valuation, currency),
            delta=f"EV/EBITDA: {exit_multiple:.1f}x"
        )
    
    # Gráfico de sensibilidade do valuation
    st.markdown("#### 📊 Sensibilidade do Valuation")
    
    # Criar matriz de sensibilidade
    discount_rates = np.arange(discount_rate - 0.03, discount_rate + 0.03, 0.005)
    terminal_rates = np.arange(terminal_growth_rate - 0.01, terminal_growth_rate + 0.01, 0.002)
    
    valuation_matrix = []
    for dr in discount_rates:
        row = []
        for tr in terminal_rates:
            if dr > tr:  # Evitar divisão por números negativos
                pv_flows = sum(cf / (1 + dr) ** (i + 1) for i, cf in enumerate(cash_flows))
                term_fcf = cash_flows[-1] * (1 + tr)
                term_val = term_fcf / (dr - tr)
                pv_term = term_val / (1 + dr) ** len(cash_flows)
                ev = pv_flows + pv_term
                row.append(ev)
            else:
                row.append(np.nan)
        valuation_matrix.append(row)
    
    # Criar heatmap
    fig_heatmap = go.Figure(data=go.Heatmap(
        z=valuation_matrix,
        x=[f"{tr:.1%}" for tr in terminal_rates],
        y=[f"{dr:.1%}" for dr in discount_rates],
        colorscale='RdYlGn',
        text=[[format_currency(val, currency) if not np.isnan(val) else "" for val in row] for row in valuation_matrix],
        texttemplate="%{text}",
        textfont={"size": 8}
    ))
    
    fig_heatmap.update_layout(
        title='Sensibilidade do Enterprise Value',
        xaxis_title='Taxa de Crescimento Terminal',
        yaxis_title='Taxa de Desconto (WACC)'
    )
    
    st.plotly_chart(fig_heatmap, use_container_width=True)

# Resumo executivo das projeções
st.markdown("## 📋 Resumo Executivo - Projeções 2035")

summary_data = {
    'Métrica': [
        'Receita Inicial',
        'Receita Final (2035)',
        'CAGR da Receita',
        'EBITDA Final',
        'Margem EBITDA Final',
        'FCF Total Acumulado',
        'CAPEX Total',
        'Enterprise Value',
        'Múltiplo Receita Final',
        'ROI do Projeto'
    ],
    'Valor': [
        format_currency(initial_annual_revenue, currency),
        format_currency(final_revenue, currency),
        f"{cagr:.1f}%",
        format_currency(proj_df['ebitda'].iloc[-1], currency),
        f"{proj_df['ebitda_margin'].iloc[-1]:.1f}%",
        format_currency(total_free_cf, currency),
        format_currency(total_investment, currency),
        format_currency(enterprise_value, currency),
        f"{enterprise_value / final_revenue:.1f}x",
        f"{((total_free_cf / total_investment) - 1) * 100:.1f}%" if total_investment > 0 else "N/A"
    ]
}

summary_df = pd.DataFrame(summary_data)
st.dataframe(summary_df, use_container_width=True)

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'Projecoes_2035': proj_df,
    'Cenario_Conservador': pd.DataFrame(conservative_proj),
    'Cenario_Otimista': pd.DataFrame(optimistic_proj),
    'Resumo_Executivo': summary_df,
    'Parametros': pd.DataFrame([{
        'Cenario': scenario_type,
        'Crescimento_Base': custom_growth,
        'Volatilidade': custom_volatility,
        'Margem_EBITDA_Base': base_ebitda_margin,
        'Anos_Expansao': ', '.join(map(str, expansion_years)),
        'Enterprise_Value': enterprise_value,
        'Terminal_Growth': terminal_growth_rate,
        'Discount_Rate': discount_rate
    }])
}

export_to_streamlit(export_data, "projecoes_2035")

# Recomendações estratégicas
st.markdown("## 💡 Recomendações Estratégicas para o Período")

recommendations = []

if cagr > 15:
    recommendations.append("🚀 **Alto Crescimento**: CAGR superior a 15% indica excelente potencial. Garanta capacidade operacional para sustentar crescimento.")

if len(expansion_years) > 0:
    recommendations.append(f"📈 **Expansões Planejadas**: {len(expansion_years)} expansões previstas. Planeje financiamento antecipadamente.")

if enterprise_value > total_investment * 5:
    recommendations.append("💎 **Alto Valor Criado**: Enterprise Value indica criação significativa de valor. Considere estratégias de saída.")

if total_free_cf < 0:
    recommendations.append("⚠️ **FCF Negativo**: Fluxo de caixa livre acumulado negativo. Revise premissas ou considere financiamento adicional.")

if proj_df['ebitda_margin'].iloc[-1] > 35:
    recommendations.append("⭐ **Alta Eficiência**: Margem EBITDA final excelente. Foque em manter eficiência operacional.")

final_capacity = proj_df['capacidade_relativa'].iloc[-1]
if final_capacity > 2:
    recommendations.append(f"🏟️ **Expansão Significativa**: Capacidade final {final_capacity:.1f}x a inicial. Garanta gestão de qualidade na expansão.")

market_maturation_impact = market_maturation * projection_years
if market_maturation_impact > 5:
    recommendations.append("📉 **Maturação do Mercado**: Impacto significativo da maturação. Diversifique ofertas e inove continuamente.")

if len(recommendations) == 0:
    recommendations.append("✅ **Projeções Equilibradas**: As projeções apresentam características balanceadas e realistas.")

for rec in recommendations:
    st.info(rec)

st.markdown("---")
st.caption("🔮 **Nota**: Estas são projeções baseadas em premissas e cenários. Resultados reais podem variar significativamente. Revise e ajuste regularmente conforme mudanças no mercado e performance real.")

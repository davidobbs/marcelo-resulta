import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_investment_requirements, get_industry_benchmarks
from utils.financial_calculations import (
    calculate_npv, calculate_irr, calculate_roi, calculate_payback_period,
    calculate_break_even, monte_carlo_simulation, calculate_sensitivity_analysis,
    format_currency, generate_cash_flows, calculate_dcf_valuation
)
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Análise de Viabilidade", page_icon="🎯", layout="wide")

st.title("🎯 Análise de Viabilidade do Investimento")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']
num_fields = st.session_state.get('num_fields', 2)

# Sidebar para configurações da análise
with st.sidebar:
    st.header("⚙️ Configurações da Análise")
    
    # Período de análise
    analysis_years = st.slider("Anos de Análise:", 3, 15, 10)
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2030)), index=0)
    
    st.markdown("### 💰 Investimento Inicial")
    
    # Obter estimativa de investimento
    investment_estimate = get_investment_requirements(market, num_fields)
    
    # Componentes do investimento
    field_construction = st.number_input(
        "Construção de Quadras:",
        value=float(investment_estimate['field_costs']),
        help=f"Custo estimado: {format_currency(investment_estimate['field_costs'], currency)}"
    )
    
    equipment_costs = st.number_input(
        "Equipamentos e Materiais:",
        value=float(investment_estimate['equipment_costs']),
        help="Redes, traves, iluminação, etc."
    )
    
    facility_costs = st.number_input(
        "Instalações de Apoio:",
        value=float(investment_estimate['facility_costs']),
        help="Vestiários, recepção, estacionamento"
    )
    
    working_capital = st.number_input(
        "Capital de Giro Inicial:",
        value=float(investment_estimate['working_capital']),
        help="Reserva para primeiros meses"
    )
    
    licensing_costs = st.number_input(
        "Licenças e Documentação:",
        value=float(investment_estimate['licensing_costs']),
        help="Alvarás, registros, etc."
    )
    
    total_investment = field_construction + equipment_costs + facility_costs + working_capital + licensing_costs
    
    st.metric("Investimento Total", format_currency(total_investment, currency))
    
    st.markdown("### 📊 Projeções Operacionais")
    
    # Receita inicial
    initial_monthly_revenue = st.number_input(
        "Receita Mensal Inicial:",
        value=45000.0,
        help="Receita esperada no primeiro mês de operação plena"
    )
    
    # Crescimento anual
    annual_growth_rate = st.slider(
        "Taxa de Crescimento Anual:",
        0.0, 0.30,
        market_config['growth_potential'],
        help="Crescimento médio anual esperado"
    )
    
    # Margem operacional
    initial_ebitda_margin = st.slider(
        "Margem EBITDA Inicial (%):",
        0.05, 0.45, 0.20,
        help="Margem EBITDA no primeiro ano"
    )
    
    mature_ebitda_margin = st.slider(
        "Margem EBITDA Madura (%):",
        0.15, 0.50, 0.30,
        help="Margem EBITDA após maturação"
    )
    
    # Impostos
    tax_rate = st.slider(
        "Taxa de Impostos (%):",
        market_config['tax_rate'] * 0.8,
        market_config['tax_rate'] * 1.2,
        market_config['tax_rate'],
        help="Taxa efetiva de impostos"
    )
    
    st.markdown("### 🔧 Parâmetros de Análise")
    
    # Taxa de desconto
    discount_rate = st.slider(
        "Taxa de Desconto (WACC):",
        0.06, 0.20,
        market_config['discount_rate'],
        help="Custo de capital para desconto dos fluxos"
    )
    
    # Taxa de crescimento terminal
    terminal_growth = st.slider(
        "Crescimento Terminal:",
        0.0, 0.05, 0.02,
        help="Taxa de crescimento perpétuo"
    )
    
    # Valor residual
    residual_value_multiple = st.slider(
        "Múltiplo Valor Residual (EV/EBITDA):",
        3.0, 12.0, 6.0,
        help="Múltiplo para cálculo do valor residual"
    )

# Função para calcular fluxos de caixa detalhados
def calculate_detailed_cash_flows(years, investment, initial_revenue, growth_rate, initial_margin, mature_margin, tax_rate):
    """Calcula fluxos de caixa detalhados para análise de viabilidade"""
    
    cash_flows = []
    
    # Ano 0 - Investimento inicial
    cash_flows.append({
        'year': start_year - 1,
        'investment': -investment,
        'revenue': 0,
        'ebitda': 0,
        'ebit': 0,
        'taxes': 0,
        'net_income': 0,
        'depreciation': 0,
        'capex': investment,
        'working_capital_change': 0,
        'free_cash_flow': -investment
    })
    
    # Cálculo da depreciação anual
    annual_depreciation = investment * 0.6 / 10  # 60% do investimento depreciado em 10 anos
    
    accumulated_depreciation = 0
    
    for year in range(years):
        year_number = start_year + year
        
        # Receita com crescimento
        annual_revenue = initial_revenue * 12 * (1 + growth_rate) ** year
        
        # Margem EBITDA evolutiva (melhora gradualmente)
        margin_improvement = (mature_margin - initial_margin) * min(1.0, year / 5)  # 5 anos para atingir margem madura
        current_margin = initial_margin + margin_improvement
        
        # EBITDA
        ebitda = annual_revenue * current_margin
        
        # Depreciação
        depreciation = annual_depreciation if accumulated_depreciation < investment * 0.6 else 0
        accumulated_depreciation += depreciation
        
        # EBIT
        ebit = ebitda - depreciation
        
        # Impostos
        taxes = max(0, ebit * tax_rate)
        
        # Lucro líquido
        net_income = ebit - taxes
        
        # CAPEX de manutenção (% da receita)
        capex_maintenance = annual_revenue * 0.03  # 3% da receita
        
        # Variação do capital de giro (% da variação da receita)
        if year == 0:
            wc_change = annual_revenue * 0.05  # 5% da receita inicial
        else:
            revenue_change = annual_revenue - (initial_revenue * 12 * (1 + growth_rate) ** (year - 1))
            wc_change = revenue_change * 0.03  # 3% da variação da receita
        
        # Fluxo de caixa livre
        free_cash_flow = net_income + depreciation - capex_maintenance - wc_change
        
        cash_flows.append({
            'year': year_number,
            'investment': 0,
            'revenue': annual_revenue,
            'ebitda': ebitda,
            'ebit': ebit,
            'taxes': taxes,
            'net_income': net_income,
            'depreciation': depreciation,
            'capex': capex_maintenance,
            'working_capital_change': wc_change,
            'free_cash_flow': free_cash_flow,
            'ebitda_margin': current_margin * 100
        })
    
    return cash_flows

# Calcular fluxos de caixa
cash_flows_data = calculate_detailed_cash_flows(
    analysis_years, total_investment, initial_monthly_revenue,
    annual_growth_rate, initial_ebitda_margin, mature_ebitda_margin, tax_rate
)

# Criar DataFrame
cf_df = pd.DataFrame(cash_flows_data)

# Calcular indicadores de viabilidade
fcf_values = cf_df['free_cash_flow'].tolist()

# NPV
npv = calculate_npv(fcf_values, discount_rate)

# IRR
irr = calculate_irr(fcf_values)

# Payback
payback_period = calculate_payback_period(fcf_values)

# ROI
total_returns = sum(cf_df['free_cash_flow'].iloc[1:])  # Excluir investimento inicial
roi = calculate_roi(total_investment, total_returns + total_investment)

# Valor terminal e Enterprise Value
if len(cf_df) > 1:
    final_ebitda = cf_df['ebitda'].iloc[-1]
    terminal_value = final_ebitda * residual_value_multiple
    pv_terminal = terminal_value / (1 + discount_rate) ** analysis_years
    
    # DCF Valuation
    pv_fcf = sum(cf / (1 + discount_rate) ** i for i, cf in enumerate(fcf_values[1:], 1))
    enterprise_value = pv_fcf + pv_terminal
else:
    terminal_value = 0
    pv_terminal = 0
    enterprise_value = npv

# Interface principal
st.markdown("## 📊 Resumo da Análise de Viabilidade")

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    npv_color = "normal" if npv > 0 else "inverse"
    st.metric(
        "VPL (NPV)",
        format_currency(npv, currency),
        delta="Positivo" if npv > 0 else "Negativo"
    )

with col2:
    irr_display = f"{irr*100:.1f}%" if irr else "N/A"
    irr_delta = f"vs {discount_rate*100:.1f}% (WACC)"
    st.metric(
        "TIR (IRR)",
        irr_display,
        delta=irr_delta
    )

with col3:
    payback_display = f"{payback_period:.1f} anos" if payback_period else "N/A"
    st.metric(
        "Payback",
        payback_display,
        delta="Tempo de retorno"
    )

with col4:
    st.metric(
        "ROI Total",
        f"{roi*100:.1f}%",
        delta=f"Sobre {format_currency(total_investment, currency)}"
    )

with col5:
    st.metric(
        "Enterprise Value",
        format_currency(enterprise_value, currency),
        delta=f"Múltiplo: {enterprise_value/total_investment:.1f}x"
    )

# Análise de viabilidade consolidada
st.markdown("### 🎯 Score de Viabilidade")

# Calcular score de viabilidade
viability_score = 0
viability_factors = []

# Critério 1: NPV positivo (25 pontos)
if npv > 0:
    viability_score += 25
    viability_factors.append("✅ NPV positivo")
else:
    viability_factors.append("❌ NPV negativo")

# Critério 2: IRR superior ao WACC (25 pontos)
if irr and irr > discount_rate:
    viability_score += 25
    viability_factors.append("✅ TIR superior ao WACC")
else:
    viability_factors.append("❌ TIR inferior ao WACC")

# Critério 3: Payback razoável (20 pontos)
if payback_period and payback_period <= 5:
    viability_score += 20
    viability_factors.append("✅ Payback em até 5 anos")
else:
    viability_factors.append("❌ Payback superior a 5 anos")

# Critério 4: ROI atrativo (15 pontos)
if roi > 0.5:  # 50% de retorno total
    viability_score += 15
    viability_factors.append("✅ ROI superior a 50%")
else:
    viability_factors.append("❌ ROI inferior a 50%")

# Critério 5: Múltiplo de valor (15 pontos)
value_multiple = enterprise_value / total_investment if total_investment > 0 else 0
if value_multiple > 2:
    viability_score += 15
    viability_factors.append("✅ Múltiplo de valor > 2x")
else:
    viability_factors.append("❌ Múltiplo de valor < 2x")

# Mostrar score e fatores
col1, col2 = st.columns([1, 2])

with col1:
    # Gauge de viabilidade
    fig_gauge = go.Figure(go.Indicator(
        mode = "gauge+number+delta",
        value = viability_score,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Score de Viabilidade"},
        delta = {'reference': 75},
        gauge = {
            'axis': {'range': [None, 100]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 40], 'color': "lightgray"},
                {'range': [40, 60], 'color': "yellow"},
                {'range': [60, 80], 'color': "orange"},
                {'range': [80, 100], 'color': "green"}
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
    
    # Classificação final
    if viability_score >= 80:
        st.success("🎯 **ALTAMENTE VIÁVEL**: Projeto apresenta excelentes indicadores financeiros.")
    elif viability_score >= 60:
        st.success("✅ **VIÁVEL**: Projeto apresenta indicadores financeiros favoráveis.")
    elif viability_score >= 40:
        st.warning("⚠️ **VIABILIDADE QUESTIONÁVEL**: Alguns indicadores desfavoráveis. Revisar premissas.")
    else:
        st.error("❌ **INVIÁVEL**: Maioria dos indicadores desfavoráveis. Repensar projeto.")

# Análises detalhadas
st.markdown("## 📊 Análises Detalhadas")

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "Fluxo de Caixa", 
    "Análise de Sensibilidade", 
    "Cenários", 
    "Comparação Benchmarks",
    "Análise de Riscos"
])

with tab1:
    # Tabela de fluxo de caixa
    st.markdown("### 💰 Projeção de Fluxo de Caixa")
    
    # Preparar dados para exibição
    display_cf = cf_df.copy()
    
    # Formatar valores monetários
    monetary_cols = ['investment', 'revenue', 'ebitda', 'ebit', 'net_income', 'free_cash_flow']
    for col in monetary_cols:
        if col in display_cf.columns:
            display_cf[f'{col}_fmt'] = display_cf[col].apply(lambda x: format_currency(x, currency))
    
    # Selecionar colunas para exibição
    display_columns = ['year', 'revenue_fmt', 'ebitda_fmt', 'ebitda_margin', 'net_income_fmt', 'free_cash_flow_fmt']
    display_names = ['Ano', 'Receita', 'EBITDA', 'Margem EBITDA (%)', 'Lucro Líquido', 'FCF']
    
    if all(col in display_cf.columns for col in display_columns):
        display_final = display_cf[display_columns].copy()
        display_final.columns = display_names
        
        # Formatar margem EBITDA
        if 'Margem EBITDA (%)' in display_final.columns:
            display_final['Margem EBITDA (%)'] = display_final['Margem EBITDA (%)'].apply(lambda x: f"{x:.1f}%" if pd.notna(x) else "N/A")
        
        st.dataframe(display_final, use_container_width=True)
    
    # Gráfico de fluxo de caixa
    fig_cf = go.Figure()
    
    # Fluxo de caixa livre
    fig_cf.add_trace(go.Bar(
        x=cf_df['year'],
        y=cf_df['free_cash_flow'],
        name='Fluxo de Caixa Livre',
        marker_color=['red' if x < 0 else 'green' for x in cf_df['free_cash_flow']]
    ))
    
    # Linha de break-even
    fig_cf.add_hline(y=0, line_dash="dash", line_color="gray")
    
    # Fluxo acumulado
    cf_df['fcf_accumulated'] = cf_df['free_cash_flow'].cumsum()
    fig_cf.add_trace(go.Scatter(
        x=cf_df['year'],
        y=cf_df['fcf_accumulated'],
        name='FCF Acumulado',
        line=dict(color='blue', width=3),
        mode='lines+markers',
        yaxis='y2'
    ))
    
    fig_cf.update_layout(
        title='Fluxo de Caixa Livre - Anual e Acumulado',
        xaxis_title='Ano',
        yaxis_title=f'FCF Anual ({currency})',
        yaxis2=dict(
            title=f'FCF Acumulado ({currency})',
            side='right',
            overlaying='y'
        )
    )
    
    st.plotly_chart(fig_cf, use_container_width=True)

with tab2:
    st.markdown("### 📈 Análise de Sensibilidade")
    
    # Parâmetros para análise de sensibilidade
    sensitivity_param = st.selectbox(
        "Variável para Análise:",
        ["Receita Inicial", "Taxa de Crescimento", "Margem EBITDA", "Investimento Inicial", "Taxa de Desconto"]
    )
    
    variation_range = st.slider("Variação (%):", 10, 50, 20)
    
    # Calcular sensibilidade
    base_case = {
        'initial_revenue': initial_monthly_revenue * 12,
        'growth_rate': annual_growth_rate,
        'ebitda_margin': initial_ebitda_margin,
        'investment': total_investment,
        'discount_rate': discount_rate,
        'years': analysis_years
    }
    
    # Definir variáveis para análise
    variables = {
        "Receita Inicial": base_case['initial_revenue'],
        "Taxa de Crescimento": base_case['growth_rate'],
        "Margem EBITDA": base_case['ebitda_margin'],
        "Investimento Inicial": base_case['investment'],
        "Taxa de Desconto": base_case['discount_rate']
    }
    
    # Executar análise de sensibilidade
    if st.button("🎯 Executar Análise de Sensibilidade"):
        sensitivity_results = []
        variations = np.arange(-variation_range/100, variation_range/100 + 0.01, 0.05)
        
        for var in variations:
            # Criar cenário modificado
            modified_case = base_case.copy()
            
            if sensitivity_param == "Receita Inicial":
                modified_case['initial_revenue'] = base_case['initial_revenue'] * (1 + var)
                test_cf = calculate_detailed_cash_flows(
                    analysis_years, total_investment, (modified_case['initial_revenue']/12),
                    annual_growth_rate, initial_ebitda_margin, mature_ebitda_margin, tax_rate
                )
            elif sensitivity_param == "Taxa de Crescimento":
                modified_case['growth_rate'] = max(0, base_case['growth_rate'] * (1 + var))
                test_cf = calculate_detailed_cash_flows(
                    analysis_years, total_investment, initial_monthly_revenue,
                    modified_case['growth_rate'], initial_ebitda_margin, mature_ebitda_margin, tax_rate
                )
            elif sensitivity_param == "Margem EBITDA":
                modified_margin = max(0.05, base_case['ebitda_margin'] * (1 + var))
                test_cf = calculate_detailed_cash_flows(
                    analysis_years, total_investment, initial_monthly_revenue,
                    annual_growth_rate, modified_margin, mature_ebitda_margin, tax_rate
                )
            elif sensitivity_param == "Investimento Inicial":
                modified_investment = base_case['investment'] * (1 + var)
                test_cf = calculate_detailed_cash_flows(
                    analysis_years, modified_investment, initial_monthly_revenue,
                    annual_growth_rate, initial_ebitda_margin, mature_ebitda_margin, tax_rate
                )
            elif sensitivity_param == "Taxa de Desconto":
                modified_case['discount_rate'] = max(0.01, base_case['discount_rate'] * (1 + var))
                test_cf = calculate_detailed_cash_flows(
                    analysis_years, total_investment, initial_monthly_revenue,
                    annual_growth_rate, initial_ebitda_margin, mature_ebitda_margin, tax_rate
                )
            
            # Calcular NPV do cenário
            test_df = pd.DataFrame(test_cf)
            test_fcf = test_df['free_cash_flow'].tolist()
            
            if sensitivity_param == "Taxa de Desconto":
                test_npv = calculate_npv(test_fcf, modified_case['discount_rate'])
            else:
                test_npv = calculate_npv(test_fcf, discount_rate)
            
            sensitivity_results.append({
                'variacao_percent': var * 100,
                'npv': test_npv,
                'npv_change': ((test_npv - npv) / abs(npv) * 100) if npv != 0 else 0
            })
        
        sensitivity_df = pd.DataFrame(sensitivity_results)
        
        # Gráfico de sensibilidade
        fig_sens = go.Figure()
        
        fig_sens.add_trace(go.Scatter(
            x=sensitivity_df['variacao_percent'],
            y=sensitivity_df['npv'],
            mode='lines+markers',
            name='NPV',
            line=dict(color='blue', width=3)
        ))
        
        fig_sens.add_hline(y=0, line_dash="dash", line_color="red", annotation_text="Break-even")
        fig_sens.add_vline(x=0, line_dash="dash", line_color="gray", annotation_text="Cenário Base")
        
        fig_sens.update_layout(
            title=f'Sensibilidade do NPV à variação em {sensitivity_param}',
            xaxis_title='Variação (%)',
            yaxis_title=f'NPV ({currency})'
        )
        
        st.plotly_chart(fig_sens, use_container_width=True)
        
        # Tabela de sensibilidade
        st.markdown("#### 📊 Resultados da Análise de Sensibilidade")
        
        # Encontrar pontos críticos
        break_even_row = sensitivity_df[sensitivity_df['npv'].abs() == sensitivity_df['npv'].abs().min()]
        if not break_even_row.empty:
            break_even_var = break_even_row['variacao_percent'].iloc[0]
            st.info(f"💡 **Ponto de Break-even**: NPV = 0 com variação de aproximadamente {break_even_var:.1f}% em {sensitivity_param}")
        
        # Mostrar tabela resumida
        key_points = sensitivity_df[sensitivity_df['variacao_percent'].isin([-20, -10, 0, 10, 20])]
        key_points['npv_formatted'] = key_points['npv'].apply(lambda x: format_currency(x, currency))
        key_points['npv_change_formatted'] = key_points['npv_change'].apply(lambda x: f"{x:+.1f}%")
        
        display_sens = key_points[['variacao_percent', 'npv_formatted', 'npv_change_formatted']].copy()
        display_sens.columns = ['Variação (%)', 'NPV', 'Mudança no NPV (%)']
        
        st.dataframe(display_sens, use_container_width=True)
    
    else:
        st.info("👆 Clique no botão acima para executar a análise de sensibilidade")

with tab3:
    st.markdown("### 🎲 Análise de Cenários")
    
    # Definir cenários
    scenarios = {
        "Pessimista": {
            "receita_factor": 0.7,
            "crescimento_factor": 0.5,
            "margem_factor": 0.8,
            "investimento_factor": 1.2,
            "description": "Receita 30% menor, crescimento 50% menor, margem 20% menor, investimento 20% maior"
        },
        "Base": {
            "receita_factor": 1.0,
            "crescimento_factor": 1.0,
            "margem_factor": 1.0,
            "investimento_factor": 1.0,
            "description": "Cenário conforme parâmetros definidos"
        },
        "Otimista": {
            "receita_factor": 1.3,
            "crescimento_factor": 1.5,
            "margem_factor": 1.2,
            "investimento_factor": 0.9,
            "description": "Receita 30% maior, crescimento 50% maior, margem 20% maior, investimento 10% menor"
        }
    }
    
    scenario_results = []
    
    for scenario_name, params in scenarios.items():
        # Ajustar parâmetros
        scenario_revenue = initial_monthly_revenue * params["receita_factor"]
        scenario_growth = annual_growth_rate * params["crescimento_factor"]
        scenario_margin = initial_ebitda_margin * params["margem_factor"]
        scenario_investment = total_investment * params["investimento_factor"]
        
        # Calcular fluxos do cenário
        scenario_cf = calculate_detailed_cash_flows(
            analysis_years, scenario_investment, scenario_revenue,
            scenario_growth, scenario_margin, mature_ebitda_margin, tax_rate
        )
        
        scenario_df = pd.DataFrame(scenario_cf)
        scenario_fcf = scenario_df['free_cash_flow'].tolist()
        
        # Calcular indicadores
        scenario_npv = calculate_npv(scenario_fcf, discount_rate)
        scenario_irr = calculate_irr(scenario_fcf)
        scenario_payback = calculate_payback_period(scenario_fcf)
        scenario_roi = calculate_roi(scenario_investment, sum(scenario_fcf[1:]) + scenario_investment)
        
        scenario_results.append({
            'Cenário': scenario_name,
            'NPV': format_currency(scenario_npv, currency),
            'TIR': f"{scenario_irr*100:.1f}%" if scenario_irr else "N/A",
            'Payback': f"{scenario_payback:.1f} anos" if scenario_payback else "N/A",
            'ROI': f"{scenario_roi*100:.1f}%",
            'Viabilidade': "✅" if scenario_npv > 0 and scenario_irr and scenario_irr > discount_rate else "❌",
            'Descrição': params["description"]
        })
    
    scenarios_df = pd.DataFrame(scenario_results)
    st.dataframe(scenarios_df, use_container_width=True)
    
    # Gráfico comparativo de cenários
    npv_values = [scenarios[name]["receita_factor"] * npv for name in scenarios.keys()]  # Aproximação
    scenario_names = list(scenarios.keys())
    
    fig_scenarios = go.Figure()
    
    fig_scenarios.add_trace(go.Bar(
        x=scenario_names,
        y=npv_values,
        name='NPV por Cenário',
        marker_color=['red', 'yellow', 'green']
    ))
    
    fig_scenarios.add_hline(y=0, line_dash="dash", line_color="gray")
    
    fig_scenarios.update_layout(
        title='Comparação de NPV entre Cenários',
        xaxis_title='Cenário',
        yaxis_title=f'NPV ({currency})'
    )
    
    st.plotly_chart(fig_scenarios, use_container_width=True)

with tab4:
    st.markdown("### 📊 Comparação com Benchmarks da Indústria")
    
    # Obter benchmarks
    industry_benchmarks = get_industry_benchmarks(market)
    
    # Calcular métricas do projeto
    final_revenue = cf_df['revenue'].iloc[-1] if len(cf_df) > 1 else 0
    avg_ebitda_margin = cf_df['ebitda_margin'].mean() if 'ebitda_margin' in cf_df.columns else 0
    
    project_metrics = {
        'Receita por Quadra (Anual)': final_revenue / num_fields if num_fields > 0 else 0,
        'Margem de Lucro Média': avg_ebitda_margin / 100 if avg_ebitda_margin > 1 else avg_ebitda_margin,
        'ROI Total': roi,
        'Payback Period': payback_period if payback_period else 0
    }
    
    # Comparação
    comparison_data = {
        'Métrica': [
            'Receita por Quadra/Ano',
            'Margem de Lucro',
            'ROI Total',
            'Payback Period'
        ],
        'Seu Projeto': [
            format_currency(project_metrics['Receita por Quadra (Anual)'], currency),
            f"{project_metrics['Margem de Lucro Média']*100:.1f}%",
            f"{project_metrics['ROI Total']*100:.1f}%",
            f"{project_metrics['Payback Period']:.1f} anos" if project_metrics['Payback Period'] > 0 else "N/A"
        ],
        'Benchmark Indústria': [
            format_currency(industry_benchmarks['avg_revenue_per_field'], currency),
            f"{industry_benchmarks['avg_profit_margin']*100:.0f}%",
            f"{industry_benchmarks['roi_expected']*100:.0f}%",
            f"{industry_benchmarks['payback_period']:.1f} anos"
        ],
        'Status': [
            "✅" if project_metrics['Receita por Quadra (Anual)'] >= industry_benchmarks['avg_revenue_per_field'] else "🔴",
            "✅" if project_metrics['Margem de Lucro Média'] >= industry_benchmarks['avg_profit_margin'] else "🔴",
            "✅" if project_metrics['ROI Total'] >= industry_benchmarks['roi_expected'] else "🔴",
            "✅" if project_metrics['Payback Period'] > 0 and project_metrics['Payback Period'] <= industry_benchmarks['payback_period'] else "🔴"
        ]
    }
    
    comparison_df = pd.DataFrame(comparison_data)
    st.dataframe(comparison_df, use_container_width=True)
    
    # Gráfico radar de comparação
    categories = ['Receita/Quadra', 'Margem Lucro', 'ROI', 'Payback (inv.)']
    
    # Normalizar valores (0-100)
    project_values = [
        min(100, (project_metrics['Receita por Quadra (Anual)'] / industry_benchmarks['avg_revenue_per_field']) * 100),
        min(100, (project_metrics['Margem de Lucro Média'] / industry_benchmarks['avg_profit_margin']) * 100),
        min(100, (project_metrics['ROI Total'] / industry_benchmarks['roi_expected']) * 100),
        min(100, (industry_benchmarks['payback_period'] / max(0.1, project_metrics['Payback Period'])) * 100) if project_metrics['Payback Period'] > 0 else 0
    ]
    
    benchmark_values = [100] * 4  # Benchmark sempre 100%
    
    fig_radar = go.Figure()
    
    fig_radar.add_trace(go.Scatterpolar(
        r=benchmark_values,
        theta=categories,
        fill='toself',
        name='Benchmark Indústria',
        opacity=0.3
    ))
    
    fig_radar.add_trace(go.Scatterpolar(
        r=project_values,
        theta=categories,
        fill='toself',
        name='Seu Projeto'
    ))
    
    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 150]
            )),
        showlegend=True,
        title="Comparação com Benchmarks da Indústria"
    )
    
    st.plotly_chart(fig_radar, use_container_width=True)

with tab5:
    st.markdown("### ⚠️ Análise de Riscos")
    
    # Identificar riscos do projeto
    risks = []
    
    # Risco de mercado
    if annual_growth_rate > market_config['growth_potential'] * 1.5:
        risks.append({
            'tipo': 'Alto',
            'categoria': 'Mercado',
            'risco': 'Taxa de crescimento muito otimista',
            'impacto': 'Receitas podem não se materializar conforme esperado',
            'mitigacao': 'Revisar premissas de crescimento e criar cenários mais conservadores'
        })
    
    # Risco de margem
    if mature_ebitda_margin > 0.35:
        risks.append({
            'tipo': 'Médio',
            'categoria': 'Operacional',
            'risco': 'Margem EBITDA muito alta',
            'impacto': 'Pode não ser sustentável devido à concorrência',
            'mitigacao': 'Monitorar concorrência e ter planos de redução de custos'
        })
    
    # Risco de investimento
    if total_investment > industry_benchmarks['avg_revenue_per_field'] * num_fields * 2:
        risks.append({
            'tipo': 'Alto',
            'categoria': 'Financeiro',
            'risco': 'Investimento inicial muito alto',
            'impacto': 'Payback extenso e risco de não recuperação',
            'mitigacao': 'Revisar escopo do projeto e buscar alternativas mais econômicas'
        })
    
    # Risco de ocupação
    occupancy_assumption = 0.75  # Assumindo 75% baseado nas projeções de receita
    if occupancy_assumption > market_config['expected_occupancy'] * 1.3:
        risks.append({
            'tipo': 'Médio',
            'categoria': 'Operacional',
            'risco': 'Premissa de ocupação otimista',
            'impacto': 'Receitas menores que o projetado',
            'mitigacao': 'Investir em marketing e diversificar ofertas de serviços'
        })
    
    # Risco de financiamento
    if discount_rate > 0.15:
        risks.append({
            'tipo': 'Médio',
            'categoria': 'Financeiro',
            'risco': 'Custo de capital elevado',
            'impacto': 'Reduz atratividade do projeto',
            'mitigacao': 'Negociar melhores condições de financiamento'
        })
    
    # Risco de payback
    if payback_period and payback_period > 6:
        risks.append({
            'tipo': 'Alto',
            'categoria': 'Financeiro',
            'risco': 'Payback muito longo',
            'impacto': 'Maior exposição a mudanças de mercado',
            'mitigacao': 'Acelerar geração de caixa ou reduzir investimento inicial'
        })
    
    # Risco regulatório
    if market == "Brasil":
        risks.append({
            'tipo': 'Baixo',
            'categoria': 'Regulatório',
            'risco': 'Mudanças na tributação',
            'impacto': 'Aumento de custos tributários',
            'mitigacao': 'Acompanhar mudanças legislativas e ter planejamento tributário'
        })
    
    if len(risks) == 0:
        risks.append({
            'tipo': 'Baixo',
            'categoria': 'Geral',
            'risco': 'Riscos dentro de parâmetros aceitáveis',
            'impacto': 'Projeto apresenta perfil de risco equilibrado',
            'mitigacao': 'Manter monitoramento contínuo dos indicadores'
        })
    
    # Mostrar riscos
    for risk in risks:
        if risk['tipo'] == 'Alto':
            st.error(f"🔴 **{risk['categoria']} - {risk['tipo']}**: {risk['risco']}")
            st.write(f"**Impacto**: {risk['impacto']}")
            st.write(f"**Mitigação**: {risk['mitigacao']}")
            st.write("---")
        elif risk['tipo'] == 'Médio':
            st.warning(f"🟡 **{risk['categoria']} - {risk['tipo']}**: {risk['risco']}")
            st.write(f"**Impacto**: {risk['impacto']}")
            st.write(f"**Mitigação**: {risk['mitigacao']}")
            st.write("---")
        else:
            st.info(f"🟢 **{risk['categoria']} - {risk['tipo']}**: {risk['risco']}")
            st.write(f"**Impacto**: {risk['impacto']}")
            st.write(f"**Mitigação**: {risk['mitigacao']}")
            st.write("---")
    
    # Matriz de risco
    risk_matrix_data = []
    for risk in risks:
        probability = {'Alto': 3, 'Médio': 2, 'Baixo': 1}[risk['tipo']]
        impact = 3 if 'muito' in risk['impacto'].lower() else 2 if 'maior' in risk['impacto'].lower() else 1
        
        risk_matrix_data.append({
            'Risco': risk['risco'][:30] + '...' if len(risk['risco']) > 30 else risk['risco'],
            'Probabilidade': probability,
            'Impacto': impact,
            'Score': probability * impact
        })
    
    if risk_matrix_data:
        risk_df = pd.DataFrame(risk_matrix_data)
        
        fig_risk = px.scatter(
            risk_df, 
            x='Probabilidade', 
            y='Impacto',
            size='Score',
            hover_data=['Risco'],
            title='Matriz de Risco',
            labels={'Probabilidade': 'Probabilidade (1-3)', 'Impacto': 'Impacto (1-3)'}
        )
        
        fig_risk.update_layout(
            xaxis=dict(range=[0.5, 3.5], dtick=1),
            yaxis=dict(range=[0.5, 3.5], dtick=1)
        )
        
        st.plotly_chart(fig_risk, use_container_width=True)

# Recomendações finais
st.markdown("## 💡 Recomendações Estratégicas")

recommendations = []

if viability_score >= 80:
    recommendations.append("🚀 **Projeto Altamente Recomendado**: Indicadores excelentes. Proceda com confiança.")
elif viability_score >= 60:
    recommendations.append("✅ **Projeto Recomendado**: Indicadores favoráveis justificam o investimento.")
else:
    recommendations.append("⚠️ **Revisar Projeto**: Indicadores sugerem necessidade de otimização.")

if npv > 0 and irr and irr > discount_rate:
    recommendations.append("💰 **Viabilidade Financeira Confirmada**: NPV positivo e TIR superior ao custo de capital.")

if payback_period and payback_period <= 4:
    recommendations.append("⏱️ **Payback Atrativo**: Período de retorno adequado para o tipo de investimento.")
elif payback_period and payback_period > 6:
    recommendations.append("⏳ **Payback Longo**: Considere formas de acelerar a geração de caixa.")

if roi > 0.5:
    recommendations.append("📈 **ROI Atrativo**: Retorno total justifica o risco do investimento.")

enterprise_multiple = enterprise_value / total_investment if total_investment > 0 else 0
if enterprise_multiple > 3:
    recommendations.append("💎 **Alto Potencial de Valorização**: Enterprise value indica criação significativa de valor.")

# Recomendações operacionais
final_margin = cf_df['ebitda_margin'].iloc[-1] if 'ebitda_margin' in cf_df.columns and len(cf_df) > 1 else 0
if final_margin > 25:
    recommendations.append("⚡ **Foque na Eficiência Operacional**: Margens projetadas são atrativas, mantenha foco na execução.")

if annual_growth_rate > 0.15:
    recommendations.append("📊 **Monitore o Crescimento**: Taxa de crescimento ambiciosa requer acompanhamento próximo.")

# Recomendações de mercado
if market == "Brasil" and total_investment > 800000:
    recommendations.append("🏛️ **Considere Incentivos Fiscais**: Projeto elegível para benefícios tributários locais.")
elif market == "Emirados Árabes":
    recommendations.append("🌍 **Aproveite o Ambiente Favorável**: Mercado em crescimento com baixa tributação.")

if len(recommendations) == 0:
    recommendations.append("📋 **Análise Concluída**: Continue monitoramento periódico dos indicadores.")

for rec in recommendations:
    st.info(rec)

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'Resumo_Viabilidade': pd.DataFrame([{
        'NPV': npv,
        'IRR': irr,
        'ROI': roi,
        'Payback': payback_period,
        'Enterprise_Value': enterprise_value,
        'Score_Viabilidade': viability_score,
        'Investimento_Total': total_investment,
        'Classificacao': 'Altamente Viável' if viability_score >= 80 else 'Viável' if viability_score >= 60 else 'Questionável' if viability_score >= 40 else 'Inviável'
    }]),
    'Fluxo_de_Caixa_Detalhado': cf_df,
    'Analise_Cenarios': scenarios_df if 'scenarios_df' in locals() else pd.DataFrame(),
    'Comparacao_Benchmark': comparison_df if 'comparison_df' in locals() else pd.DataFrame(),
    'Matriz_Riscos': pd.DataFrame(risk_matrix_data) if 'risk_matrix_data' in locals() else pd.DataFrame(),
    'Parametros_Analise': pd.DataFrame([{
        'Mercado': market,
        'Anos_Analise': analysis_years,
        'Investimento_Total': total_investment,
        'Receita_Inicial_Mensal': initial_monthly_revenue,
        'Crescimento_Anual': annual_growth_rate,
        'Margem_EBITDA_Inicial': initial_ebitda_margin,
        'Taxa_Desconto': discount_rate,
        'Data_Analise': datetime.now().strftime('%Y-%m-%d')
    }])
}

export_to_streamlit(export_data, "analise_viabilidade")

# Conclusão
st.markdown("## 🎯 Conclusão da Análise")

conclusion_color = "success" if viability_score >= 60 else "warning" if viability_score >= 40 else "error"

if conclusion_color == "success":
    st.success(f"""
    ✅ **PROJETO VIÁVEL**
    
    O projeto apresenta indicadores financeiros favoráveis com:
    - NPV de {format_currency(npv, currency)}
    - TIR de {irr*100:.1f}% (superior ao WACC de {discount_rate*100:.1f}%)
    - Payback de {payback_period:.1f} anos
    - ROI total de {roi*100:.1f}%
    - Score de viabilidade: {viability_score}/100
    
    **Recomendação**: Prosseguir com o investimento, mantendo atenção aos fatores de risco identificados.
    """)
elif conclusion_color == "warning":
    st.warning(f"""
    ⚠️ **PROJETO COM VIABILIDADE QUESTIONÁVEL**
    
    O projeto apresenta alguns indicadores desfavoráveis:
    - NPV de {format_currency(npv, currency)}
    - TIR de {irr*100:.1f}% (vs WACC de {discount_rate*100:.1f}%)
    - Score de viabilidade: {viability_score}/100
    
    **Recomendação**: Revisar premissas e considerar otimizações antes de prosseguir.
    """)
else:
    st.error(f"""
    ❌ **PROJETO INVIÁVEL**
    
    O projeto apresenta indicadores desfavoráveis:
    - NPV de {format_currency(npv, currency)}
    - Score de viabilidade: {viability_score}/100
    
    **Recomendação**: Repensar completamente o projeto ou buscar alternativas de estruturação.
    """)

st.markdown("---")
st.caption("🎯 **Disclaimer**: Esta análise de viabilidade é baseada nas premissas inseridas e projeções estimadas. Resultados reais podem variar significativamente. Recomenda-se consultoria especializada para validação das análises e tomada de decisão final de investimento.")

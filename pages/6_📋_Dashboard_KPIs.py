import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_industry_benchmarks
from utils.financial_calculations import format_currency, calculate_financial_ratios
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Dashboard KPIs", page_icon="📋", layout="wide")

st.title("📋 Dashboard de Indicadores-Chave de Performance")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']
num_fields = st.session_state.get('num_fields', 2)

# Sidebar para configurações do dashboard
with st.sidebar:
    st.header("⚙️ Configurações do Dashboard")
    
    # Período de análise
    dashboard_period = st.selectbox(
        "Período de Análise:",
        ["Mensal", "Trimestral", "Anual"],
        index=2
    )
    
    current_year = datetime.now().year
    analysis_year = st.selectbox(
        "Ano de Análise:",
        options=list(range(current_year - 2, current_year + 6)),
        index=2
    )
    
    st.markdown("### 📊 Dados Operacionais")
    
    # Dados operacionais base
    total_fields = st.number_input("Total de Quadras:", value=num_fields, min_value=1, max_value=20)
    
    operational_hours_day = st.number_input(
        "Horas Operacionais/Dia:", 
        value=market_config['hours_per_day'], 
        min_value=8, 
        max_value=18
    )
    
    days_per_month = st.number_input("Dias de Operação/Mês:", value=30, min_value=25, max_value=31)
    
    # Taxa de ocupação
    current_occupancy = st.slider(
        "Taxa de Ocupação Atual (%):", 
        0.0, 1.0, 
        market_config['expected_occupancy'],
        help="Taxa média de ocupação das quadras"
    )
    
    # Preços
    avg_price_per_hour = st.number_input(
        "Preço Médio/Hora:", 
        value=market_config['avg_hourly_rate'],
        help="Preço médio cobrado por hora de quadra"
    )
    
    st.markdown("### 💰 Dados Financeiros")
    
    # Receitas mensais estimadas
    monthly_revenue_estimate = st.number_input(
        "Receita Mensal Estimada:", 
        value=50000.0,
        help="Receita mensal atual ou estimada"
    )
    
    # Custos
    monthly_fixed_costs = st.number_input(
        "Custos Fixos Mensais:", 
        value=25000.0,
        help="Salários, aluguel, utilities"
    )
    
    variable_cost_percentage = st.slider(
        "Custos Variáveis (% Receita):", 
        0.0, 0.50, 0.25
    )
    
    # Metas de performance
    st.markdown("### 🎯 Metas de Performance")
    
    target_occupancy = st.slider("Meta de Ocupação (%):", 0.0, 1.0, 0.80)
    target_revenue_growth = st.slider("Meta de Crescimento de Receita (% aa):", 0.0, 0.50, 0.15)
    target_ebitda_margin = st.slider("Meta de Margem EBITDA (%):", 0.0, 0.50, 0.25)

# Função para gerar dados simulados baseados nos parâmetros
def generate_kpi_data(periods, base_revenue, growth_rate, occupancy, price_per_hour, fields, fixed_costs, var_cost_rate):
    """Gera dados de KPIs para o dashboard"""
    
    data = []
    
    for i in range(periods):
        # Crescimento e sazonalidade
        growth_factor = (1 + growth_rate / 12) ** i  # Crescimento mensal
        seasonal_factors = [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0]
        seasonal_factor = seasonal_factors[i % 12]
        
        # Variação aleatória realística
        random_variation = np.random.normal(1, 0.1)  # 10% de variação
        
        # Receitas
        period_revenue = base_revenue * growth_factor * seasonal_factor * random_variation
        
        # Ocupação (com variação realística)
        period_occupancy = min(1.0, occupancy * seasonal_factor * np.random.normal(1, 0.05))
        
        # Horas vendidas
        max_hours_month = fields * operational_hours_day * days_per_month
        hours_sold = max_hours_month * period_occupancy
        
        # Receita por hora realizada
        revenue_per_hour = period_revenue / hours_sold if hours_sold > 0 else 0
        
        # Custos
        variable_costs = period_revenue * var_cost_rate
        period_fixed_costs = fixed_costs * (1 + growth_rate / 12) ** i  # Inflação nos custos
        total_costs = variable_costs + period_fixed_costs
        
        # Margens
        gross_profit = period_revenue - variable_costs
        ebitda = period_revenue - total_costs
        ebitda_margin = ebitda / period_revenue if period_revenue > 0 else 0
        
        # Outros KPIs
        revenue_per_field = period_revenue / fields
        cost_per_hour = total_costs / hours_sold if hours_sold > 0 else 0
        
        # Data do período
        period_date = datetime(analysis_year, (i % 12) + 1, 1)
        
        data.append({
            'periodo': period_date,
            'receita': period_revenue,
            'custos_variaveis': variable_costs,
            'custos_fixos': period_fixed_costs,
            'custos_totais': total_costs,
            'lucro_bruto': gross_profit,
            'ebitda': ebitda,
            'margem_bruta': gross_profit / period_revenue if period_revenue > 0 else 0,
            'margem_ebitda': ebitda_margin,
            'ocupacao': period_occupancy,
            'horas_vendidas': hours_sold,
            'receita_por_hora': revenue_per_hour,
            'receita_por_quadra': revenue_per_field,
            'custo_por_hora': cost_per_hour,
            'ticket_medio': period_revenue / (hours_sold * 2) if hours_sold > 0 else 0  # Assumindo 2 pessoas por hora em média
        })
    
    return pd.DataFrame(data)

# Gerar dados para o dashboard
if dashboard_period == "Mensal":
    periods = 12
elif dashboard_period == "Trimestral":
    periods = 4
else:  # Anual
    periods = 5  # 5 anos de dados

kpi_data = generate_kpi_data(
    periods, monthly_revenue_estimate, target_revenue_growth, 
    current_occupancy, avg_price_per_hour, total_fields,
    monthly_fixed_costs, variable_cost_percentage
)

# Calcular KPIs atuais (último período)
current_kpis = kpi_data.iloc[-1]
previous_kpis = kpi_data.iloc[-2] if len(kpi_data) > 1 else current_kpis

# Interface principal - Métricas principais
st.markdown("## 🎯 Métricas Principais")

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    revenue_delta = ((current_kpis['receita'] / previous_kpis['receita']) - 1) * 100 if previous_kpis['receita'] > 0 else 0
    st.metric(
        "Receita",
        format_currency(current_kpis['receita'], currency),
        delta=f"{revenue_delta:+.1f}%"
    )

with col2:
    st.metric(
        "Margem EBITDA",
        f"{current_kpis['margem_ebitda']*100:.1f}%",
        delta=f"Meta: {target_ebitda_margin*100:.0f}%"
    )

with col3:
    occupancy_delta = (current_kpis['ocupacao'] - previous_kpis['ocupacao']) * 100
    st.metric(
        "Taxa de Ocupação",
        f"{current_kpis['ocupacao']*100:.1f}%",
        delta=f"{occupancy_delta:+.1f}pp"
    )

with col4:
    st.metric(
        "Receita por Quadra",
        format_currency(current_kpis['receita_por_quadra'], currency),
        delta=f"vs {format_currency(previous_kpis['receita_por_quadra'], currency)}"
    )

with col5:
    st.metric(
        "Horas Vendidas",
        f"{current_kpis['horas_vendidas']:.0f}h",
        delta=f"{current_kpis['horas_vendidas'] - previous_kpis['horas_vendidas']:+.0f}h"
    )

# Dashboard de gráficos
st.markdown("## 📊 Dashboard de Performance")

# Criar subplot com múltiplos gráficos
fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=(
        'Evolução da Receita e Custos',
        'Margens de Rentabilidade',
        'Taxa de Ocupação',
        'Receita por Hora vs Meta'
    ),
    specs=[[{"secondary_y": True}, {"secondary_y": False}],
           [{"secondary_y": False}, {"secondary_y": True}]]
)

# Gráfico 1: Receita e Custos
fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['receita'], 
              name='Receita', line=dict(color='blue', width=3)),
    row=1, col=1
)

fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['custos_totais'], 
              name='Custos Totais', line=dict(color='red', width=2)),
    row=1, col=1
)

fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['ebitda'], 
              name='EBITDA', line=dict(color='green', width=2)),
    row=1, col=1, secondary_y=True
)

# Gráfico 2: Margens
fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['margem_bruta']*100, 
              name='Margem Bruta (%)', line=dict(color='lightblue')),
    row=1, col=2
)

fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['margem_ebitda']*100, 
              name='Margem EBITDA (%)', line=dict(color='darkblue')),
    row=1, col=2
)

# Linha de meta EBITDA
fig.add_hline(y=target_ebitda_margin*100, line_dash="dash", line_color="red", 
              annotation_text="Meta EBITDA", row=1, col=2)

# Gráfico 3: Ocupação
fig.add_trace(
    go.Bar(x=kpi_data['periodo'], y=kpi_data['ocupacao']*100, 
           name='Ocupação (%)', marker_color='orange'),
    row=2, col=1
)

# Linha de meta ocupação
fig.add_hline(y=target_occupancy*100, line_dash="dash", line_color="red", 
              annotation_text="Meta", row=2, col=1)

# Gráfico 4: Receita por hora
fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=kpi_data['receita_por_hora'], 
              name='Receita/Hora', line=dict(color='purple', width=2)),
    row=2, col=2
)

fig.add_trace(
    go.Scatter(x=kpi_data['periodo'], y=[avg_price_per_hour]*len(kpi_data), 
              name='Preço Médio', line=dict(color='gray', dash='dash')),
    row=2, col=2
)

# Atualizar layout
fig.update_layout(
    height=600,
    showlegend=True,
    title_text="Dashboard de KPIs Operacionais e Financeiros"
)

st.plotly_chart(fig, use_container_width=True)

# Análise de performance vs metas
st.markdown("## 🎯 Performance vs Metas")

# Calcular performance atual vs metas
performance_data = {
    'KPI': [
        'Taxa de Ocupação',
        'Margem EBITDA',
        'Receita por Quadra',
        'Crescimento da Receita'
    ],
    'Atual': [
        f"{current_kpis['ocupacao']*100:.1f}%",
        f"{current_kpis['margem_ebitda']*100:.1f}%",
        format_currency(current_kpis['receita_por_quadra'], currency),
        f"{revenue_delta:.1f}%"
    ],
    'Meta': [
        f"{target_occupancy*100:.1f}%",
        f"{target_ebitda_margin*100:.1f}%",
        format_currency(monthly_revenue_estimate / total_fields, currency),
        f"{target_revenue_growth*100:.1f}%"
    ],
    'Status': [
        "✅" if current_kpis['ocupacao'] >= target_occupancy else "🔴",
        "✅" if current_kpis['margem_ebitda'] >= target_ebitda_margin else "🔴",
        "✅" if current_kpis['receita_por_quadra'] >= (monthly_revenue_estimate / total_fields) else "🔴",
        "✅" if revenue_delta >= target_revenue_growth*100 else "🔴"
    ]
}

performance_df = pd.DataFrame(performance_data)
st.dataframe(performance_df, use_container_width=True)

# Análise detalhada por categoria
st.markdown("## 📈 Análises Detalhadas")

tab1, tab2, tab3, tab4 = st.tabs(["Operacionais", "Financeiros", "Eficiência", "Benchmarking"])

with tab1:
    st.markdown("### 🏟️ KPIs Operacionais")
    
    # Métricas operacionais
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # Utilização das quadras
        max_hours = total_fields * operational_hours_day * days_per_month
        utilization_rate = current_kpis['horas_vendidas'] / max_hours
        
        st.metric(
            "Taxa de Utilização",
            f"{utilization_rate*100:.1f}%",
            delta=f"vs Ocupação: {current_kpis['ocupacao']*100:.1f}%"
        )
        
        # Horas disponíveis vs vendidas
        st.metric(
            "Horas Disponíveis/Mês",
            f"{max_hours:.0f}h",
            delta=f"Vendidas: {current_kpis['horas_vendidas']:.0f}h"
        )
    
    with col2:
        # Ticket médio por cliente
        st.metric(
            "Ticket Médio",
            format_currency(current_kpis['ticket_medio'], currency),
            delta="Por cliente/sessão"
        )
        
        # Receita por hora vendida
        st.metric(
            "Receita por Hora Vendida",
            format_currency(current_kpis['receita_por_hora'], currency),
            delta=f"vs Preço: {format_currency(avg_price_per_hour, currency)}"
        )
    
    with col3:
        # Capacidade ociosa
        idle_capacity = (1 - utilization_rate) * 100
        st.metric(
            "Capacidade Ociosa",
            f"{idle_capacity:.1f}%",
            delta="Oportunidade de crescimento"
        )
        
        # Receita perdida
        lost_revenue = (max_hours - current_kpis['horas_vendidas']) * avg_price_per_hour
        st.metric(
            "Receita Perdida",
            format_currency(lost_revenue, currency),
            delta="Potencial não realizado"
        )
    
    # Gráfico de distribuição de ocupação
    fig_occupancy = go.Figure()
    
    fig_occupancy.add_trace(go.Scatter(
        x=kpi_data['periodo'],
        y=kpi_data['ocupacao']*100,
        mode='lines+markers',
        name='Taxa de Ocupação',
        line=dict(color='blue', width=3)
    ))
    
    fig_occupancy.add_hline(y=target_occupancy*100, line_dash="dash", line_color="red", 
                           annotation_text="Meta")
    fig_occupancy.add_hline(y=80, line_dash="dot", line_color="green", 
                           annotation_text="Benchmark Indústria")
    
    fig_occupancy.update_layout(
        title='Evolução da Taxa de Ocupação',
        xaxis_title='Período',
        yaxis_title='Taxa de Ocupação (%)',
        yaxis=dict(range=[0, 100])
    )
    
    st.plotly_chart(fig_occupancy, use_container_width=True)

with tab2:
    st.markdown("### 💰 KPIs Financeiros")
    
    # Análise de rentabilidade
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # ROI mensal
        monthly_investment = monthly_fixed_costs
        monthly_profit = current_kpis['ebitda']
        monthly_roi = (monthly_profit / monthly_investment * 100) if monthly_investment > 0 else 0
        
        st.metric(
            "ROI Mensal",
            f"{monthly_roi:.1f}%",
            delta="Retorno sobre custos fixos"
        )
        
        # Margem de contribuição
        contribution_margin = current_kpis['margem_bruta'] * 100
        st.metric(
            "Margem de Contribuição",
            f"{contribution_margin:.1f}%",
            delta="Receita - Custos Variáveis"
        )
    
    with col2:
        # Ponto de equilíbrio
        break_even_revenue = monthly_fixed_costs / (1 - variable_cost_percentage)
        break_even_hours = break_even_revenue / avg_price_per_hour
        
        st.metric(
            "Break-even Receita",
            format_currency(break_even_revenue, currency),
            delta=f"{break_even_hours:.0f} horas/mês"
        )
        
        # Margem de segurança
        safety_margin = ((current_kpis['receita'] - break_even_revenue) / current_kpis['receita'] * 100) if current_kpis['receita'] > 0 else 0
        st.metric(
            "Margem de Segurança",
            f"{safety_margin:.1f}%",
            delta="Acima do break-even"
        )
    
    with col3:
        # Fluxo de caixa operacional
        operating_cash_flow = current_kpis['ebitda']  # Simplificado
        st.metric(
            "Fluxo de Caixa Operacional",
            format_currency(operating_cash_flow, currency),
            delta="EBITDA do período"
        )
        
        # Eficiência de custos
        cost_efficiency = (current_kpis['custos_totais'] / current_kpis['receita'] * 100) if current_kpis['receita'] > 0 else 0
        st.metric(
            "Eficiência de Custos",
            f"{cost_efficiency:.1f}%",
            delta="Custos/Receita"
        )
    
    # Gráfico de composição de custos
    fig_costs = go.Figure(data=[
        go.Pie(
            labels=['Custos Fixos', 'Custos Variáveis', 'EBITDA'],
            values=[current_kpis['custos_fixos'], current_kpis['custos_variaveis'], current_kpis['ebitda']],
            hole=0.3
        )
    ])
    
    fig_costs.update_layout(title="Composição de Custos e EBITDA")
    st.plotly_chart(fig_costs, use_container_width=True)

with tab3:
    st.markdown("### ⚡ KPIs de Eficiência")
    
    # Calcular KPIs de eficiência
    efficiency_kpis = {
        'Receita por m² (estimado)': current_kpis['receita'] / (total_fields * 400),  # Assumindo 400m² por quadra
        'Custo por hora operacional': current_kpis['custos_totais'] / (operational_hours_day * days_per_month),
        'Receita por dia de operação': current_kpis['receita'] / days_per_month,
        'Eficiência de preço': current_kpis['receita_por_hora'] / avg_price_per_hour,
        'Produtividade por quadra': current_kpis['horas_vendidas'] / total_fields,
        'Conversão de capacidade': utilization_rate
    }
    
    # Mostrar KPIs de eficiência
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            "Receita por m²",
            f"{efficiency_kpis['Receita por m² (estimado)']:.2f}",
            delta=f"{currency}/m²"
        )
        
        st.metric(
            "Produtividade por Quadra",
            f"{efficiency_kpis['Produtividade por quadra']:.0f}h",
            delta="Horas vendidas/quadra"
        )
    
    with col2:
        st.metric(
            "Custo por Hora Operacional",
            format_currency(efficiency_kpis['Custo por hora operacional'], currency),
            delta="Custo total/hora disponível"
        )
        
        st.metric(
            "Eficiência de Preço",
            f"{efficiency_kpis['Eficiência de preço']:.2f}",
            delta="Receita real/preço teórico"
        )
    
    with col3:
        st.metric(
            "Receita por Dia",
            format_currency(efficiency_kpis['Receita por dia de operação'], currency),
            delta="Receita média diária"
        )
        
        st.metric(
            "Conversão de Capacidade",
            f"{efficiency_kpis['Conversão de capacidade']*100:.1f}%",
            delta="Capacidade utilizada"
        )
    
    # Gráfico radar de eficiência
    categories = ['Ocupação', 'Margem', 'Preço', 'Produtividade', 'Eficiência']
    
    # Normalizar valores para 0-100
    values = [
        current_kpis['ocupacao'] * 100,
        current_kpis['margem_ebitda'] * 100 * 2,  # *2 para escalar melhor
        (current_kpis['receita_por_hora'] / avg_price_per_hour) * 100,
        (efficiency_kpis['Produtividade por quadra'] / (operational_hours_day * days_per_month)) * 100,
        (1 - cost_efficiency / 100) * 100  # Inverter para que maior seja melhor
    ]
    
    fig_radar = go.Figure()
    
    fig_radar.add_trace(go.Scatterpolar(
        r=values,
        theta=categories,
        fill='toself',
        name='Performance Atual'
    ))
    
    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )),
        title="Radar de Eficiência Operacional"
    )
    
    st.plotly_chart(fig_radar, use_container_width=True)

with tab4:
    st.markdown("### 📊 Benchmarking da Indústria")
    
    # Obter benchmarks da indústria
    industry_benchmarks = get_industry_benchmarks(market)
    
    # Comparar com benchmarks
    benchmark_comparison = {
        'Métrica': [
            'Taxa de Ocupação Média',
            'Margem de Lucro',
            'Receita por Quadra (Anual)',
            'ROI Esperado'
        ],
        'Seu Clube': [
            f"{current_kpis['ocupacao']*100:.1f}%",
            f"{current_kpis['margem_ebitda']*100:.1f}%",
            format_currency(current_kpis['receita_por_quadra'] * 12, currency),
            f"{monthly_roi:.1f}%"
        ],
        'Benchmark Indústria': [
            f"{industry_benchmarks['avg_occupancy']*100:.0f}%",
            f"{industry_benchmarks['avg_profit_margin']*100:.0f}%",
            format_currency(industry_benchmarks['avg_revenue_per_field'], currency),
            f"{industry_benchmarks['roi_expected']*100:.0f}%"
        ],
        'Status': [
            "✅" if current_kpis['ocupacao'] >= industry_benchmarks['avg_occupancy'] else "🔴",
            "✅" if current_kpis['margem_ebitda'] >= industry_benchmarks['avg_profit_margin'] else "🔴",
            "✅" if current_kpis['receita_por_quadra'] * 12 >= industry_benchmarks['avg_revenue_per_field'] else "🔴",
            "✅" if monthly_roi >= industry_benchmarks['roi_expected']*100 else "🔴"
        ]
    }
    
    benchmark_df = pd.DataFrame(benchmark_comparison)
    st.dataframe(benchmark_df, use_container_width=True)
    
    # Gráfico de comparação
    metrics = ['Ocupação (%)', 'Margem (%)', 'ROI (%)']
    your_values = [current_kpis['ocupacao']*100, current_kpis['margem_ebitda']*100, monthly_roi]
    benchmark_values = [industry_benchmarks['avg_occupancy']*100, industry_benchmarks['avg_profit_margin']*100, industry_benchmarks['roi_expected']*100]
    
    fig_comparison = go.Figure()
    
    fig_comparison.add_trace(go.Bar(
        x=metrics,
        y=your_values,
        name='Seu Clube',
        marker_color='blue'
    ))
    
    fig_comparison.add_trace(go.Bar(
        x=metrics,
        y=benchmark_values,
        name='Benchmark Indústria',
        marker_color='gray'
    ))
    
    fig_comparison.update_layout(
        title='Comparação com Benchmarks da Indústria',
        yaxis_title='Percentual (%)',
        barmode='group'
    )
    
    st.plotly_chart(fig_comparison, use_container_width=True)

# Alertas e recomendações automáticas
st.markdown("## 🚨 Alertas e Recomendações")

alerts = []

# Verificar performance vs metas
if current_kpis['ocupacao'] < target_occupancy * 0.9:
    alerts.append({
        'tipo': 'warning',
        'titulo': 'Taxa de Ocupação Baixa',
        'mensagem': f"Ocupação atual ({current_kpis['ocupacao']*100:.1f}%) está abaixo da meta ({target_occupancy*100:.0f}%). Considere estratégias de marketing ou ajuste de preços."
    })

if current_kpis['margem_ebitda'] < target_ebitda_margin * 0.8:
    alerts.append({
        'tipo': 'error',
        'titulo': 'Margem EBITDA Crítica',
        'mensagem': f"Margem EBITDA ({current_kpis['margem_ebitda']*100:.1f}%) muito abaixo da meta ({target_ebitda_margin*100:.0f}%). Revise estrutura de custos urgentemente."
    })

if utilization_rate > 0.9:
    alerts.append({
        'tipo': 'success',
        'titulo': 'Alta Utilização',
        'mensagem': f"Utilização das quadras ({utilization_rate*100:.1f}%) está muito alta. Considere expansão ou aumento de preços."
    })

if current_kpis['receita_por_hora'] < avg_price_per_hour * 0.8:
    alerts.append({
        'tipo': 'warning',
        'titulo': 'Receita por Hora Baixa',
        'mensagem': f"Receita por hora ({format_currency(current_kpis['receita_por_hora'], currency)}) está abaixo do preço médio. Verifique descontos excessivos."
    })

if safety_margin < 20:
    alerts.append({
        'tipo': 'warning',
        'titulo': 'Margem de Segurança Baixa',
        'mensagem': f"Margem de segurança ({safety_margin:.1f}%) baixa. Receita está próxima do ponto de equilíbrio."
    })

# Comparação com benchmark
if current_kpis['ocupacao'] < industry_benchmarks['avg_occupancy']:
    alerts.append({
        'tipo': 'info',
        'titulo': 'Abaixo do Benchmark',
        'mensagem': f"Ocupação está abaixo da média da indústria ({industry_benchmarks['avg_occupancy']*100:.0f}%). Há espaço para melhoria."
    })

# Mostrar alertas
if alerts:
    for alert in alerts:
        if alert['tipo'] == 'error':
            st.error(f"🔴 **{alert['titulo']}**: {alert['mensagem']}")
        elif alert['tipo'] == 'warning':
            st.warning(f"🟡 **{alert['titulo']}**: {alert['mensagem']}")
        elif alert['tipo'] == 'success':
            st.success(f"🟢 **{alert['titulo']}**: {alert['mensagem']}")
        else:
            st.info(f"ℹ️ **{alert['titulo']}**: {alert['mensagem']}")
else:
    st.success("✅ **Performance Satisfatória**: Todos os KPIs estão dentro de parâmetros aceitáveis.")

# Exportação do dashboard
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'KPIs_Detalhados': kpi_data,
    'Performance_vs_Metas': performance_df,
    'Benchmark_Industria': benchmark_df,
    'Alertas': pd.DataFrame(alerts) if alerts else pd.DataFrame(),
    'Resumo_Executivo': pd.DataFrame([{
        'Data_Analise': datetime.now().strftime('%Y-%m-%d'),
        'Receita_Atual': current_kpis['receita'],
        'Margem_EBITDA': current_kpis['margem_ebitda'],
        'Taxa_Ocupacao': current_kpis['ocupacao'],
        'Status_Geral': 'Satisfatório' if len([a for a in alerts if a['tipo'] == 'error']) == 0 else 'Atenção Necessária'
    }])
}

export_to_streamlit(export_data, "dashboard_kpis")

# Rodapé com última atualização
st.markdown("---")
st.caption(f"📅 **Última atualização**: {datetime.now().strftime('%d/%m/%Y às %H:%M')} | **Período analisado**: {dashboard_period} | **Mercado**: {market}")

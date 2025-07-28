import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from utils.market_configs import get_market_config
from utils.financial_calculations import calculate_working_capital, format_currency
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Capital de Giro", page_icon="💰", layout="wide")

st.title("💰 Análise de Capital de Giro")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']

# Sidebar para configurações
with st.sidebar:
    st.header("⚙️ Configurações do Capital de Giro")
    
    # Período de análise
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2036)), index=0)
    analysis_months = st.slider("Meses de Análise:", 12, 60, 24)
    
    st.markdown("### 📊 Parâmetros Operacionais")
    
    # Receita mensal estimada
    monthly_revenue = st.number_input(
        "Receita Mensal Média:", 
        value=50000.0, 
        help="Receita mensal estimada baseada na DRE"
    )
    
    # Prazo médio de recebimento
    receivables_days = st.slider(
        "Prazo Médio de Recebimento (dias):", 
        0, 90, 
        market_config.get('working_capital_days', 30),
        help="Dias entre a venda e o recebimento"
    )
    
    # Prazo médio de pagamento
    payables_days = st.slider(
        "Prazo Médio de Pagamento (dias):", 
        0, 90, 45,
        help="Dias para pagamento de fornecedores"
    )
    
    # Estoque médio
    inventory_days = st.slider(
        "Dias de Estoque:", 
        0, 60, 15,
        help="Dias de estoque (materiais esportivos, cafeteria)"
    )
    
    st.markdown("### 💳 Formas de Pagamento")
    
    # Mix de recebimento
    cash_percentage = st.slider("% Pagamento à Vista:", 0.0, 1.0, 0.4)
    card_percentage = st.slider("% Cartão (D+1):", 0.0, 1.0, 0.5)
    term_percentage = 1.0 - cash_percentage - card_percentage
    
    st.write(f"% Prazo: {term_percentage:.1%}")
    
    # Sazonalidade
    st.markdown("### 📈 Sazonalidade")
    seasonal_variation = st.slider(
        "Variação Sazonal (%):", 
        0.0, 0.5, 0.2,
        help="Variação percentual entre alta e baixa temporada"
    )

# Função para calcular necessidade de capital de giro
def calculate_working_capital_need(revenue, receivables_days, inventory_days, payables_days):
    """Calcula necessidade de capital de giro"""
    # Contas a receber
    receivables = (revenue * receivables_days) / 30
    
    # Estoque
    # Para clube de futebol: materiais esportivos, produtos cafeteria
    inventory = (revenue * 0.15 * inventory_days) / 30  # 15% da receita em custos de estoque
    
    # Fornecedores a pagar
    # Custos variáveis que podem ser pagos a prazo
    payables = (revenue * 0.20 * payables_days) / 30  # 20% da receita em custos a prazo
    
    # Necessidade Capital de Giro = Ativo Circulante Operacional - Passivo Circulante Operacional
    ncg = receivables + inventory - payables
    
    return {
        'receivables': receivables,
        'inventory': inventory,
        'payables': payables,
        'ncg': ncg,
        'ncg_percentage': (ncg / revenue) * 100 if revenue > 0 else 0
    }

# Calcular projeções mensais
monthly_projections = []
cumulative_ncg = 0

for month in range(analysis_months):
    year = start_year + (month // 12)
    month_in_year = (month % 12) + 1
    
    # Aplicar sazonalidade
    seasonal_factor = 1.0
    if month_in_year in [12, 1, 2, 3]:  # Verão
        seasonal_factor = 1 + seasonal_variation
    elif month_in_year in [6, 7, 8]:  # Inverno
        seasonal_factor = 1 - seasonal_variation
    
    # Receita ajustada
    adjusted_revenue = monthly_revenue * seasonal_factor
    
    # Aplicar crescimento anual
    growth_factor = (1 + market_config['growth_potential']) ** ((month) / 12)
    adjusted_revenue *= growth_factor
    
    # Calcular capital de giro
    wc_data = calculate_working_capital_need(
        adjusted_revenue, receivables_days, inventory_days, payables_days
    )
    
    # Adicionar dados do mês
    month_data = {
        'mes': month + 1,
        'ano': year,
        'mes_ano': f"{month_in_year:02d}/{year}",
        'receita': adjusted_revenue,
        'contas_receber': wc_data['receivables'],
        'estoque': wc_data['inventory'],
        'fornecedores': wc_data['payables'],
        'ncg': wc_data['ncg'],
        'ncg_percentual': wc_data['ncg_percentage'],
        'variacao_ncg': wc_data['ncg'] - cumulative_ncg,
        'investimento_cg': max(0, wc_data['ncg'] - cumulative_ncg),  # Investimento adicional necessário
        'liberacao_cg': max(0, cumulative_ncg - wc_data['ncg'])  # Liberação de capital
    }
    
    cumulative_ncg = wc_data['ncg']
    monthly_projections.append(month_data)

# Criar DataFrame
wc_df = pd.DataFrame(monthly_projections)

# Interface principal
col1, col2 = st.columns([3, 1])

with col2:
    st.markdown("### 📋 Resumo dos Parâmetros")
    st.write(f"**Mercado:** {market}")
    st.write(f"**Moeda:** {currency}")
    st.write(f"**Período:** {analysis_months} meses")
    st.write(f"**Recebimento:** {receivables_days} dias")
    st.write(f"**Pagamento:** {payables_days} dias")
    st.write(f"**Estoque:** {inventory_days} dias")
    
    # Mix de recebimento
    st.markdown("**Mix de Recebimento:**")
    st.write(f"À vista: {cash_percentage:.1%}")
    st.write(f"Cartão: {card_percentage:.1%}")
    st.write(f"A prazo: {term_percentage:.1%}")

with col1:
    st.markdown("### 📊 Evolução do Capital de Giro")
    
    # Gráfico principal
    fig_main = go.Figure()
    
    fig_main.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=wc_df['contas_receber'],
        name='Contas a Receber',
        stackgroup='assets',
        line=dict(color='blue')
    ))
    
    fig_main.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=wc_df['estoque'],
        name='Estoque',
        stackgroup='assets',
        line=dict(color='orange')
    ))
    
    fig_main.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=-wc_df['fornecedores'],
        name='Fornecedores (negativo)',
        line=dict(color='red', dash='dash')
    ))
    
    fig_main.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=wc_df['ncg'],
        name='NCG Total',
        line=dict(color='green', width=3)
    ))
    
    fig_main.update_layout(
        title='Evolução dos Componentes do Capital de Giro',
        xaxis_title='Mês',
        yaxis_title=f'Valor ({currency})',
        hovermode='x'
    )
    
    st.plotly_chart(fig_main, use_container_width=True)

# Tabela detalhada (primeiros 12 meses)
st.markdown("### 📅 Detalhamento Mensal (Primeiro Ano)")

first_year_df = wc_df.head(12).copy()

# Formatar valores para exibição
display_cols = ['receita', 'contas_receber', 'estoque', 'fornecedores', 'ncg', 'variacao_ncg']
for col in display_cols:
    first_year_df[f'{col}_formatted'] = first_year_df[col].apply(lambda x: format_currency(x, currency))

# Selecionar colunas para exibição
display_df = first_year_df[['mes_ano', 'receita_formatted', 'contas_receber_formatted', 
                           'estoque_formatted', 'fornecedores_formatted', 'ncg_formatted', 
                           'variacao_ncg_formatted', 'ncg_percentual']].copy()

display_df.columns = ['Mês/Ano', 'Receita', 'Contas a Receber', 'Estoque', 'Fornecedores', 
                     'NCG', 'Variação NCG', 'NCG (% Receita)']

# Formatar percentual
display_df['NCG (% Receita)'] = display_df['NCG (% Receita)'].apply(lambda x: f"{x:.1f}%")

st.dataframe(display_df, use_container_width=True)

# Análises complementares
st.markdown("## 📊 Análises Complementares")

tab1, tab2, tab3, tab4 = st.tabs(["Investimentos em CG", "Indicadores", "Cenários", "Fluxo de Caixa"])

with tab1:
    # Gráfico de investimentos necessários
    fig_invest = go.Figure()
    
    fig_invest.add_trace(go.Bar(
        x=wc_df['mes'],
        y=wc_df['investimento_cg'],
        name='Investimento Adicional',
        marker_color='red'
    ))
    
    fig_invest.add_trace(go.Bar(
        x=wc_df['mes'],
        y=-wc_df['liberacao_cg'],
        name='Liberação de Capital',
        marker_color='green'
    ))
    
    fig_invest.update_layout(
        title='Necessidades de Investimento em Capital de Giro',
        xaxis_title='Mês',
        yaxis_title=f'Valor ({currency})',
        barmode='relative'
    )
    
    st.plotly_chart(fig_invest, use_container_width=True)
    
    # Resumo de investimentos
    total_investment = wc_df['investimento_cg'].sum()
    total_liberation = wc_df['liberacao_cg'].sum()
    net_investment = total_investment - total_liberation
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Investido", format_currency(total_investment, currency))
    with col2:
        st.metric("Total Liberado", format_currency(total_liberation, currency))
    with col3:
        st.metric("Investimento Líquido", format_currency(net_investment, currency))

with tab2:
    # Indicadores de eficiência
    st.markdown("### 🎯 Indicadores de Eficiência do Capital de Giro")
    
    # Calcular indicadores médios
    avg_ncg_percentage = wc_df['ncg_percentual'].mean()
    max_ncg = wc_df['ncg'].max()
    min_ncg = wc_df['ncg'].min()
    
    # Ciclo financeiro
    financial_cycle = receivables_days + inventory_days - payables_days
    
    # Giro do capital de giro (anualizado)
    avg_revenue = wc_df['receita'].mean() * 12
    avg_ncg = wc_df['ncg'].mean()
    wc_turnover = avg_revenue / avg_ncg if avg_ncg > 0 else 0
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "NCG Média (% Receita)",
            f"{avg_ncg_percentage:.1f}%",
            delta="Ideal < 15%" if avg_ncg_percentage < 15 else "Alto"
        )
    
    with col2:
        st.metric(
            "Ciclo Financeiro",
            f"{financial_cycle} dias",
            delta="Eficiente" if financial_cycle < 30 else "Longo"
        )
    
    with col3:
        st.metric(
            "Giro do CG (anual)",
            f"{wc_turnover:.1f}x",
            delta="Bom" if wc_turnover > 6 else "Baixo"
        )
    
    with col4:
        st.metric(
            "Variação NCG",
            format_currency(max_ncg - min_ncg, currency),
            delta="Amplitude"
        )
    
    # Gráfico de indicadores
    fig_indicators = go.Figure()
    
    fig_indicators.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=wc_df['ncg_percentual'],
        name='NCG (% Receita)',
        line=dict(color='blue')
    ))
    
    fig_indicators.add_hline(y=15, line_dash="dash", line_color="red", 
                           annotation_text="Meta: 15%")
    
    fig_indicators.update_layout(
        title='NCG como % da Receita',
        xaxis_title='Mês',
        yaxis_title='Percentual (%)',
        yaxis=dict(range=[0, max(25, wc_df['ncg_percentual'].max() * 1.1)])
    )
    
    st.plotly_chart(fig_indicators, use_container_width=True)

with tab3:
    st.markdown("### 🔄 Análise de Cenários")
    
    # Criar cenários
    scenarios = {
        'Conservador': {'growth': 0.05, 'receivables': receivables_days + 10, 'seasonal': seasonal_variation + 0.1},
        'Base': {'growth': market_config['growth_potential'], 'receivables': receivables_days, 'seasonal': seasonal_variation},
        'Otimista': {'growth': market_config['growth_potential'] + 0.05, 'receivables': max(0, receivables_days - 10), 'seasonal': max(0, seasonal_variation - 0.1)}
    }
    
    scenario_results = []
    
    for scenario_name, params in scenarios.items():
        # Recalcular para o cenário
        scenario_ncg = []
        for month in range(12):  # Primeiro ano apenas
            month_in_year = (month % 12) + 1
            
            # Sazonalidade
            seasonal_factor = 1.0
            if month_in_year in [12, 1, 2, 3]:
                seasonal_factor = 1 + params['seasonal']
            elif month_in_year in [6, 7, 8]:
                seasonal_factor = 1 - params['seasonal']
            
            # Receita ajustada
            adjusted_revenue = monthly_revenue * seasonal_factor * (1 + params['growth']) ** (month / 12)
            
            # Capital de giro
            wc_data = calculate_working_capital_need(
                adjusted_revenue, params['receivables'], inventory_days, payables_days
            )
            
            scenario_ncg.append(wc_data['ncg'])
        
        avg_ncg = np.mean(scenario_ncg)
        max_ncg = np.max(scenario_ncg)
        
        scenario_results.append({
            'Cenário': scenario_name,
            'NCG Médio': format_currency(avg_ncg, currency),
            'NCG Máximo': format_currency(max_ncg, currency),
            'Investimento': format_currency(max_ncg, currency)
        })
    
    scenario_df = pd.DataFrame(scenario_results)
    st.dataframe(scenario_df, use_container_width=True)

with tab4:
    st.markdown("### 💰 Impacto no Fluxo de Caixa")
    
    # Calcular impacto no fluxo de caixa
    wc_df['fluxo_cg'] = -wc_df['variacao_ncg']  # Variação negativa = saída de caixa
    wc_df['fluxo_acumulado'] = wc_df['fluxo_cg'].cumsum()
    
    fig_cashflow = go.Figure()
    
    fig_cashflow.add_trace(go.Bar(
        x=wc_df['mes'],
        y=wc_df['fluxo_cg'],
        name='Fluxo Mensal',
        marker_color=['red' if x < 0 else 'green' for x in wc_df['fluxo_cg']]
    ))
    
    fig_cashflow.add_trace(go.Scatter(
        x=wc_df['mes'],
        y=wc_df['fluxo_acumulado'],
        name='Fluxo Acumulado',
        line=dict(color='blue', width=3),
        yaxis='y2'
    ))
    
    fig_cashflow.update_layout(
        title='Impacto do Capital de Giro no Fluxo de Caixa',
        xaxis_title='Mês',
        yaxis_title=f'Fluxo Mensal ({currency})',
        yaxis2=dict(
            title=f'Fluxo Acumulado ({currency})',
            side='right',
            overlaying='y'
        )
    )
    
    st.plotly_chart(fig_cashflow, use_container_width=True)

# KPIs finais
st.markdown("## 🎯 Resumo Executivo")

col1, col2, col3, col4 = st.columns(4)

final_ncg = wc_df['ncg'].iloc[-1]
initial_investment = wc_df['ncg'].iloc[0] if len(wc_df) > 0 else 0
ncg_growth = ((final_ncg / initial_investment) ** (12/analysis_months) - 1) * 100 if initial_investment > 0 else 0

with col1:
    st.metric(
        "NCG Inicial",
        format_currency(initial_investment, currency),
        delta="Investimento necessário"
    )

with col2:
    st.metric(
        "NCG Final",
        format_currency(final_ncg, currency),
        delta=f"{ncg_growth:+.1f}% aa"
    )

with col3:
    st.metric(
        "Ciclo Financeiro",
        f"{financial_cycle} dias",
        delta="Receb. + Estoque - Pagto."
    )

with col4:
    st.metric(
        "Eficiência CG",
        f"{wc_turnover:.1f}x",
        delta="Giro anual"
    )

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'Capital_de_Giro': wc_df,
    'Cenarios': pd.DataFrame(scenario_results),
    'Resumo': pd.DataFrame([{
        'NCG_Inicial': initial_investment,
        'NCG_Final': final_ncg,
        'Ciclo_Financeiro': financial_cycle,
        'Giro_CG': wc_turnover,
        'Investimento_Total': total_investment,
        'NCG_Medio_Percentual': avg_ncg_percentage
    }])
}

export_to_streamlit(export_data, "capital_de_giro")

# Recomendações
st.markdown("## 💡 Recomendações")

recommendations = []

if avg_ncg_percentage > 20:
    recommendations.append("⚠️ **NCG Alto**: NCG representa mais de 20% da receita. Considere renegociar prazos.")

if financial_cycle > 45:
    recommendations.append("📅 **Ciclo Longo**: Ciclo financeiro superior a 45 dias. Busque reduzir prazos de recebimento.")

if wc_turnover < 4:
    recommendations.append("🔄 **Baixo Giro**: Capital de giro com baixa rotatividade. Otimize gestão de estoque e cobrança.")

if receivables_days > payables_days + 15:
    recommendations.append("💳 **Descasamento**: Grande diferença entre recebimento e pagamento. Negocie melhores condições.")

if seasonal_variation > 0.3:
    recommendations.append("📈 **Alta Sazonalidade**: Variação sazonal alta. Mantenha reserva para períodos baixos.")

if len(recommendations) == 0:
    recommendations.append("✅ **Gestão Adequada**: Parâmetros de capital de giro estão dentro de níveis aceitáveis.")

for rec in recommendations:
    st.info(rec)

st.warning("⚠️ **Importante**: Monitore o capital de giro mensalmente e ajuste as projeções conforme a realidade operacional. Mantenha sempre uma reserva de segurança para cobrir variações sazonais e imprevistas.")

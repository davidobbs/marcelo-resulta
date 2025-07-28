import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_tax_calculation, MARKETS
from utils.financial_calculations import format_currency
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Impostos & Tributação", page_icon="🏛️", layout="wide")

st.title("🏛️ Análise de Impostos e Tributação")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']

# Sidebar para configurações
with st.sidebar:
    st.header("⚙️ Configurações Tributárias")
    
    # Período de análise
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2036)), index=0)
    projection_years = st.slider("Anos de Projeção:", 1, 12, 5)
    
    st.markdown("### 💰 Parâmetros de Receita")
    
    # Receita anual estimada
    annual_revenue = st.number_input(
        "Receita Anual Estimada:", 
        value=720000.0,
        help="Receita bruta anual estimada"
    )
    
    # Crescimento anual
    revenue_growth = st.slider(
        "Crescimento Anual:", 
        0.0, 0.30, 
        market_config['growth_potential']
    )
    
    # Margem de lucro
    profit_margin = st.slider(
        "Margem de Lucro (%):", 
        0.0, 0.50, 0.20
    )
    
    st.markdown("### 🏢 Regime Tributário")
    
    if market == "Brasil":
        tax_regime = st.selectbox(
            "Regime Tributário:",
            ["Simples Nacional", "Lucro Presumido", "Lucro Real"],
            help="Escolha o regime tributário mais adequado"
        )
        
        if tax_regime == "Simples Nacional":
            simples_rate = st.slider("Alíquota Simples Nacional (%):", 6.0, 17.0, 8.0)
        
        # Outros impostos brasileiros
        st.markdown("**Impostos Adicionais:**")
        iss_rate = st.slider("ISS (%):", 2.0, 5.0, 5.0)
        pis_cofins_rate = st.slider("PIS/COFINS (%):", 3.0, 4.0, 3.65)
        
    elif market == "Europa":
        # Impostos europeus
        vat_rate = st.slider("VAT/IVA (%):", 15.0, 25.0, 20.0)
        corporate_tax_rate = st.slider("Imposto Corporativo (%):", 20.0, 35.0, 25.0)
        social_security_rate = st.slider("Contribuições Sociais (%):", 10.0, 20.0, 15.0)
        
    elif market == "Emirados Árabes":
        # Impostos dos Emirados
        vat_rate = st.slider("VAT (%):", 0.0, 10.0, 5.0)
        corporate_tax_rate = st.slider("Corporate Tax (%):", 0.0, 15.0, 9.0)
        
    # Opções de otimização
    st.markdown("### 📊 Otimização Fiscal")
    
    apply_deductions = st.checkbox("Aplicar Deduções Fiscais", value=True)
    if apply_deductions:
        deduction_rate = st.slider("Deduções (% da receita):", 0.0, 15.0, 5.0)
    else:
        deduction_rate = 0.0
    
    tax_planning = st.checkbox("Planejamento Tributário Otimizado", value=False)

# Função para calcular impostos detalhados
def calculate_detailed_taxes(revenue, profit, market, regime=None, custom_rates=None):
    """Calcula impostos detalhados por mercado e regime"""
    
    taxes = {}
    
    if market == "Brasil":
        if regime == "Simples Nacional":
            taxes['simples_nacional'] = revenue * (custom_rates.get('simples_rate', 8.0) / 100)
            taxes['iss'] = revenue * (custom_rates.get('iss_rate', 5.0) / 100)
            taxes['total_federal'] = taxes['simples_nacional']
            taxes['total_municipal'] = taxes['iss']
            
        elif regime == "Lucro Presumido":
            presumed_profit = revenue * 0.32  # 32% presunção para serviços
            taxes['irpj'] = presumed_profit * 0.15
            taxes['adicional_irpj'] = max(0, (presumed_profit - 240000) * 0.10)
            taxes['csll'] = presumed_profit * 0.09
            taxes['pis'] = revenue * 0.0065
            taxes['cofins'] = revenue * 0.03
            taxes['iss'] = revenue * (custom_rates.get('iss_rate', 5.0) / 100)
            taxes['total_federal'] = taxes['irpj'] + taxes['adicional_irpj'] + taxes['csll'] + taxes['pis'] + taxes['cofins']
            taxes['total_municipal'] = taxes['iss']
            
        elif regime == "Lucro Real":
            taxes['irpj'] = profit * 0.15 if profit > 0 else 0
            taxes['adicional_irpj'] = max(0, (profit - 240000) * 0.10) if profit > 240000 else 0
            taxes['csll'] = profit * 0.09 if profit > 0 else 0
            taxes['pis'] = revenue * 0.0165
            taxes['cofins'] = revenue * 0.076
            taxes['iss'] = revenue * (custom_rates.get('iss_rate', 5.0) / 100)
            taxes['total_federal'] = taxes['irpj'] + taxes['adicional_irpj'] + taxes['csll'] + taxes['pis'] + taxes['cofins']
            taxes['total_municipal'] = taxes['iss']
    
    elif market == "Europa":
        taxes['vat'] = revenue * (custom_rates.get('vat_rate', 20.0) / 100)
        taxes['corporate_tax'] = profit * (custom_rates.get('corporate_tax_rate', 25.0) / 100) if profit > 0 else 0
        taxes['social_security'] = revenue * (custom_rates.get('social_security_rate', 15.0) / 100)
        taxes['total_indirect'] = taxes['vat']
        taxes['total_direct'] = taxes['corporate_tax'] + taxes['social_security']
    
    elif market == "Emirados Árabes":
        taxes['vat'] = revenue * (custom_rates.get('vat_rate', 5.0) / 100)
        taxes['corporate_tax'] = profit * (custom_rates.get('corporate_tax_rate', 9.0) / 100) if profit > 0 else 0
        taxes['total_indirect'] = taxes['vat']
        taxes['total_direct'] = taxes['corporate_tax']
    
    # Total de impostos
    taxes['total'] = sum([v for k, v in taxes.items() if k.startswith('total_') or k in ['simples_nacional', 'iss']])
    
    return taxes

# Calcular projeções anuais
tax_projections = []
custom_rates = {}

# Preparar taxas customizadas baseadas no mercado
if market == "Brasil":
    custom_rates = {
        'simples_rate': globals().get('simples_rate', 8.0) if 'tax_regime' in globals() and tax_regime == "Simples Nacional" else 8.0,
        'iss_rate': iss_rate
    }
elif market == "Europa":
    custom_rates = {
        'vat_rate': vat_rate,
        'corporate_tax_rate': corporate_tax_rate,
        'social_security_rate': social_security_rate
    }
elif market == "Emirados Árabes":
    custom_rates = {
        'vat_rate': vat_rate,
        'corporate_tax_rate': corporate_tax_rate
    }

for year in range(projection_years):
    year_number = start_year + year
    
    # Receita ajustada por crescimento
    adjusted_revenue = annual_revenue * (1 + revenue_growth) ** year
    
    # Lucro estimado
    gross_profit = adjusted_revenue * profit_margin
    
    # Aplicar deduções
    if apply_deductions:
        deductions = adjusted_revenue * (deduction_rate / 100)
        taxable_revenue = adjusted_revenue - deductions
        taxable_profit = gross_profit - deductions
    else:
        deductions = 0
        taxable_revenue = adjusted_revenue
        taxable_profit = gross_profit
    
    # Calcular impostos
    if market == "Brasil":
        regime = globals().get('tax_regime', 'Simples Nacional')
    else:
        regime = None
        
    taxes = calculate_detailed_taxes(taxable_revenue, taxable_profit, market, regime, custom_rates)
    
    # Aplicar otimização fiscal se selecionada
    if tax_planning:
        optimization_factor = 0.85  # 15% de redução através de planejamento
        for key in taxes:
            if key != 'total':
                taxes[key] *= optimization_factor
        taxes['total'] = sum([v for k, v in taxes.items() if k.startswith('total_') or k in ['simples_nacional', 'iss']])
    
    # Adicionar aos dados
    year_data = {
        'ano': year_number,
        'receita_bruta': adjusted_revenue,
        'deducoes': deductions,
        'receita_tributavel': taxable_revenue,
        'lucro_bruto': gross_profit,
        'lucro_tributavel': taxable_profit,
        'planejamento_aplicado': tax_planning
    }
    
    # Adicionar impostos específicos
    year_data.update(taxes)
    
    # Cálculos adicionais
    year_data['carga_tributaria_total'] = (taxes['total'] / adjusted_revenue) * 100
    year_data['receita_liquida'] = adjusted_revenue - taxes['total']
    year_data['lucro_liquido'] = taxable_profit - taxes.get('total_direct', taxes.get('corporate_tax', 0))
    
    tax_projections.append(year_data)

# Criar DataFrame
tax_df = pd.DataFrame(tax_projections)

# Interface principal
col1, col2 = st.columns([3, 1])

with col2:
    st.markdown("### 📋 Resumo Tributário")
    st.write(f"**Mercado:** {market}")
    st.write(f"**Moeda:** {currency}")
    st.write(f"**Período:** {start_year} - {start_year + projection_years - 1}")
    
    if market == "Brasil":
        st.write(f"**Regime:** {globals().get('tax_regime', 'Simples Nacional')}")
    
    # Carga tributária média
    avg_tax_burden = tax_df['carga_tributaria_total'].mean()
    st.metric("Carga Tributária Média", f"{avg_tax_burden:.1f}%")
    
    # Economia com planejamento
    if tax_planning:
        st.success("✅ Planejamento Tributário Ativo")
        st.write("Economia estimada: 15%")

with col1:
    st.markdown("### 📊 Projeção de Impostos")
    
    # Tabela resumo
    display_df = tax_df.copy()
    
    # Formatar valores monetários
    monetary_cols = ['receita_bruta', 'receita_tributavel', 'lucro_bruto', 'receita_liquida', 'total']
    for col in monetary_cols:
        if col in display_df.columns:
            display_df[f'{col}_fmt'] = display_df[col].apply(lambda x: format_currency(x, currency))
    
    # Selecionar colunas para exibição
    display_columns = ['ano', 'receita_bruta_fmt', 'total_fmt', 'carga_tributaria_total', 'receita_liquida_fmt']
    display_names = ['Ano', 'Receita Bruta', 'Total Impostos', 'Carga Tributária (%)', 'Receita Líquida']
    
    display_final = display_df[display_columns].copy()
    display_final.columns = display_names
    
    # Formatar percentual
    display_final['Carga Tributária (%)'] = display_final['Carga Tributária (%)'].apply(lambda x: f"{x:.1f}%")
    
    st.dataframe(display_final, use_container_width=True)

# Análises gráficas
st.markdown("## 📊 Análises Tributárias")

tab1, tab2, tab3, tab4 = st.tabs(["Evolução da Carga", "Composição dos Impostos", "Comparativo de Regimes", "Planejamento Fiscal"])

with tab1:
    # Gráfico de evolução da carga tributária
    fig_burden = go.Figure()
    
    fig_burden.add_trace(go.Bar(
        x=tax_df['ano'],
        y=tax_df['total'],
        name='Total de Impostos',
        marker_color='red',
        yaxis='y'
    ))
    
    fig_burden.add_trace(go.Scatter(
        x=tax_df['ano'],
        y=tax_df['carga_tributaria_total'],
        name='Carga Tributária (%)',
        line=dict(color='blue', width=3),
        mode='lines+markers',
        yaxis='y2'
    ))
    
    fig_burden.update_layout(
        title='Evolução da Carga Tributária',
        xaxis_title='Ano',
        yaxis_title=f'Impostos ({currency})',
        yaxis2=dict(
            title='Carga Tributária (%)',
            side='right',
            overlaying='y'
        )
    )
    
    st.plotly_chart(fig_burden, use_container_width=True)

with tab2:
    # Composição dos impostos (último ano)
    last_year_data = tax_projections[-1]
    
    if market == "Brasil":
        if globals().get('tax_regime', 'Simples Nacional') == "Simples Nacional":
            composition = {
                'Simples Nacional': last_year_data.get('simples_nacional', 0),
                'ISS': last_year_data.get('iss', 0)
            }
        else:
            composition = {
                'IRPJ': last_year_data.get('irpj', 0) + last_year_data.get('adicional_irpj', 0),
                'CSLL': last_year_data.get('csll', 0),
                'PIS/COFINS': last_year_data.get('pis', 0) + last_year_data.get('cofins', 0),
                'ISS': last_year_data.get('iss', 0)
            }
    elif market == "Europa":
        composition = {
            'VAT': last_year_data.get('vat', 0),
            'Corporate Tax': last_year_data.get('corporate_tax', 0),
            'Social Security': last_year_data.get('social_security', 0)
        }
    elif market == "Emirados Árabes":
        composition = {
            'VAT': last_year_data.get('vat', 0),
            'Corporate Tax': last_year_data.get('corporate_tax', 0)
        }
    
    # Filtrar valores maiores que zero
    composition = {k: v for k, v in composition.items() if v > 0}
    
    if composition:
        fig_pie = px.pie(
            values=list(composition.values()),
            names=list(composition.keys()),
            title=f'Composição dos Impostos - {start_year + projection_years - 1}'
        )
        st.plotly_chart(fig_pie, use_container_width=True)
    else:
        st.info("Nenhum imposto calculado para exibição.")

with tab3:
    if market == "Brasil":
        st.markdown("### 🔄 Comparativo de Regimes Tributários")
        
        # Calcular para diferentes regimes
        regimes_comparison = []
        sample_revenue = annual_revenue
        sample_profit = sample_revenue * profit_margin
        
        for regime in ["Simples Nacional", "Lucro Presumido", "Lucro Real"]:
            regime_custom_rates = custom_rates.copy()
            if regime == "Simples Nacional":
                regime_custom_rates['simples_rate'] = 8.0
            
            regime_taxes = calculate_detailed_taxes(
                sample_revenue, sample_profit, market, regime, regime_custom_rates
            )
            
            regimes_comparison.append({
                'Regime': regime,
                'Total_Impostos': regime_taxes['total'],
                'Carga_Tributaria': (regime_taxes['total'] / sample_revenue) * 100,
                'Receita_Liquida': sample_revenue - regime_taxes['total']
            })
        
        comparison_df = pd.DataFrame(regimes_comparison)
        
        # Formatar para exibição
        comparison_display = comparison_df.copy()
        comparison_display['Total_Impostos'] = comparison_display['Total_Impostos'].apply(lambda x: format_currency(x, currency))
        comparison_display['Receita_Liquida'] = comparison_display['Receita_Liquida'].apply(lambda x: format_currency(x, currency))
        comparison_display['Carga_Tributaria'] = comparison_display['Carga_Tributaria'].apply(lambda x: f"{x:.1f}%")
        
        comparison_display.columns = ['Regime Tributário', 'Total de Impostos', 'Carga Tributária', 'Receita Líquida']
        
        st.dataframe(comparison_display, use_container_width=True)
        
        # Gráfico comparativo
        fig_comparison = go.Figure()
        
        fig_comparison.add_trace(go.Bar(
            x=comparison_df['Regime'],
            y=comparison_df['Carga_Tributaria'],
            name='Carga Tributária (%)',
            marker_color=['green' if x == comparison_df['Carga_Tributaria'].min() else 'red' for x in comparison_df['Carga_Tributaria']]
        ))
        
        fig_comparison.update_layout(
            title='Comparativo de Carga Tributária por Regime',
            xaxis_title='Regime Tributário',
            yaxis_title='Carga Tributária (%)'
        )
        
        st.plotly_chart(fig_comparison, use_container_width=True)
        
        # Recomendação
        best_regime = comparison_df.loc[comparison_df['Carga_Tributaria'].idxmin(), 'Regime']
        st.success(f"💡 **Regime Recomendado:** {best_regime} (menor carga tributária)")
    
    else:
        st.info(f"Comparativo de regimes não aplicável para {market}")

with tab4:
    st.markdown("### 📈 Estratégias de Planejamento Fiscal")
    
    # Estratégias por mercado
    strategies = []
    
    if market == "Brasil":
        strategies = [
            "✅ **Simples Nacional**: Ideal para receitas até R$ 4,8 milhões",
            "📋 **Regime de Competência**: Para melhor controle de fluxo de caixa",
            "💼 **Incentivos Fiscais**: Explorar benefícios municipais para esporte",
            "📊 **Segregação de Atividades**: Separar receitas de quadras e cafeteria",
            "🏢 **Pessoa Jurídica**: Estruturar como empresa prestadora de serviços"
        ]
    elif market == "Europa":
        strategies = [
            "💰 **VAT Optimization**: Estruturar operações para minimizar VAT",
            "🏛️ **Tax Treaties**: Aproveitar acordos para evitar dupla tributação",
            "📋 **Depreciation**: Maximizar depreciação de equipamentos",
            "🎯 **Tax Credits**: Explorar créditos fiscais para esporte e saúde",
            "🔄 **Transfer Pricing**: Se houver operações internacionais"
        ]
    elif market == "Emirados Árabes":
        strategies = [
            "🆓 **Free Zones**: Considerar operar em zonas francas",
            "📋 **Corporate Tax**: Otimizar estrutura para nova tributação",
            "💳 **VAT Registration**: Avaliar necessidade de registro para VAT",
            "🌍 **International Structure**: Aproveitar ambiente fiscal favorável",
            "📊 **Substance Requirements**: Atender requisitos de substância econômica"
        ]
    
    for strategy in strategies:
        st.info(strategy)
    
    # Simulador de economia fiscal
    st.markdown("#### 💡 Simulador de Economia Fiscal")
    
    col1, col2 = st.columns(2)
    
    with col1:
        potential_savings = st.slider("Economia Potencial com Planejamento (%):", 0, 30, 15)
    
    with col2:
        implementation_cost = st.number_input("Custo de Implementação:", value=10000.0)
    
    # Calcular economia
    annual_tax_current = tax_df['total'].iloc[0] if len(tax_df) > 0 else 0
    annual_savings = annual_tax_current * (potential_savings / 100)
    five_year_savings = annual_savings * 5
    net_savings = five_year_savings - implementation_cost
    roi_planning = (net_savings / implementation_cost * 100) if implementation_cost > 0 else 0
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Economia Anual", format_currency(annual_savings, currency))
    
    with col2:
        st.metric("Economia 5 Anos", format_currency(five_year_savings, currency))
    
    with col3:
        st.metric("ROI do Planejamento", f"{roi_planning:.0f}%")

# Indicadores tributários
st.markdown("## 🎯 Indicadores Tributários")

col1, col2, col3, col4 = st.columns(4)

# Calcular indicadores
total_taxes_period = tax_df['total'].sum()
total_revenue_period = tax_df['receita_bruta'].sum()
avg_tax_burden = (total_taxes_period / total_revenue_period) * 100
tax_efficiency = 100 - avg_tax_burden

# Benchmark por mercado
benchmarks = {
    "Brasil": {"low": 20, "high": 35},
    "Europa": {"low": 25, "high": 40},
    "Emirados Árabes": {"low": 5, "high": 15}
}

benchmark = benchmarks.get(market, {"low": 20, "high": 35})

with col1:
    st.metric(
        "Carga Tributária Média",
        f"{avg_tax_burden:.1f}%",
        delta=f"Benchmark: {benchmark['low']}-{benchmark['high']}%"
    )

with col2:
    st.metric(
        "Eficiência Fiscal",
        f"{tax_efficiency:.1f}%",
        delta="Receita retida após impostos"
    )

with col3:
    st.metric(
        "Total de Impostos (período)",
        format_currency(total_taxes_period, currency),
        delta=f"{projection_years} anos"
    )

with col4:
    growth_tax = ((tax_df['total'].iloc[-1] / tax_df['total'].iloc[0]) ** (1/projection_years) - 1) * 100 if len(tax_df) > 1 else 0
    st.metric(
        "Crescimento dos Impostos",
        f"{growth_tax:.1f}% aa",
        delta="vs. crescimento da receita"
    )

# Calendário tributário
st.markdown("## 📅 Calendário Tributário")

if market == "Brasil":
    calendar_data = [
        {"Imposto": "ISS", "Vencimento": "Todo dia 10", "Periodicidade": "Mensal"},
        {"Imposto": "Simples Nacional", "Vencimento": "Todo dia 20", "Periodicidade": "Mensal"},
        {"Imposto": "IRPJ/CSLL", "Vencimento": "Último dia útil do mês", "Periodicidade": "Mensal (estimativa)"},
        {"Imposto": "PIS/COFINS", "Vencimento": "25 do mês seguinte", "Periodicidade": "Mensal"},
        {"Imposto": "Declaração Anual", "Vencimento": "Maio", "Periodicidade": "Anual"}
    ]
elif market == "Europa":
    calendar_data = [
        {"Imposto": "VAT Return", "Vencimento": "Final do mês", "Periodicidade": "Mensal/Trimestral"},
        {"Imposto": "Corporate Tax", "Vencimento": "Varia por país", "Periodicidade": "Anual"},
        {"Imposto": "Social Security", "Vencimento": "Mensal", "Periodicidade": "Mensal"},
        {"Imposto": "Annual Return", "Vencimento": "Varia por país", "Periodicidade": "Anual"}
    ]
elif market == "Emirados Árabes":
    calendar_data = [
        {"Imposto": "VAT Return", "Vencimento": "28 do mês seguinte", "Periodicidade": "Trimestral"},
        {"Imposto": "Corporate Tax", "Vencimento": "9 meses após fim do ano fiscal", "Periodicidade": "Anual"},
        {"Imposto": "Economic Substance", "Vencimento": "Anual", "Periodicidade": "Anual"}
    ]

calendar_df = pd.DataFrame(calendar_data)
st.dataframe(calendar_df, use_container_width=True)

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'Projecao_Impostos': tax_df,
    'Calendario_Tributario': calendar_df,
    'Resumo_Tributario': pd.DataFrame([{
        'Mercado': market,
        'Carga_Tributaria_Media': avg_tax_burden,
        'Total_Impostos_Periodo': total_taxes_period,
        'Eficiencia_Fiscal': tax_efficiency,
        'Planejamento_Aplicado': tax_planning
    }])
}

if market == "Brasil" and 'comparison_df' in locals():
    export_data['Comparativo_Regimes'] = comparison_df

export_to_streamlit(export_data, "impostos_tributacao")

# Alertas e recomendações
st.markdown("## ⚠️ Alertas Tributários")

alerts = []

if avg_tax_burden > benchmark['high']:
    alerts.append(f"🔴 **Carga Tributária Alta**: {avg_tax_burden:.1f}% está acima do benchmark ({benchmark['high']}%). Considere planejamento tributário.")

if market == "Brasil" and annual_revenue > 4800000:
    alerts.append("🟡 **Limite Simples Nacional**: Receita pode exceder limite do Simples Nacional. Planeje migração de regime.")

if tax_df['total'].iloc[-1] > tax_df['total'].iloc[0] * 2:
    alerts.append("🟠 **Crescimento Tributário**: Impostos crescendo mais que proporcionalmente. Revise estratégia fiscal.")

if not tax_planning and avg_tax_burden > benchmark['low']:
    alerts.append("💡 **Oportunidade**: Considere implementar planejamento tributário para reduzir carga fiscal.")

if len(alerts) == 0:
    alerts.append("✅ **Situação Tributária Adequada**: Carga tributária dentro de parâmetros aceitáveis.")

for alert in alerts:
    if "🔴" in alert or "🟡" in alert or "🟠" in alert:
        st.warning(alert)
    elif "💡" in alert:
        st.info(alert)
    else:
        st.success(alert)

st.markdown("---")
st.caption("⚠️ **Disclaimer**: Esta análise é informativa. Consulte sempre um contador ou consultor tributário para decisões fiscais específicas.")

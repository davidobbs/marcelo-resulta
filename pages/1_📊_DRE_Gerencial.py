import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from utils.market_configs import get_market_config, get_tax_calculation, get_seasonal_factors
from utils.financial_calculations import calculate_depreciation, format_currency
from utils.export_utils import export_to_streamlit, create_dre_dataframe

st.set_page_config(page_title="DRE Gerencial", page_icon="📊", layout="wide")

st.title("📊 Demonstração do Resultado do Exercício - DRE Gerencial")

# Verificar se há dados de sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']

# Sidebar para configurações da DRE
with st.sidebar:
    st.header("⚙️ Configurações da DRE")
    
    # Período de análise
    start_year = st.selectbox("Ano Inicial:", options=list(range(2024, 2036)), index=0)
    projection_years = st.slider("Anos de Projeção:", 1, 12, 5)
    
    st.markdown("### 💰 Parâmetros de Receita")
    
    # Receitas por tipo de quadra
    field_types = st.session_state.get('field_types', ['Society 5x5', 'Society 7x7'])
    num_fields = st.session_state.get('num_fields', 2)
    
    revenue_params = {}
    for field_type in field_types:
        st.markdown(f"**{field_type}:**")
        revenue_params[field_type] = {
            'hourly_rate': st.number_input(
                f"Preço/hora ({field_type}):", 
                value=market_config['avg_hourly_rate'], 
                key=f"rate_{field_type}"
            ),
            'daily_hours': st.number_input(
                f"Horas/dia ({field_type}):", 
                value=market_config['hours_per_day'], 
                key=f"hours_{field_type}"
            ),
            'occupancy': st.slider(
                f"Taxa de Ocupação ({field_type}):", 
                0.0, 1.0, market_config['expected_occupancy'], 
                key=f"occ_{field_type}"
            )
        }
    
    # Outras receitas
    st.markdown("### 🏆 Outras Receitas")
    tournament_revenue = st.number_input("Receita Torneios/mês:", value=5000.0)
    cafeteria_revenue = st.number_input("Receita Cafeteria/mês:", value=3000.0)
    events_revenue = st.number_input("Receita Eventos/mês:", value=2000.0)
    sponsorship_revenue = st.number_input("Receita Patrocínios/mês:", value=4000.0)
    
    # Crescimento anual
    annual_growth = st.slider("Crescimento Anual da Receita:", 0.0, 0.30, market_config['growth_potential'])

# Calcular receitas mensais e anuais
def calculate_monthly_revenue(params, month, year_index, growth_rate):
    """Calcula receita mensal considerando sazonalidade"""
    seasonal_factors = get_seasonal_factors(market)
    seasonal_factor = seasonal_factors[month - 1]
    growth_factor = (1 + growth_rate) ** year_index
    
    # Receita das quadras
    field_revenue = 0
    for field_type, config in params.items():
        monthly_hours = config['daily_hours'] * 30 * config['occupancy']  # 30 dias médios
        monthly_revenue = monthly_hours * config['hourly_rate'] * seasonal_factor * growth_factor
        field_revenue += monthly_revenue * (num_fields * 0.5)  # Distribuição entre tipos
    
    # Outras receitas
    other_revenues = {
        'tournaments': tournament_revenue * seasonal_factor * growth_factor,
        'cafeteria': cafeteria_revenue * seasonal_factor * growth_factor,
        'events': events_revenue * seasonal_factor * growth_factor,
        'sponsorship': sponsorship_revenue * growth_factor  # Patrocínio não tem sazonalidade
    }
    
    total_other = sum(other_revenues.values())
    
    return field_revenue, other_revenues, field_revenue + total_other

# Interface principal
col1, col2 = st.columns([2, 1])

with col2:
    st.markdown("### 📋 Resumo dos Parâmetros")
    st.write(f"**Mercado:** {market}")
    st.write(f"**Moeda:** {currency}")
    st.write(f"**Período:** {start_year} - {start_year + projection_years - 1}")
    st.write(f"**Quadras:** {num_fields}")
    st.write(f"**Tipos:** {', '.join(field_types)}")

with col1:
    # Calcular DRE para todos os anos
    dre_data = []
    monthly_details = []
    
    for year_idx in range(projection_years):
        year = start_year + year_idx
        annual_data = {
            'Ano': year,
            'Receita_Quadras': 0,
            'Receita_Torneios': 0,
            'Receita_Cafeteria': 0,
            'Receita_Eventos': 0,
            'Receita_Patrocinios': 0,
            'Receita_Bruta': 0,
            'Impostos_Vendas': 0,
            'Receita_Liquida': 0,
            'Custos_Variaveis': 0,
            'Margem_Contribuicao': 0,
            'Custos_Fixos': 0,
            'EBITDA': 0,
            'Depreciacao': 0,
            'EBIT': 0,
            'Impostos_Renda': 0,
            'Lucro_Liquido': 0
        }
        
        # Calcular receitas mensais
        for month in range(1, 13):
            field_rev, other_rev, total_monthly = calculate_monthly_revenue(
                revenue_params, month, year_idx, annual_growth
            )
            
            annual_data['Receita_Quadras'] += field_rev
            annual_data['Receita_Torneios'] += other_rev['tournaments']
            annual_data['Receita_Cafeteria'] += other_rev['cafeteria']
            annual_data['Receita_Eventos'] += other_rev['events']
            annual_data['Receita_Patrocinios'] += other_rev['sponsorship']
            
            # Detalhes mensais para análise
            monthly_details.append({
                'Ano': year,
                'Mes': month,
                'Receita_Total': total_monthly,
                'Receita_Quadras': field_rev,
                'Outras_Receitas': sum(other_rev.values())
            })
        
        # Totais anuais
        annual_data['Receita_Bruta'] = sum([
            annual_data['Receita_Quadras'],
            annual_data['Receita_Torneios'],
            annual_data['Receita_Cafeteria'],
            annual_data['Receita_Eventos'],
            annual_data['Receita_Patrocinios']
        ])
        
        # Impostos sobre vendas
        tax_calc = get_tax_calculation(market, annual_data['Receita_Bruta'], 0)
        annual_data['Impostos_Vendas'] = tax_calc.get('vat', 0) + tax_calc.get('pis_cofins', 0)
        annual_data['Receita_Liquida'] = annual_data['Receita_Bruta'] - annual_data['Impostos_Vendas']
        
        # Custos variáveis (% da receita líquida)
        annual_data['Custos_Variaveis'] = annual_data['Receita_Liquida'] * 0.25  # 25% custos variáveis
        annual_data['Margem_Contribuicao'] = annual_data['Receita_Liquida'] - annual_data['Custos_Variaveis']
        
        # Custos fixos
        base_fixed_costs = 120000 * (1 + market_config['inflation_rate']) ** year_idx
        annual_data['Custos_Fixos'] = base_fixed_costs
        
        # EBITDA
        annual_data['EBITDA'] = annual_data['Margem_Contribuicao'] - annual_data['Custos_Fixos']
        
        # Depreciação
        annual_data['Depreciacao'] = 50000 * (1 + market_config['inflation_rate']) ** year_idx
        
        # EBIT
        annual_data['EBIT'] = annual_data['EBITDA'] - annual_data['Depreciacao']
        
        # Impostos sobre renda
        if annual_data['EBIT'] > 0:
            profit_taxes = get_tax_calculation(market, 0, annual_data['EBIT'])
            annual_data['Impostos_Renda'] = profit_taxes.get('corporate_tax', 0) + profit_taxes.get('irpj', 0)
        
        # Lucro líquido
        annual_data['Lucro_Liquido'] = annual_data['EBIT'] - annual_data['Impostos_Renda']
        
        dre_data.append(annual_data)
    
    # Criar DataFrame da DRE
    dre_df = pd.DataFrame(dre_data)
    
    # Mostrar DRE formatada
    st.markdown("### 📈 Demonstração do Resultado do Exercício")
    
    # Formatação para exibição
    display_df = dre_df.copy()
    
    # Formatar valores monetários
    monetary_columns = [col for col in display_df.columns if col != 'Ano']
    for col in monetary_columns:
        display_df[col] = display_df[col].apply(lambda x: format_currency(x, currency))
    
    st.dataframe(display_df, use_container_width=True)

# Segunda seção - Análises gráficas
st.markdown("## 📊 Análises Gráficas")

tab1, tab2, tab3, tab4 = st.tabs(["Evolução da Receita", "Margem de Lucro", "Composição da Receita", "Análise Mensal"])

with tab1:
    fig_revenue = go.Figure()
    
    fig_revenue.add_trace(go.Scatter(
        x=dre_df['Ano'],
        y=dre_df['Receita_Bruta'],
        name='Receita Bruta',
        line=dict(color='blue', width=3)
    ))
    
    fig_revenue.add_trace(go.Scatter(
        x=dre_df['Ano'],
        y=dre_df['Receita_Liquida'],
        name='Receita Líquida',
        line=dict(color='green', width=3)
    ))
    
    fig_revenue.update_layout(
        title='Evolução da Receita ao Longo dos Anos',
        xaxis_title='Ano',
        yaxis_title=f'Receita ({currency})',
        hovermode='x'
    )
    
    st.plotly_chart(fig_revenue, use_container_width=True)

with tab2:
    # Calcular margens
    dre_df['Margem_Bruta'] = (dre_df['Margem_Contribuicao'] / dre_df['Receita_Liquida']) * 100
    dre_df['Margem_EBITDA'] = (dre_df['EBITDA'] / dre_df['Receita_Liquida']) * 100
    dre_df['Margem_Liquida'] = (dre_df['Lucro_Liquido'] / dre_df['Receita_Liquida']) * 100
    
    fig_margins = go.Figure()
    
    fig_margins.add_trace(go.Scatter(
        x=dre_df['Ano'],
        y=dre_df['Margem_Bruta'],
        name='Margem Bruta (%)',
        line=dict(color='blue')
    ))
    
    fig_margins.add_trace(go.Scatter(
        x=dre_df['Ano'],
        y=dre_df['Margem_EBITDA'],
        name='Margem EBITDA (%)',
        line=dict(color='orange')
    ))
    
    fig_margins.add_trace(go.Scatter(
        x=dre_df['Ano'],
        y=dre_df['Margem_Liquida'],
        name='Margem Líquida (%)',
        line=dict(color='green')
    ))
    
    fig_margins.update_layout(
        title='Evolução das Margens de Lucro',
        xaxis_title='Ano',
        yaxis_title='Margem (%)',
        hovermode='x'
    )
    
    st.plotly_chart(fig_margins, use_container_width=True)

with tab3:
    # Gráfico de pizza para composição da receita (último ano)
    last_year_data = dre_data[-1]
    
    revenue_composition = {
        'Quadras': last_year_data['Receita_Quadras'],
        'Torneios': last_year_data['Receita_Torneios'],
        'Cafeteria': last_year_data['Receita_Cafeteria'],
        'Eventos': last_year_data['Receita_Eventos'],
        'Patrocínios': last_year_data['Receita_Patrocinios']
    }
    
    fig_pie = px.pie(
        values=list(revenue_composition.values()),
        names=list(revenue_composition.keys()),
        title=f'Composição da Receita - {start_year + projection_years - 1}'
    )
    
    st.plotly_chart(fig_pie, use_container_width=True)

with tab4:
    # Análise mensal do primeiro ano
    monthly_df = pd.DataFrame(monthly_details)
    first_year_monthly = monthly_df[monthly_df['Ano'] == start_year]
    
    fig_monthly = go.Figure()
    
    fig_monthly.add_trace(go.Bar(
        x=first_year_monthly['Mes'],
        y=first_year_monthly['Receita_Quadras'],
        name='Receita Quadras',
        marker_color='blue'
    ))
    
    fig_monthly.add_trace(go.Bar(
        x=first_year_monthly['Mes'],
        y=first_year_monthly['Outras_Receitas'],
        name='Outras Receitas',
        marker_color='orange'
    ))
    
    fig_monthly.update_layout(
        title=f'Receita Mensal - {start_year}',
        xaxis_title='Mês',
        yaxis_title=f'Receita ({currency})',
        barmode='stack'
    )
    
    st.plotly_chart(fig_monthly, use_container_width=True)

# KPIs principais
st.markdown("## 🎯 Indicadores-Chave de Performance")

col1, col2, col3, col4 = st.columns(4)

# Calcular KPIs
total_revenue_last_year = dre_data[-1]['Receita_Liquida']
total_revenue_first_year = dre_data[0]['Receita_Liquida']
revenue_growth = ((total_revenue_last_year / total_revenue_first_year) ** (1/projection_years) - 1) * 100

avg_margin_ebitda = dre_df['Margem_EBITDA'].mean()
avg_margin_liquida = dre_df['Margem_Liquida'].mean()

total_ebitda = dre_df['EBITDA'].sum()
total_lucro = dre_df['Lucro_Liquido'].sum()

with col1:
    st.metric(
        "Crescimento Anual Médio",
        f"{revenue_growth:.1f}%",
        delta=f"vs. {annual_growth*100:.1f}% projetado"
    )

with col2:
    st.metric(
        "Margem EBITDA Média",
        f"{avg_margin_ebitda:.1f}%",
        delta="Último ano" if avg_margin_ebitda > 0 else "Negativa"
    )

with col3:
    st.metric(
        "Margem Líquida Média",
        f"{avg_margin_liquida:.1f}%",
        delta="Sustentável" if avg_margin_liquida > 10 else "Baixa"
    )

with col4:
    st.metric(
        "EBITDA Acumulado",
        format_currency(total_ebitda, currency),
        delta=f"Lucro: {format_currency(total_lucro, currency)}"
    )

# Exportação
st.markdown("## 📁 Exportação de Dados")

export_data = {
    'DRE_Anual': dre_df,
    'Detalhes_Mensais': pd.DataFrame(monthly_details),
    'Parametros': pd.DataFrame([{
        'Mercado': market,
        'Anos_Projecao': projection_years,
        'Crescimento_Anual': annual_growth,
        'Num_Quadras': num_fields,
        'Tipos_Quadras': ', '.join(field_types)
    }])
}

export_to_streamlit(export_data, "dre_gerencial")

# Observações importantes
st.markdown("## 📝 Observações Importantes")

st.info(f"""
**Premissas utilizadas na DRE:**

• **Impostos sobre vendas**: Baseados na legislação de {market}
• **Custos variáveis**: 25% da receita líquida (materiais, arbitragem, etc.)
• **Custos fixos**: Incluem salários, aluguel, utilities, manutenção
• **Depreciação**: Equipamentos e instalações conforme vida útil
• **Sazonalidade**: Aplicada conforme padrões do mercado {market}
• **Crescimento**: {annual_growth*100:.1f}% ao ano aplicado sobre receitas
• **Inflação**: {market_config['inflation_rate']*100:.1f}% ao ano sobre custos

**Recomendações:**
• Monitore mensalmente a margem de contribuição
• Ajuste preços conforme inflação e demanda
• Diversifique fontes de receita para reduzir riscos
• Mantenha reserva para sazonalidade baixa
""")

st.warning("⚠️ **Importante**: Esta DRE é uma projeção baseada nas premissas inseridas. Resultados reais podem variar conforme condições de mercado, concorrência e execução operacional.")

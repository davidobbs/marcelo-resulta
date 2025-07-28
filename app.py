import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from utils.market_configs import get_market_config, MARKETS
from utils.financial_calculations import calculate_npv, calculate_irr, calculate_roi

# Configuração da página
st.set_page_config(
    page_title="Análise Financeira - Clubes de Futebol",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS customizado para melhorar a aparência
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 5px solid #1f77b4;
        margin: 1rem 0;
    }
    .sidebar-header {
        font-size: 1.2rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

def main():
    st.markdown('<h1 class="main-header">⚽ Sistema de Análise Financeira para Clubes de Futebol</h1>', unsafe_allow_html=True)
    
    # Sidebar para configurações globais
    with st.sidebar:
        st.markdown('<div class="sidebar-header">🌍 Configurações do Mercado</div>', unsafe_allow_html=True)
        
        # Seleção do mercado
        market = st.selectbox(
            "Selecione o Mercado:",
            options=list(MARKETS.keys()),
            index=0,
            help="Escolha o mercado para análise específica"
        )
        
        # Armazenar mercado selecionado na sessão
        st.session_state['selected_market'] = market
        
        # Configurações do clube
        st.markdown("### ⚽ Dados do Clube")
        club_name = st.text_input("Nome do Clube:", value="Clube de Futebol Exemplo")
        
        # Tipo de quadras
        field_types = st.multiselect(
            "Tipos de Quadras:",
            options=["Society 5x5", "Society 7x7", "Futsal", "Campo 11x11"],
            default=["Society 5x5", "Society 7x7"]
        )
        
        # Número de quadras
        num_fields = st.number_input("Número de Quadras:", min_value=1, max_value=20, value=2)
        
        # Armazenar dados na sessão
        st.session_state['club_name'] = club_name
        st.session_state['field_types'] = field_types
        st.session_state['num_fields'] = num_fields
    
    # Obter configuração do mercado
    market_config = get_market_config(market)
    
    # Dashboard principal
    st.markdown("## 📊 Visão Geral do Projeto")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric(
            label="Mercado Selecionado",
            value=market,
            delta=f"Moeda: {market_config['currency']}"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric(
            label="Número de Quadras",
            value=num_fields,
            delta=f"Tipos: {len(field_types)}"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col3:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric(
            label="Taxa de Imposto",
            value=f"{market_config['tax_rate']*100:.1f}%",
            delta="Sobre receita líquida"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col4:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric(
            label="Inflação Anual",
            value=f"{market_config['inflation_rate']*100:.1f}%",
            delta="Projeção média"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Resumo das características do mercado
    st.markdown("### 🌍 Características do Mercado Selecionado")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**💰 Informações Financeiras:**")
        st.write(f"• Moeda: {market_config['currency']}")
        st.write(f"• Taxa de Imposto: {market_config['tax_rate']*100:.1f}%")
        st.write(f"• Inflação Anual: {market_config['inflation_rate']*100:.1f}%")
        st.write(f"• Taxa de Desconto: {market_config['discount_rate']*100:.1f}%")
    
    with col2:
        st.markdown("**🏟️ Parâmetros Operacionais:**")
        st.write(f"• Preço Médio/Hora: {market_config['currency']} {market_config['avg_hourly_rate']:.2f}")
        st.write(f"• Ocupação Esperada: {market_config['expected_occupancy']*100:.0f}%")
        st.write(f"• Horas/Dia Úteis: {market_config['hours_per_day']}")
        st.write(f"• Dias/Semana: {market_config['days_per_week']}")
    
    # Navegação para páginas específicas
    st.markdown("## 🧭 Navegação")
    st.markdown("""
    Use o menu lateral esquerdo para navegar entre as diferentes análises:
    
    - **📊 DRE Gerencial**: Demonstração do Resultado do Exercício detalhada
    - **💰 Capital de Giro**: Análise de necessidades de capital de giro
    - **📈 Fluxo de Caixa**: Projeções de fluxo de caixa operacional e livre
    - **🏛️ Impostos & Tributação**: Cálculos tributários específicos por mercado
    - **🔮 Projeções 2035**: Análises e projeções de longo prazo
    - **📋 Dashboard KPIs**: Indicadores-chave de performance
    - **🎯 Análise de Viabilidade**: ROI, TIR, VPL e análise de sensibilidade
    - **💎 Valuation**: Avaliação empresarial com IRR, Payback e VPL editáveis
    """)
    
    # Informações importantes
    st.markdown("## ⚠️ Instruções Importantes")
    st.info("""
    **Como usar este sistema:**
    
    1. **Configure o mercado** na barra lateral (Brasil, Europa ou Emirados Árabes)
    2. **Defina os dados básicos** do seu clube (nome, tipos e número de quadras)
    3. **Navegue pelas páginas** usando o menu lateral para análises específicas
    4. **Ajuste os parâmetros** em cada página conforme sua realidade
    5. **Exporte os relatórios** quando necessário (Excel/PDF)
    
    Todos os cálculos são atualizados automaticamente conforme você modifica os parâmetros.
    """)
    
    # Disclaimer
    st.markdown("---")
    st.caption("⚠️ **Disclaimer**: Este sistema é uma ferramenta de apoio à decisão. Consulte sempre um profissional qualificado para validação das análises financeiras.")

if __name__ == "__main__":
    main()

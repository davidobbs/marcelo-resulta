import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
from utils.market_configs import get_market_config
from utils.financial_calculations import (
    calculate_npv, calculate_irr, format_currency,
    calculate_payback_period
)
from utils.export_utils import export_to_streamlit

st.set_page_config(page_title="Valuation", page_icon="💎", layout="wide")

st.title("💎 Valuation - Avaliação Empresarial")

# Verificar dados da sessão
if 'selected_market' not in st.session_state:
    st.error("⚠️ Selecione um mercado na página principal primeiro!")
    st.stop()

market = st.session_state['selected_market']
market_config = get_market_config(market)
currency = market_config['currency']

# Tabs para diferentes cenários
tab1, tab2, tab3 = st.tabs(["📊 Configuração de Cenários", "📈 Análise de Valuation", "📑 Relatório Comparativo"])

with tab1:
    st.markdown("## ⚙️ Configuração de Cenários")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🎯 Cenário Realista")
        
        # Dados editáveis do cenário realista
        st.markdown("#### Premissas Operacionais")
        realistic_revenue = st.number_input(
            "Receita Base (31/12/2022)",
            value=43142193.34,
            key="real_revenue",
            help="Receita base para projeções"
        )
        
        realistic_revenue_var = st.number_input(
            "Variação Real Receita 2021/2022 (%)",
            value=-10.50,
            key="real_revenue_var",
            help="Variação percentual da receita"
        )
        
        realistic_costs = st.number_input(
            "Despesas/Custos Fixos",
            value=3808729.15,
            key="real_costs"
        )
        
        realistic_costs_var = st.number_input(
            "Variação Custos (%)",
            value=19.27,
            key="real_costs_var"
        )
        
        realistic_profit_dist = st.number_input(
            "Distribuição de Lucros",
            value=890327.47,
            key="real_profit_dist"
        )
        
        realistic_profit_dist_var = st.number_input(
            "Variação Distribuição (%)",
            value=32.22,
            key="real_profit_var"
        )
        
        st.markdown("#### Passivos e Créditos")
        credit_to_compensate = st.number_input(
            "Crédito a Compensar",
            value=659691.68,
            key="credit_compensate",
            help="Probabilidade baixa de monetização"
        )
        
        judicial_liability = st.number_input(
            "Passivo Judicial + FEEF/FOF",
            value=4179468.68,
            key="judicial_liability"
        )
        
        family_debt = st.number_input(
            "Endividamento Família + Terreno",
            value=4741474.25,
            key="family_debt"
        )
        
        st.markdown("#### Parâmetros de Valuation")
        realistic_discount_rate = st.slider(
            "Taxa de Desconto (%)",
            min_value=5.0,
            max_value=30.0,
            value=12.0,
            step=0.5,
            key="real_discount"
        )
        
        realistic_growth_rate = st.slider(
            "Taxa de Crescimento Perpétuo (%)",
            min_value=0.0,
            max_value=10.0,
            value=3.0,
            step=0.5,
            key="real_growth"
        )
    
    with col2:
        st.markdown("### 🚀 Cenário Otimista")
        
        st.markdown("#### Premissas Operacionais")
        optimistic_revenue = st.number_input(
            "Receita Base (31/12/2022)",
            value=43142193.34 * 1.15,  # 15% maior
            key="opt_revenue",
            help="Receita base para projeções otimistas"
        )
        
        optimistic_revenue_var = st.number_input(
            "Variação Real Receita 2021/2022 (%)",
            value=5.0,  # Crescimento positivo
            key="opt_revenue_var",
            help="Variação percentual da receita"
        )
        
        optimistic_costs = st.number_input(
            "Despesas/Custos Fixos",
            value=3808729.15 * 0.9,  # 10% menor
            key="opt_costs"
        )
        
        optimistic_costs_var = st.number_input(
            "Variação Custos (%)",
            value=10.0,  # Menor aumento
            key="opt_costs_var"
        )
        
        optimistic_profit_dist = st.number_input(
            "Distribuição de Lucros",
            value=890327.47 * 1.5,  # 50% maior
            key="opt_profit_dist"
        )
        
        optimistic_profit_dist_var = st.number_input(
            "Variação Distribuição (%)",
            value=50.0,
            key="opt_profit_var"
        )
        
        st.markdown("#### Premissas Otimistas")
        optimistic_credit_recovery = st.slider(
            "Recuperação do Crédito (%)",
            min_value=0.0,
            max_value=100.0,
            value=50.0,
            key="opt_credit_recovery",
            help="Percentual do crédito que será recuperado"
        )
        
        optimistic_liability_reduction = st.slider(
            "Redução do Passivo Judicial (%)",
            min_value=0.0,
            max_value=50.0,
            value=25.0,
            key="opt_liability_reduction"
        )
        
        st.markdown("#### Parâmetros de Valuation")
        optimistic_discount_rate = st.slider(
            "Taxa de Desconto (%)",
            min_value=5.0,
            max_value=30.0,
            value=10.0,
            step=0.5,
            key="opt_discount"
        )
        
        optimistic_growth_rate = st.slider(
            "Taxa de Crescimento Perpétuo (%)",
            min_value=0.0,
            max_value=10.0,
            value=4.0,
            step=0.5,
            key="opt_growth"
        )
    
    # Patrimônio Líquido e AFAC
    st.markdown("### 💼 Dados Patrimoniais")
    col1, col2 = st.columns(2)
    
    with col1:
        equity_value = st.number_input(
            "Patrimônio Líquido Atual",
            value=1573967.52,
            key="equity_value"
        )
    
    with col2:
        afac_value = st.number_input(
            "AFAC (Adiantamento para Futuro Aumento de Capital)",
            value=0.0,
            key="afac_value"
        )

with tab2:
    st.markdown("## 📊 Análise de Valuation")
    
    # Função para calcular os indicadores
    def calculate_valuation_indicators(scenario_name, revenue, revenue_var, costs, costs_var, 
                                     profit_dist, discount_rate, growth_rate, 
                                     credit=0, judicial=0, family_debt=0, 
                                     credit_recovery=0, liability_reduction=0):
        
        # Calcular EBITDA base
        ebitda_base = revenue - costs - profit_dist
        
        # Projetar fluxos de caixa para 5 anos
        cash_flows_5y = []
        cash_flows_perpetuity = []
        
        for year in range(6):  # 0 a 5
            if year == 0:
                # Ano 0 - Investimento inicial (se houver)
                cf = 0
            else:
                # Crescimento baseado na variação histórica ajustada
                if scenario_name == "Realista":
                    yearly_growth = max(0, 1 + (revenue_var / 100) * 0.5)  # Metade da variação histórica
                else:
                    yearly_growth = 1 + max(revenue_var / 100, 0.05)  # Pelo menos 5% no otimista
                
                # Receita projetada
                projected_revenue = revenue * (yearly_growth ** year)
                
                # Custos com inflação
                cost_inflation = 1 + (costs_var / 100) * 0.3  # 30% da variação histórica
                projected_costs = costs * (cost_inflation ** year)
                
                # EBITDA
                ebitda = projected_revenue - projected_costs - profit_dist * (1.02 ** year)
                
                # Fluxo de caixa livre (simplificado)
                fcf = ebitda * 0.7  # Assumindo 30% de impostos e reinvestimento
                
                cash_flows_5y.append(fcf)
                cash_flows_perpetuity.append(fcf)
        
        # Ajustes de passivos e créditos
        if scenario_name == "Otimista":
            credit_recovered = credit * (credit_recovery / 100)
            liability_reduced = judicial * (liability_reduction / 100)
            cash_flows_5y[0] += credit_recovered + liability_reduced
            cash_flows_perpetuity[0] += credit_recovered + liability_reduced
        
        # Valor terminal para perpetuidade
        terminal_fcf = cash_flows_perpetuity[-1] * (1 + growth_rate / 100)
        terminal_value = terminal_fcf / (discount_rate / 100 - growth_rate / 100)
        
        # Calcular VPL 5 anos
        npv_5y = calculate_npv([0] + cash_flows_5y[:5], discount_rate / 100)
        
        # Calcular VPL perpetuidade
        npv_perpetuity = npv_5y
        for i, cf in enumerate(cash_flows_perpetuity[5:], start=6):
            npv_perpetuity += cf / ((1 + discount_rate / 100) ** i)
        npv_perpetuity += terminal_value / ((1 + discount_rate / 100) ** 5)
        
        # Calcular IRR 5 anos
        irr_5y = calculate_irr([-(equity_value + afac_value)] + cash_flows_5y[:5])
        
        # Calcular IRR perpetuidade (aproximado)
        # Para simplificar, vamos usar uma aproximação baseada no retorno total
        total_return_perpetuity = npv_perpetuity / (equity_value + afac_value)
        irr_perpetuity = (total_return_perpetuity ** (1/10) - 1) if total_return_perpetuity > 0 else 0
        
        # Calcular Payback
        cumulative_cf = []
        cumsum = 0
        for cf in cash_flows_5y:
            cumsum += cf
            cumulative_cf.append(cumsum)
        
        # Payback simples
        investment = equity_value + afac_value
        payback_simple = None
        for i, cum_cf in enumerate(cumulative_cf):
            if cum_cf >= investment:
                if i > 0:
                    payback_simple = i + (investment - cumulative_cf[i-1]) / cash_flows_5y[i]
                else:
                    payback_simple = 1
                break
        
        # Payback descontado
        discounted_cf = [cf / ((1 + discount_rate / 100) ** (i+1)) for i, cf in enumerate(cash_flows_5y)]
        cumulative_dcf = []
        cumsum = 0
        for dcf in discounted_cf:
            cumsum += dcf
            cumulative_dcf.append(cumsum)
        
        payback_discounted = None
        for i, cum_dcf in enumerate(cumulative_dcf):
            if cum_dcf >= investment:
                if i > 0:
                    payback_discounted = i + (investment - cumulative_dcf[i-1]) / discounted_cf[i]
                else:
                    payback_discounted = 1
                break
        
        # Calcular multiplicadores
        multiplicador_5y = npv_5y / investment if investment > 0 else 0
        multiplicador_perpetuity = npv_perpetuity / investment if investment > 0 else 0
        
        # Calcular saldo líquido
        if scenario_name == "Realista":
            saldo_liquido = npv_5y + credit - judicial - family_debt
        else:
            saldo_liquido = npv_5y + credit_recovered - (judicial * (1 - liability_reduction / 100)) - family_debt
        
        return {
            'irr_perpetuity': irr_perpetuity,
            'irr_5y': irr_5y,
            'payback_simple': payback_simple,
            'payback_discounted': payback_discounted,
            'npv_5y': npv_5y,
            'npv_perpetuity': npv_perpetuity,
            'multiplicador_5y': multiplicador_5y,
            'multiplicador_perpetuity': multiplicador_perpetuity,
            'saldo_liquido': saldo_liquido,
            'cash_flows': cash_flows_5y
        }
    
    # Calcular indicadores para ambos os cenários
    realistic_results = calculate_valuation_indicators(
        "Realista", realistic_revenue, realistic_revenue_var, realistic_costs,
        realistic_costs_var, realistic_profit_dist, realistic_discount_rate,
        realistic_growth_rate, credit_to_compensate, judicial_liability, family_debt
    )
    
    optimistic_results = calculate_valuation_indicators(
        "Otimista", optimistic_revenue, optimistic_revenue_var, optimistic_costs,
        optimistic_costs_var, optimistic_profit_dist, optimistic_discount_rate,
        optimistic_growth_rate, credit_to_compensate, judicial_liability, family_debt,
        optimistic_credit_recovery, optimistic_liability_reduction
    )
    
    # Exibir resultados
    st.markdown("### 📊 Indicadores de Valuation")
    
    # Criar DataFrame comparativo
    comparison_data = {
        'Indicador': [
            'IRR Perpetuidade (%)',
            'IRR 5 Anos (%)',
            'Payback Simples (anos)',
            'Payback Descontado (anos)',
            'VPL 5 Anos',
            'VPL Perpetuidade',
            'Multiplicador 5 Anos',
            'Multiplicador Perpetuidade',
            'Saldo Líquido 5 Anos'
        ],
        'Cenário Realista': [
            f"{realistic_results['irr_perpetuity']*100:.3f}%",
            f"{realistic_results['irr_5y']*100:.3f}%" if realistic_results['irr_5y'] else "N/A",
            f"{realistic_results['payback_simple']:.2f}" if realistic_results['payback_simple'] else "N/A",
            f"{realistic_results['payback_discounted']:.2f}" if realistic_results['payback_discounted'] else "N/A",
            format_currency(realistic_results['npv_5y'], currency),
            format_currency(realistic_results['npv_perpetuity'], currency),
            f"{realistic_results['multiplicador_5y']:.2f}x",
            f"{realistic_results['multiplicador_perpetuity']:.2f}x",
            format_currency(realistic_results['saldo_liquido'], currency)
        ],
        'Cenário Otimista': [
            f"{optimistic_results['irr_perpetuity']*100:.3f}%",
            f"{optimistic_results['irr_5y']*100:.3f}%" if optimistic_results['irr_5y'] else "N/A",
            f"{optimistic_results['payback_simple']:.2f}" if optimistic_results['payback_simple'] else "N/A",
            f"{optimistic_results['payback_discounted']:.2f}" if optimistic_results['payback_discounted'] else "N/A",
            format_currency(optimistic_results['npv_5y'], currency),
            format_currency(optimistic_results['npv_perpetuity'], currency),
            f"{optimistic_results['multiplicador_5y']:.2f}x",
            f"{optimistic_results['multiplicador_perpetuity']:.2f}x",
            format_currency(optimistic_results['saldo_liquido'], currency)
        ]
    }
    
    comparison_df = pd.DataFrame(comparison_data)
    
    # Estilizar o DataFrame
    st.dataframe(
        comparison_df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Indicador": st.column_config.TextColumn("Indicador", width="medium"),
            "Cenário Realista": st.column_config.TextColumn("Cenário Realista", width="medium"),
            "Cenário Otimista": st.column_config.TextColumn("Cenário Otimista", width="medium")
        }
    )
    
    # Gráficos comparativos
    col1, col2 = st.columns(2)
    
    with col1:
        # Gráfico de IRR
        fig_irr = go.Figure()
        
        irr_data = pd.DataFrame({
            'Tipo': ['IRR 5 Anos', 'IRR Perpetuidade'],
            'Realista': [realistic_results['irr_5y']*100 if realistic_results['irr_5y'] else 0, 
                        realistic_results['irr_perpetuity']*100],
            'Otimista': [optimistic_results['irr_5y']*100 if optimistic_results['irr_5y'] else 0,
                        optimistic_results['irr_perpetuity']*100]
        })
        
        fig_irr.add_trace(go.Bar(name='Cenário Realista', x=irr_data['Tipo'], y=irr_data['Realista']))
        fig_irr.add_trace(go.Bar(name='Cenário Otimista', x=irr_data['Tipo'], y=irr_data['Otimista']))
        
        fig_irr.update_layout(
            title='Taxa Interna de Retorno (IRR)',
            yaxis_title='IRR (%)',
            barmode='group'
        )
        
        st.plotly_chart(fig_irr, use_container_width=True)
    
    with col2:
        # Gráfico de VPL
        fig_npv = go.Figure()
        
        npv_data = pd.DataFrame({
            'Tipo': ['VPL 5 Anos', 'VPL Perpetuidade'],
            'Realista': [realistic_results['npv_5y'], realistic_results['npv_perpetuity']],
            'Otimista': [optimistic_results['npv_5y'], optimistic_results['npv_perpetuity']]
        })
        
        fig_npv.add_trace(go.Bar(name='Cenário Realista', x=npv_data['Tipo'], y=npv_data['Realista']))
        fig_npv.add_trace(go.Bar(name='Cenário Otimista', x=npv_data['Tipo'], y=npv_data['Otimista']))
        
        fig_npv.update_layout(
            title='Valor Presente Líquido (VPL)',
            yaxis_title=f'VPL ({currency})',
            barmode='group'
        )
        
        st.plotly_chart(fig_npv, use_container_width=True)
    
    # Análise de sensibilidade do Valuation
    st.markdown("### 🎯 Análise de Sensibilidade")
    
    sensitivity_var = st.selectbox(
        "Variável para análise:",
        ["Taxa de Desconto", "Taxa de Crescimento", "Margem EBITDA", "Receita Base"]
    )
    
    # Criar matriz de sensibilidade
    if sensitivity_var == "Taxa de Desconto":
        rates = np.arange(0.08, 0.20, 0.02)
        sensitivity_results = []
        
        for rate in rates:
            result_real = calculate_valuation_indicators(
                "Realista", realistic_revenue, realistic_revenue_var, realistic_costs,
                realistic_costs_var, realistic_profit_dist, rate * 100,
                realistic_growth_rate, credit_to_compensate, judicial_liability, family_debt
            )
            
            result_opt = calculate_valuation_indicators(
                "Otimista", optimistic_revenue, optimistic_revenue_var, optimistic_costs,
                optimistic_costs_var, optimistic_profit_dist, rate * 100,
                optimistic_growth_rate, credit_to_compensate, judicial_liability, family_debt,
                optimistic_credit_recovery, optimistic_liability_reduction
            )
            
            sensitivity_results.append({
                'Taxa': f"{rate*100:.0f}%",
                'VPL Realista': result_real['npv_perpetuity'],
                'VPL Otimista': result_opt['npv_perpetuity']
            })
        
        sens_df = pd.DataFrame(sensitivity_results)
        
        fig_sens = go.Figure()
        fig_sens.add_trace(go.Scatter(x=sens_df['Taxa'], y=sens_df['VPL Realista'], 
                                     mode='lines+markers', name='Cenário Realista'))
        fig_sens.add_trace(go.Scatter(x=sens_df['Taxa'], y=sens_df['VPL Otimista'], 
                                     mode='lines+markers', name='Cenário Otimista'))
        
        fig_sens.update_layout(
            title=f'Sensibilidade do VPL à {sensitivity_var}',
            xaxis_title=sensitivity_var,
            yaxis_title=f'VPL ({currency})'
        )
        
        st.plotly_chart(fig_sens, use_container_width=True)

with tab3:
    st.markdown("## 📑 Relatório Comparativo de Valuation")
    
    # Resumo executivo
    st.markdown("### 📌 Resumo Executivo")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Cenário Realista")
        st.info(f"""
        **Principais Indicadores:**
        - IRR 5 Anos: {realistic_results['irr_5y']*100:.1f}% se disponível
        - IRR Perpetuidade: {realistic_results['irr_perpetuity']*100:.1f}%
        - Payback: {realistic_results['payback_simple']:.1f} anos se disponível
        - VPL 5 Anos: {format_currency(realistic_results['npv_5y'], currency)}
        - Multiplicador: {realistic_results['multiplicador_5y']:.2f}x
        
        **Considerações:**
        - Inclui passivos judiciais integrais
        - Créditos com baixa probabilidade
        - Crescimento conservador
        """)
    
    with col2:
        st.markdown("#### Cenário Otimista")
        st.success(f"""
        **Principais Indicadores:**
        - IRR 5 Anos: {optimistic_results['irr_5y']*100:.1f}% se disponível
        - IRR Perpetuidade: {optimistic_results['irr_perpetuity']*100:.1f}%
        - Payback: {optimistic_results['payback_simple']:.1f} anos se disponível
        - VPL 5 Anos: {format_currency(optimistic_results['npv_5y'], currency)}
        - Multiplicador: {optimistic_results['multiplicador_5y']:.2f}x
        
        **Considerações:**
        - Recuperação parcial de créditos
        - Redução de passivos judiciais
        - Crescimento acelerado
        """)
    
    # Análise de riscos e oportunidades
    st.markdown("### ⚖️ Análise de Riscos e Oportunidades")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 🔴 Riscos Principais")
        st.warning("""
        1. **Passivo Judicial**: R$ 4.179.468,68 pode impactar significativamente o fluxo de caixa
        2. **Endividamento Familiar**: R$ 4.741.474,25 representa risco adicional
        3. **Variação Negativa de Receita**: -10,50% indica tendência preocupante
        4. **Aumento de Custos**: +19,27% pressiona as margens
        5. **Baixa Monetização de Créditos**: Probabilidade reduzida de recuperação
        """)
    
    with col2:
        st.markdown("#### 🟢 Oportunidades")
        st.success("""
        1. **Alta Taxa de Retorno**: IRR superior a 100% em ambos cenários
        2. **Payback Rápido**: Recuperação do investimento em menos de 2 anos
        3. **Potencial de Crescimento**: Mercado com oportunidades de expansão
        4. **Otimização de Custos**: Margem para redução de despesas
        5. **Recuperação de Créditos**: R$ 659.691,68 em potencial
        """)
    
    # Recomendações
    st.markdown("### 💡 Recomendações Estratégicas")
    
    recommendations = [
        "**1. Gestão de Passivos**: Priorizar negociação e redução dos passivos judiciais",
        "**2. Otimização de Custos**: Implementar programa de redução de custos fixos em 10-15%",
        "**3. Crescimento de Receita**: Desenvolver estratégias para reverter tendência negativa",
        "**4. Recuperação de Créditos**: Intensificar esforços para monetização dos créditos",
        "**5. Monitoramento**: Acompanhar mensalmente os KPIs e ajustar projeções"
    ]
    
    for rec in recommendations:
        st.markdown(f"- {rec}")
    
    # Botão de exportação
    st.markdown("### 📥 Exportar Análise")
    
    export_data = {
        'Resumo_Indicadores': comparison_df,
        'Fluxo_Caixa_Realista': pd.DataFrame({
            'Ano': list(range(1, 6)),
            'Fluxo de Caixa': realistic_results['cash_flows'][:5]
        }),
        'Fluxo_Caixa_Otimista': pd.DataFrame({
            'Ano': list(range(1, 6)),
            'Fluxo de Caixa': optimistic_results['cash_flows'][:5]
        })
    }
    
    if st.button("📊 Gerar Relatório Excel", key="export_valuation"):
        export_to_streamlit(export_data, "valuation_analysis.xlsx")
        st.success("✅ Relatório exportado com sucesso!")
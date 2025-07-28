import pandas as pd
import io
import base64
from datetime import datetime
import streamlit as st

def create_excel_download(dataframes_dict, filename="analise_financeira.xlsx"):
    """Cria arquivo Excel para download com múltiplas abas"""
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        for sheet_name, df in dataframes_dict.items():
            # Limita o nome da aba a 31 caracteres (limite do Excel)
            sheet_name = sheet_name[:31]
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    output.seek(0)
    return output.getvalue()

def create_pdf_report(content_dict, title="Relatório de Análise Financeira"):
    """Cria relatório em PDF (implementação básica)"""
    # Para uma implementação completa de PDF, seria necessário usar reportlab
    # Por simplicidade, retornamos o conteúdo formatado como texto
    report_content = f"{title}\n{'='*50}\n\n"
    
    for section, content in content_dict.items():
        report_content += f"{section}\n{'-'*30}\n"
        if isinstance(content, dict):
            for key, value in content.items():
                report_content += f"{key}: {value}\n"
        else:
            report_content += f"{content}\n"
        report_content += "\n"
    
    return report_content.encode('utf-8')

def format_financial_summary(data, market_config):
    """Formata resumo financeiro para exportação"""
    currency = market_config['currency']
    
    summary = {
        'Investimento Inicial': f"{currency} {data.get('initial_investment', 0):,.2f}",
        'Receita Anual Projetada': f"{currency} {data.get('annual_revenue', 0):,.2f}",
        'Custos Anuais': f"{currency} {data.get('annual_costs', 0):,.2f}",
        'Lucro Líquido Anual': f"{currency} {data.get('net_profit', 0):,.2f}",
        'ROI': f"{data.get('roi', 0)*100:.2f}%",
        'TIR': f"{data.get('irr', 0)*100:.2f}%" if data.get('irr') else "N/A",
        'VPL': f"{currency} {data.get('npv', 0):,.2f}",
        'Payback': f"{data.get('payback', 0):.1f} anos" if data.get('payback') else "N/A"
    }
    
    return summary

def create_dre_dataframe(years, revenue_data, cost_data, market_config):
    """Cria DataFrame da DRE para exportação"""
    dre_data = []
    
    for year in range(years):
        year_data = {
            'Ano': 2024 + year,
            'Receita Bruta': revenue_data.get(f'year_{year}', {}).get('total', 0),
            'Receita Líquida': revenue_data.get(f'year_{year}', {}).get('net', 0),
            'Custos Variáveis': cost_data.get(f'year_{year}', {}).get('variable', 0),
            'Custos Fixos': cost_data.get(f'year_{year}', {}).get('fixed', 0),
            'EBITDA': 0,  # Será calculado
            'Depreciação': cost_data.get(f'year_{year}', {}).get('depreciation', 0),
            'EBIT': 0,  # Será calculado
            'Impostos': 0,  # Será calculado
            'Lucro Líquido': 0  # Será calculado
        }
        
        # Cálculos
        year_data['EBITDA'] = year_data['Receita Líquida'] - year_data['Custos Variáveis'] - year_data['Custos Fixos']
        year_data['EBIT'] = year_data['EBITDA'] - year_data['Depreciação']
        year_data['Impostos'] = year_data['EBIT'] * market_config['tax_rate'] if year_data['EBIT'] > 0 else 0
        year_data['Lucro Líquido'] = year_data['EBIT'] - year_data['Impostos']
        
        dre_data.append(year_data)
    
    return pd.DataFrame(dre_data)

def create_cash_flow_dataframe(years, cash_flow_data):
    """Cria DataFrame do fluxo de caixa para exportação"""
    cf_data = []
    
    for year in range(years):
        year_data = {
            'Ano': 2024 + year,
            'Fluxo Operacional': cash_flow_data.get(f'operational_{year}', 0),
            'Fluxo de Investimento': cash_flow_data.get(f'investment_{year}', 0),
            'Fluxo de Financiamento': cash_flow_data.get(f'financing_{year}', 0),
            'Fluxo Líquido': 0,  # Será calculado
            'Saldo Acumulado': 0  # Será calculado
        }
        
        year_data['Fluxo Líquido'] = (year_data['Fluxo Operacional'] + 
                                    year_data['Fluxo de Investimento'] + 
                                    year_data['Fluxo de Financiamento'])
        
        cf_data.append(year_data)
    
    # Calcula saldo acumulado
    accumulated = 0
    for data in cf_data:
        accumulated += data['Fluxo Líquido']
        data['Saldo Acumulado'] = accumulated
    
    return pd.DataFrame(cf_data)

def create_kpi_dataframe(kpi_data, market_config):
    """Cria DataFrame dos KPIs para exportação"""
    kpis = []
    
    for kpi_name, kpi_value in kpi_data.items():
        kpi_row = {
            'Indicador': kpi_name,
            'Valor': kpi_value,
            'Unidade': get_kpi_unit(kpi_name, market_config)
        }
        kpis.append(kpi_row)
    
    return pd.DataFrame(kpis)

def get_kpi_unit(kpi_name, market_config):
    """Retorna unidade adequada para cada KPI"""
    currency = market_config['currency']
    
    units = {
        'ROI': '%',
        'TIR': '%',
        'VPL': currency,
        'Payback': 'anos',
        'Margem Bruta': '%',
        'Margem Líquida': '%',
        'Receita por Quadra': f'{currency}/ano',
        'Ocupação Média': '%',
        'Break-even': 'horas/mês'
    }
    
    return units.get(kpi_name, '')

def download_button_html(data, filename, button_text, mime_type):
    """Cria botão de download HTML"""
    b64 = base64.b64encode(data).decode()
    href = f'<a href="data:{mime_type};base64,{b64}" download="{filename}">{button_text}</a>'
    return href

def create_comprehensive_report(all_data, market_config):
    """Cria relatório abrangente com todos os dados"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Prepara DataFrames para Excel
    excel_data = {}
    
    # Resumo Executivo
    if 'summary' in all_data:
        excel_data['Resumo Executivo'] = pd.DataFrame([all_data['summary']]).T
        excel_data['Resumo Executivo'].columns = ['Valor']
    
    # DRE
    if 'dre' in all_data:
        excel_data['DRE'] = create_dre_dataframe(
            all_data['years'], 
            all_data['dre']['revenue'], 
            all_data['dre']['costs'], 
            market_config
        )
    
    # Fluxo de Caixa
    if 'cash_flow' in all_data:
        excel_data['Fluxo de Caixa'] = create_cash_flow_dataframe(
            all_data['years'],
            all_data['cash_flow']
        )
    
    # KPIs
    if 'kpis' in all_data:
        excel_data['KPIs'] = create_kpi_dataframe(all_data['kpis'], market_config)
    
    # Análise de Sensibilidade
    if 'sensitivity' in all_data:
        for var_name, var_data in all_data['sensitivity'].items():
            df_name = f'Sens_{var_name[:20]}'  # Limita nome da aba
            excel_data[df_name] = pd.DataFrame(var_data)
    
    return excel_data

def export_to_streamlit(data, filename_prefix="analise_financeira"):
    """Funcionalidade de exportação integrada ao Streamlit"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("📊 Exportar para Excel"):
            excel_data = create_excel_download(data, f"{filename_prefix}_{timestamp}.xlsx")
            st.download_button(
                label="⬇️ Download Excel",
                data=excel_data,
                file_name=f"{filename_prefix}_{timestamp}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
    
    with col2:
        if st.button("📄 Exportar Relatório"):
            pdf_content = create_pdf_report(data, "Análise Financeira - Clube de Futebol")
            st.download_button(
                label="⬇️ Download Relatório",
                data=pdf_content,
                file_name=f"relatorio_{filename_prefix}_{timestamp}.txt",
                mime="text/plain"
            )

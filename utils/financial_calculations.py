import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math

def calculate_npv(cash_flows, discount_rate):
    """Calcula o Valor Presente Líquido (VPL/NPV)"""
    npv = 0
    for i, cf in enumerate(cash_flows):
        npv += cf / (1 + discount_rate) ** i
    return npv

def calculate_irr(cash_flows, guess=0.1, max_iterations=1000, tolerance=1e-6):
    """Calcula a Taxa Interna de Retorno (TIR/IRR)"""
    def npv_function(rate, cash_flows):
        return sum(cf / (1 + rate) ** i for i, cf in enumerate(cash_flows))
    
    # Método de Newton-Raphson
    rate = guess
    for _ in range(max_iterations):
        npv = npv_function(rate, cash_flows)
        if abs(npv) < tolerance:
            return rate
        
        # Derivada da função NPV
        d_npv = sum(-i * cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows))
        if d_npv == 0:
            break
        
        rate = rate - npv / d_npv
    
    return rate if abs(npv_function(rate, cash_flows)) < tolerance else None

def calculate_roi(initial_investment, final_value):
    """Calcula o Retorno sobre Investimento (ROI)"""
    return (final_value - initial_investment) / initial_investment

def calculate_payback_period(cash_flows):
    """Calcula o período de payback"""
    cumulative = 0
    for i, cf in enumerate(cash_flows):
        cumulative += cf
        if cumulative >= 0:
            return i + (cumulative - cf) / cf if cf != 0 else i
    return None

def calculate_break_even(fixed_costs, variable_cost_per_unit, price_per_unit):
    """Calcula ponto de equilíbrio em unidades"""
    if price_per_unit <= variable_cost_per_unit:
        return None
    return fixed_costs / (price_per_unit - variable_cost_per_unit)

def calculate_working_capital(current_assets, current_liabilities):
    """Calcula capital de giro"""
    return current_assets - current_liabilities

def calculate_financial_ratios(revenue, costs, assets, liabilities, equity):
    """Calcula principais índices financeiros"""
    gross_profit = revenue - costs
    net_profit = gross_profit * 0.85  # Assumindo 15% de impostos como base
    
    ratios = {
        'gross_margin': gross_profit / revenue if revenue > 0 else 0,
        'net_margin': net_profit / revenue if revenue > 0 else 0,
        'roa': net_profit / assets if assets > 0 else 0,
        'roe': net_profit / equity if equity > 0 else 0,
        'debt_to_equity': liabilities / equity if equity > 0 else 0,
        'current_ratio': assets / liabilities if liabilities > 0 else 0
    }
    
    return ratios

def project_revenue(base_revenue, growth_rate, years, seasonality_factor=None):
    """Projeta receita com crescimento e sazonalidade"""
    projections = []
    
    for year in range(years):
        if seasonality_factor:
            # Aplica fator de sazonalidade (lista de 12 valores para cada mês)
            monthly_revenues = []
            annual_base = base_revenue * (1 + growth_rate) ** year
            for month_factor in seasonality_factor:
                monthly_revenues.append(annual_base * month_factor / 12)
            projections.append(monthly_revenues)
        else:
            annual_revenue = base_revenue * (1 + growth_rate) ** year
            projections.append(annual_revenue)
    
    return projections

def calculate_depreciation(asset_value, useful_life, method='straight_line'):
    """Calcula depreciação"""
    if method == 'straight_line':
        return asset_value / useful_life
    elif method == 'declining_balance':
        rate = 2 / useful_life
        return asset_value * rate
    else:
        return asset_value / useful_life

def calculate_tax_burden(revenue, market_config):
    """Calcula carga tributária baseada na configuração do mercado"""
    base_tax = revenue * market_config['tax_rate']
    
    # Impostos específicos por mercado
    additional_taxes = 0
    if market_config['market'] == 'Brasil':
        # Simples Nacional, ISS, etc.
        additional_taxes = revenue * 0.065  # 6.5% adicional para impostos municipais e federais
    elif market_config['market'] == 'Europa':
        # VAT, Corporate tax
        additional_taxes = revenue * 0.05  # 5% adicional
    elif market_config['market'] == 'Emirados Árabes':
        # VAT (lower rate)
        additional_taxes = revenue * 0.025  # 2.5% adicional
    
    return base_tax + additional_taxes

def monte_carlo_simulation(base_values, uncertainties, num_simulations=1000):
    """Simulação Monte Carlo para análise de sensibilidade"""
    results = []
    
    for _ in range(num_simulations):
        scenario = {}
        for key, (base_value, uncertainty) in zip(base_values.keys(), zip(base_values.values(), uncertainties.values())):
            # Gera valor aleatório com distribuição normal
            random_factor = np.random.normal(1, uncertainty)
            scenario[key] = base_value * random_factor
        results.append(scenario)
    
    return results

def calculate_sensitivity_analysis(base_case, variables, change_range=0.2):
    """Análise de sensibilidade univariada"""
    results = {}
    
    for var_name, base_value in variables.items():
        var_results = []
        changes = np.arange(-change_range, change_range + 0.01, 0.05)
        
        for change in changes:
            modified_case = base_case.copy()
            modified_case[var_name] = base_value * (1 + change)
            
            # Recalcula o resultado (NPV como exemplo)
            cash_flows = generate_cash_flows(modified_case)
            npv = calculate_npv(cash_flows, modified_case.get('discount_rate', 0.1))
            
            var_results.append({
                'change_percent': change * 100,
                'new_value': modified_case[var_name],
                'npv': npv
            })
        
        results[var_name] = var_results
    
    return results

def generate_cash_flows(scenario):
    """Gera fluxos de caixa baseado no cenário"""
    years = scenario.get('years', 12)
    initial_investment = scenario.get('initial_investment', 0)
    annual_revenue = scenario.get('annual_revenue', 0)
    annual_costs = scenario.get('annual_costs', 0)
    growth_rate = scenario.get('growth_rate', 0.05)
    
    cash_flows = [-initial_investment]  # Investimento inicial negativo
    
    for year in range(1, years + 1):
        revenue = annual_revenue * (1 + growth_rate) ** (year - 1)
        costs = annual_costs * (1 + growth_rate * 0.8) ** (year - 1)  # Custos crescem menos que receita
        net_cash_flow = revenue - costs
        cash_flows.append(net_cash_flow)
    
    return cash_flows

def calculate_valuation_multiples(revenue, ebitda, net_income, industry_multiples):
    """Calcula múltiplos de valuation"""
    valuations = {}
    
    if 'ev_revenue' in industry_multiples:
        valuations['enterprise_value_revenue'] = revenue * industry_multiples['ev_revenue']
    
    if 'ev_ebitda' in industry_multiples:
        valuations['enterprise_value_ebitda'] = ebitda * industry_multiples['ev_ebitda']
    
    if 'pe_ratio' in industry_multiples:
        valuations['market_value_pe'] = net_income * industry_multiples['pe_ratio']
    
    return valuations

def calculate_dcf_valuation(cash_flows, terminal_growth_rate, discount_rate):
    """Calcula valuation por fluxo de caixa descontado"""
    # Valor presente dos fluxos explícitos
    pv_explicit = sum(cf / (1 + discount_rate) ** i for i, cf in enumerate(cash_flows[1:], 1))
    
    # Valor terminal
    if len(cash_flows) > 1:
        terminal_cf = cash_flows[-1] * (1 + terminal_growth_rate)
        terminal_value = terminal_cf / (discount_rate - terminal_growth_rate)
        pv_terminal = terminal_value / (1 + discount_rate) ** len(cash_flows)
    else:
        pv_terminal = 0
    
    enterprise_value = pv_explicit + pv_terminal
    return enterprise_value, pv_explicit, pv_terminal

def format_currency(value, currency_symbol="R$"):
    """Formata valores monetários"""
    if abs(value) >= 1000000:
        return f"{currency_symbol} {value/1000000:.2f}M"
    elif abs(value) >= 1000:
        return f"{currency_symbol} {value/1000:.0f}K"
    else:
        return f"{currency_symbol} {value:.2f}"

def calculate_loan_payment(principal, annual_rate, years):
    """Calcula pagamento de empréstimo (PMT)"""
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    
    if monthly_rate == 0:
        return principal / num_payments
    
    payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / \
              ((1 + monthly_rate) ** num_payments - 1)
    
    return payment

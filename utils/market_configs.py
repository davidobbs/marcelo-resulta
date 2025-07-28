# Configurações específicas para cada mercado

MARKETS = {
    "Brasil": {
        "currency": "R$",
        "tax_rate": 0.163,  # Simples Nacional + ISS aproximado
        "inflation_rate": 0.065,  # 6.5% ao ano
        "discount_rate": 0.12,  # Taxa Selic + risco
        "avg_hourly_rate": 80.0,  # Preço médio por hora de quadra
        "expected_occupancy": 0.65,  # 65% de ocupação esperada
        "hours_per_day": 12,  # Horário de funcionamento
        "days_per_week": 7,
        "salary_burden": 0.70,  # Encargos trabalhistas (70% sobre salário)
        "rent_per_sqm": 25.0,  # Aluguel por m² mensal
        "utility_cost_factor": 0.08,  # 8% da receita em custos de utilities
        "maintenance_factor": 0.05,  # 5% da receita em manutenção
        "marketing_factor": 0.03,  # 3% da receita em marketing
        "working_capital_days": 30,  # Dias de capital de giro
        "depreciation_rate": 0.10,  # 10% ao ano para equipamentos
        "corporate_tax": 0.25,  # Imposto de renda pessoa jurídica
        "social_contribution": 0.09,  # CSLL
        "pis_cofins": 0.0365,  # PIS/COFINS sobre faturamento
        "iss_rate": 0.05,  # ISS sobre serviços
        "growth_potential": 0.15,  # Potencial de crescimento anual
        "market_size_factor": 1.0,  # Fator de tamanho de mercado (base)
        "competition_level": "Alto",
        "regulatory_complexity": "Alta"
    },
    
    "Europa": {
        "currency": "€",
        "tax_rate": 0.25,  # Corporate tax médio europeu
        "inflation_rate": 0.03,  # 3% ao ano
        "discount_rate": 0.08,  # Taxa de juros européia + risco
        "avg_hourly_rate": 45.0,  # Preço médio por hora em euros
        "expected_occupancy": 0.75,  # Maior ocupação esperada
        "hours_per_day": 14,  # Horário estendido
        "days_per_week": 7,
        "salary_burden": 0.45,  # Encargos sociais europeus
        "rent_per_sqm": 18.0,  # Aluguel por m² mensal
        "utility_cost_factor": 0.12,  # Custos de energia mais altos
        "maintenance_factor": 0.06,  # Manutenção mais cara
        "marketing_factor": 0.04,  # Marketing mais caro
        "working_capital_days": 45,  # Mais dias de capital de giro
        "depreciation_rate": 0.08,  # Depreciação mais conservadora
        "corporate_tax": 0.25,
        "vat_rate": 0.20,  # IVA médio
        "social_security": 0.15,  # Contribuições sociais
        "growth_potential": 0.08,  # Crescimento mais moderado
        "market_size_factor": 2.5,  # Mercado maior
        "competition_level": "Médio",
        "regulatory_complexity": "Média"
    },
    
    "Emirados Árabes": {
        "currency": "AED",
        "tax_rate": 0.05,  # VAT nos Emirados
        "inflation_rate": 0.02,  # Inflação baixa
        "discount_rate": 0.06,  # Taxa de juros baixa
        "avg_hourly_rate": 180.0,  # Preço premium em AED
        "expected_occupancy": 0.80,  # Alta ocupação esperada
        "hours_per_day": 16,  # Funcionamento estendido
        "days_per_week": 7,
        "salary_burden": 0.15,  # Baixos encargos trabalhistas
        "rent_per_sqm": 35.0,  # Aluguel premium
        "utility_cost_factor": 0.15,  # Ar condicionado custoso
        "maintenance_factor": 0.08,  # Manutenção em clima árido
        "marketing_factor": 0.05,  # Marketing premium
        "working_capital_days": 60,  # Ciclo de pagamento mais longo
        "depreciation_rate": 0.12,  # Depreciação acelerada pelo clima
        "corporate_tax": 0.09,  # Imposto corporativo recentemente introduzido
        "vat_rate": 0.05,  # VAT
        "growth_potential": 0.12,  # Alto potencial de crescimento
        "market_size_factor": 1.8,  # Mercado em crescimento
        "competition_level": "Baixo",  # Mercado em desenvolvimento
        "regulatory_complexity": "Baixa"
    }
}

def get_market_config(market_name):
    """Retorna configuração do mercado selecionado"""
    config = MARKETS.get(market_name, MARKETS["Brasil"]).copy()
    config['market'] = market_name
    return config

def get_all_markets():
    """Retorna lista de todos os mercados disponíveis"""
    return list(MARKETS.keys())

def compare_markets(metrics=None):
    """Compara métricas entre mercados"""
    if metrics is None:
        metrics = ['tax_rate', 'avg_hourly_rate', 'expected_occupancy', 'growth_potential']
    
    comparison = {}
    for market_name, config in MARKETS.items():
        comparison[market_name] = {metric: config.get(metric, 0) for metric in metrics}
    
    return comparison

def get_tax_calculation(market_name, revenue, profit):
    """Calcula impostos específicos do mercado"""
    config = MARKETS.get(market_name, MARKETS["Brasil"])
    
    taxes = {}
    
    if market_name == "Brasil":
        taxes['simples_nacional'] = revenue * 0.08  # Aproximação Simples Nacional
        taxes['iss'] = revenue * config.get('iss_rate', 0.05)
        taxes['pis_cofins'] = revenue * config.get('pis_cofins', 0.0365)
        taxes['irpj'] = profit * config.get('corporate_tax', 0.25) if profit > 0 else 0
        taxes['csll'] = profit * config.get('social_contribution', 0.09) if profit > 0 else 0
        
    elif market_name == "Europa":
        taxes['vat'] = revenue * config.get('vat_rate', 0.20)
        taxes['corporate_tax'] = profit * config.get('corporate_tax', 0.25) if profit > 0 else 0
        taxes['social_security'] = revenue * config.get('social_security', 0.15)
        
    elif market_name == "Emirados Árabes":
        taxes['vat'] = revenue * config.get('vat_rate', 0.05)
        taxes['corporate_tax'] = profit * config.get('corporate_tax', 0.09) if profit > 0 else 0
    
    taxes['total'] = sum(taxes.values())
    return taxes

def get_seasonal_factors(market_name):
    """Retorna fatores de sazonalidade por mercado"""
    seasonality = {
        "Brasil": [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0],  # Verão forte
        "Europa": [0.6, 0.7, 0.9, 1.1, 1.3, 1.4, 1.2, 1.1, 1.0, 0.9, 0.7, 0.6],  # Verão europeu
        "Emirados Árabes": [1.1, 1.2, 1.3, 1.1, 0.8, 0.6, 0.5, 0.6, 0.9, 1.2, 1.3, 1.1]  # Evita verão extremo
    }
    
    return seasonality.get(market_name, [1.0] * 12)

def get_industry_benchmarks(market_name):
    """Retorna benchmarks da indústria por mercado"""
    benchmarks = {
        "Brasil": {
            "avg_revenue_per_field": 150000,  # R$ por quadra/ano
            "avg_profit_margin": 0.15,
            "avg_occupancy": 0.60,
            "payback_period": 3.5,  # anos
            "roi_expected": 0.25
        },
        "Europa": {
            "avg_revenue_per_field": 85000,  # € por quadra/ano
            "avg_profit_margin": 0.18,
            "avg_occupancy": 0.70,
            "payback_period": 4.0,
            "roi_expected": 0.20
        },
        "Emirados Árabes": {
            "avg_revenue_per_field": 220000,  # AED por quadra/ano
            "avg_profit_margin": 0.22,
            "avg_occupancy": 0.75,
            "payback_period": 3.0,
            "roi_expected": 0.30
        }
    }
    
    return benchmarks.get(market_name, benchmarks["Brasil"])

def get_investment_requirements(market_name, num_fields):
    """Calcula investimentos necessários por mercado"""
    base_costs = {
        "Brasil": {
            "field_construction": 120000,  # R$ por quadra
            "equipment": 25000,  # Equipamentos por quadra
            "facility_setup": 80000,  # Vestiários, recepção, etc.
            "working_capital": 50000,  # Capital de giro inicial
            "licensing": 15000  # Licenças e documentação
        },
        "Europa": {
            "field_construction": 75000,  # € por quadra
            "equipment": 18000,
            "facility_setup": 55000,
            "working_capital": 35000,
            "licensing": 12000
        },
        "Emirados Árabes": {
            "field_construction": 180000,  # AED por quadra
            "equipment": 35000,
            "facility_setup": 120000,
            "working_capital": 80000,
            "licensing": 25000
        }
    }
    
    costs = base_costs.get(market_name, base_costs["Brasil"])
    
    # Calcula investimento total
    total_investment = {
        "field_costs": costs["field_construction"] * num_fields,
        "equipment_costs": costs["equipment"] * num_fields,
        "facility_costs": costs["facility_setup"],
        "working_capital": costs["working_capital"],
        "licensing_costs": costs["licensing"]
    }
    
    total_investment["total"] = sum(total_investment.values())
    
    return total_investment

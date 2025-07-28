# Sistema de Análise Financeira para Clubes de Futebol

## Overview

This is a comprehensive financial analysis system for football clubs, built using Streamlit. The application provides multi-market financial modeling, including DRE (Income Statement), cash flow analysis, working capital management, tax calculations, KPI dashboards, and investment viability analysis. The system supports different markets (Brazil, Europe) with specific tax configurations and market parameters.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit-based web application
- **Structure**: Multi-page application with main app.py and modular pages
- **UI Components**: Custom CSS styling with metric cards, responsive layout, and plotly visualizations
- **Navigation**: Sidebar-based navigation with session state management

### Backend Architecture
- **Language**: Python
- **Structure**: Modular utility-based architecture
- **Data Processing**: Pandas for data manipulation, NumPy for calculations
- **Visualization**: Plotly Express and Plotly Graph Objects for interactive charts
- **Session Management**: Streamlit session state for data persistence across pages

### Page Structure
- Main application (`app.py`): Market selection and global configurations
- **DRE Gerencial** (`pages/1_📊_DRE_Gerencial.py`): Income statement analysis
- **Capital de Giro** (`pages/2_💰_Capital_de_Giro.py`): Working capital management
- **Fluxo de Caixa** (`pages/3_📈_Fluxo_de_Caixa.py`): Cash flow projections
- **Impostos & Tributação** (`pages/4_🏛️_Impostos_Tributacao.py`): Tax analysis
- **Dashboard KPIs** (`pages/6_📋_Dashboard_KPIs.py`): Key performance indicators
- **Análise de Viabilidade** (`pages/7_🎯_Analise_Viabilidade.py`): Investment viability analysis
- **Valuation** (`pages/8_💎_Valuation.py`): Company valuation with editable IRR, Payback, and NPV calculations

## Key Components

### Market Configuration System
- **File**: `utils/market_configs.py`
- **Purpose**: Stores market-specific parameters for different regions
- **Markets Supported**: Brazil, Europe, and UAE with distinct tax rates, inflation, hourly rates, and operational parameters
- **Configuration Types**: Tax rates, operational costs, growth potential, regulatory complexity

### Valuation Module
- **File**: `pages/8_💎_Valuation.py`
- **Purpose**: Comprehensive company valuation with scenario analysis
- **Features**: 
  - Editable financial parameters for full control
  - Dual scenario analysis (Realistic vs Optimistic)
  - IRR calculations for 5-year and perpetuity horizons
  - Simple and discounted payback period calculations
  - NPV (VPL) analysis with customizable discount rates
  - Consideration of judicial liabilities and credit recovery
  - Sensitivity analysis for key valuation drivers
  - Export functionality for valuation reports

### Financial Calculation Engine
- **File**: `utils/financial_calculations.py`
- **Core Functions**: 
  - NPV (Net Present Value) calculations
  - IRR (Internal Rate of Return) using Newton-Raphson method
  - ROI (Return on Investment)
  - Payback period analysis
  - Break-even calculations
  - Depreciation calculations
  - Currency formatting

### Export Utilities
- **File**: `utils/export_utils.py`
- **Features**: Excel export with multiple sheets, PDF report generation, financial summary formatting
- **Data Formats**: Supports pandas DataFrame export to Excel, formatted financial summaries

### Session State Management
- Global market selection stored in `st.session_state`
- Field configuration persistence across pages
- User input preservation during navigation

## Data Flow

1. **Market Selection**: User selects market in main app, stored in session state
2. **Parameter Configuration**: Each page reads market config and allows user customization
3. **Financial Calculations**: Utils perform complex financial calculations based on inputs
4. **Visualization**: Plotly generates interactive charts and graphs
5. **Export**: Results can be exported to Excel or PDF formats

## External Dependencies

### Core Libraries
- **Streamlit**: Web application framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computations
- **Plotly**: Interactive visualizations (Express and Graph Objects)
- **openpyxl**: Excel file generation

### Python Standard Libraries
- **datetime**: Date and time operations
- **io**: File handling for exports
- **base64**: Encoding for downloads
- **math**: Mathematical operations

## Deployment Strategy

### Current Setup
- Streamlit-based application designed for local development
- Modular structure allows for easy deployment to Streamlit Cloud
- No database dependencies (uses in-memory calculations)

### Recommended Deployment
- **Platform**: Streamlit Cloud or similar Python hosting service
- **Requirements**: All dependencies listed in requirements.txt
- **Configuration**: Environment variables for sensitive parameters
- **Scaling**: Stateless design allows for horizontal scaling

### Development Considerations
- Session state management ensures data persistence
- Modular utility structure facilitates testing and maintenance
- Market-specific configurations allow for easy expansion to new regions
- Export functionality provides business value for users

### Security Notes
- No user authentication currently implemented
- Financial calculations are performed client-side
- Consider adding user sessions for multi-tenant deployment
- Market configurations could be moved to external configuration files for easier updates
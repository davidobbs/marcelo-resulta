import { CountryProfile } from '@/types';

export const countryProfiles: Record<string, CountryProfile> = {
  BR: {
    code: 'BR',
    name: 'Brasil',
    currency: { code: 'BRL', symbol: 'R$' },
    taxes: [
      { name: 'PIS', rate: 0.0165, type: 'other', appliesTo: ['revenues'], description: 'Programa de Integração Social' },
      { name: 'COFINS', rate: 0.076, type: 'other', appliesTo: ['revenues'], description: 'Contribuição para o Financiamento da Seguridade Social' },
      { name: 'IRPJ', rate: 0.15, type: 'corporate', appliesTo: ['profits'], description: 'Imposto de Renda Pessoa Jurídica' },
      { name: 'CSLL', rate: 0.09, type: 'social_contribution', appliesTo: ['profits'], description: 'Contribuição Social sobre o Lucro Líquido' },
      { name: 'INSS', rate: 0.20, type: 'labor', appliesTo: ['salaries'], description: 'Contribuição para a Previdência Social (Patronal)' },
      { name: 'FGTS', rate: 0.08, type: 'labor', appliesTo: ['salaries'], description: 'Fundo de Garantia do Tempo de Serviço' },
    ],
    federationFees: {
      playerRegistration: 500, // Exemplo, em BRL
      annualFee: 10000, // Exemplo, em BRL
    },
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    currency: { code: 'EUR', symbol: '€' },
    taxes: [
      { name: 'IVA (Taxa Normal)', rate: 0.23, type: 'vat', appliesTo: ['revenues'], description: 'Imposto sobre o Valor Acrescentado' },
      { name: 'IRC', rate: 0.21, type: 'corporate', appliesTo: ['profits'], description: 'Imposto sobre o Rendimento de Pessoas Coletivas' },
      { name: 'TSU', rate: 0.2375, type: 'labor', appliesTo: ['salaries'], description: 'Taxa Social Única (Entidade Empregadora)' },
    ],
    federationFees: {
      playerRegistration: 250, // Exemplo, em EUR
      annualFee: 5000, // Exemplo, em EUR
    },
  },
  US: {
    code: 'US',
    name: 'Estados Unidos',
    currency: { code: 'USD', symbol: '$' },
    taxes: [
      { name: 'Federal Corporate Tax', rate: 0.21, type: 'corporate', appliesTo: ['profits'], description: 'Federal corporate income tax' },
      { name: 'Social Security', rate: 0.062, type: 'labor', appliesTo: ['salaries'], description: 'Employer portion' },
      { name: 'Medicare', rate: 0.0145, type: 'labor', appliesTo: ['salaries'], description: 'Employer portion' },
      // Sales tax is highly variable and often not applied to services, so it's omitted for simplicity.
    ],
    federationFees: {
      playerRegistration: 100, // Example in USD
      annualFee: 2000, // Example in USD
    },
  },
};

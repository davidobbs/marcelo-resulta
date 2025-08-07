// import type { Currency } from '@/types';
import { FORMAT_CONFIG } from '@/lib/constants';

/**
 * Formata valores monetários
 */
export function formatCurrency(
  value: number,
  currency: string = 'R$',
  compact = false
): string {
  const config = FORMAT_CONFIG.currency[currency as keyof typeof FORMAT_CONFIG.currency];
  
  if (compact) {
    if (Math.abs(value) >= 1000000) {
      return `${currency} ${(value / 1000000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${currency} ${(value / 1000).toFixed(0)}K`;
    }
  }
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: FORMAT_CONFIG.number.minimumFractionDigits,
      maximumFractionDigits: FORMAT_CONFIG.number.maximumFractionDigits,
    }).format(value);
  } catch {
    // Fallback para formato simples
    return `${currency} ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Formata percentuais
 */
export function formatPercentage(
  value: number,
  decimalPlaces = 1,
  showSign = false
): string {
  const formatted = (value * 100).toFixed(decimalPlaces);
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Formata números com separadores de milhares
 */
export function formatNumber(
  value: number,
  decimalPlaces = 2,
  locale = 'pt-BR'
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Formata números de forma compacta (K, M, B)
 */
export function formatCompactNumber(
  value: number,
  currency?: string,
  locale = 'pt-BR'
): string {
  const prefixes = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];
  
  for (const prefix of prefixes) {
    if (Math.abs(value) >= prefix.value) {
      const formatted = (value / prefix.value).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      return currency ? `${currency} ${formatted}${prefix.symbol}` : `${formatted}${prefix.symbol}`;
    }
  }
  
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return currency ? `${currency} ${formatted}` : formatted;
}

/**
 * Formata datas
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'pt-BR'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
  };
  
  return dateObj.toLocaleDateString(locale, optionsMap[format]);
}

/**
 * Formata período em anos para string legível
 */
export function formatPeriod(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} mês${months !== 1 ? 'es' : ''}`;
  }
  
  const wholeYears = Math.floor(years);
  const remainingMonths = Math.round((years - wholeYears) * 12);
  
  let result = `${wholeYears} ano${wholeYears !== 1 ? 's' : ''}`;
  
  if (remainingMonths > 0) {
    result += ` e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
  }
  
  return result;
}

/**
 * Converte valor numérico para texto ordinal
 */
export function formatOrdinal(value: number): string {
  const ordinals = [
    '', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º',
    '11º', '12º', '13º', '14º', '15º', '16º', '17º', '18º', '19º', '20º'
  ];
  
  return ordinals[value] || `${value}º`;
}

/**
 * Formata razão/proporção
 */
export function formatRatio(
  numerator: number,
  denominator: number,
  decimalPlaces = 2
): string {
  if (denominator === 0) return 'N/A';
  
  const ratio = numerator / denominator;
  return `${ratio.toFixed(decimalPlaces)}:1`;
}

/**
 * Formata valores com cores baseadas em threshold
 */
export function formatValueWithColor(
  value: number,
  threshold: { positive: number; negative: number },
  formatter: (val: number) => string = (val) => val.toString()
): { formatted: string; color: string } {
  let color = 'text-gray-900'; // Neutro
  
  if (value >= threshold.positive) {
    color = 'text-green-600'; // Positivo
  } else if (value <= threshold.negative) {
    color = 'text-red-600'; // Negativo
  }
  
  return {
    formatted: formatter(value),
    color,
  };
}

/**
 * Trunca texto longo
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Formata lista de itens em texto
 */
export function formatList(
  items: string[],
  conjunction = 'e'
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')} ${conjunction} ${lastItem}`;
}

/**
 * Valida se um valor é um número válido
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Converte string para número de forma segura
 */
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isValidNumber(parsed) ? parsed : 0;
}

/**
 * Formata arquivo de tamanho
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converte texto para slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
} 
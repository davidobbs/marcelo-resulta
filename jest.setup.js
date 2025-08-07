import '@testing-library/jest-dom';

// Mock do Web Worker
global.Worker = class {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    if (msg.action === 'recalculate') {
      // Simula o comportamento do worker
      this.onmessage({
        data: {
          action: 'recalculate_result',
          payload: {
            variables: [],
            metrics: { totalRevenue: 1000, totalCosts: 500, netProfit: 500, profitMargin: 0.5, breakEvenPoint: 10, roi: 1 },
            projections: [],
            validation: { isValid: true, errors: [] },
          },
        },
      });
    }
  }
};

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock do Zustand
jest.mock('zustand', () => ({
  create: jest.fn(() => (set, get) => ({
    // Mock store state
  })),
}));

// Mock de componentes que podem causar problemas em testes
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => <div data-testid="area" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => <div data-testid="bar" />,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock do Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock do react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chartjs-line" />,
  Bar: () => <div data-testid="chartjs-bar" />,
  Pie: () => <div data-testid="chartjs-pie" />,
}));

// Configuração global para testes
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
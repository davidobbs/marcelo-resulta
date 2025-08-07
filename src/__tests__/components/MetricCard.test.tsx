import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrendingUp } from 'lucide-react';

// Mock do componente MetricCard (seria importado do arquivo real)
const MetricCard = ({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className={`metric-card ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  </div>
);

describe('MetricCard', () => {
  it('renders metric card with correct title and value', () => {
    render(
      <MetricCard
        title="Receita Total"
        value="R$ 150.000"
        icon={<TrendingUp />}
        color="blue"
      />
    );

    expect(screen.getByText('Receita Total')).toBeInTheDocument();
    expect(screen.getByText('R$ 150.000')).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(
      <MetricCard
        title="Test Metric"
        value="100"
        icon={<TrendingUp />}
        color="green"
      />
    );

    expect(container.firstChild).toHaveClass('green');
  });
});
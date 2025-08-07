
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFinancialEngine } from '@/hooks/useFinancialEngine';



describe('useFinancialEngine', () => {
  it('should recalculate financial data using the worker', async () => {
    const { result } = renderHook(() => useFinancialEngine());

    await act(async () => {
      result.current.recalculate();
    });

    await waitFor(() => {
      expect(result.current.metrics.totalRevenue).toBe(1000);
    });
  });
});

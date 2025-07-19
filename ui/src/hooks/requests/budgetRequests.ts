import { IUpdateBudgetDto } from '@clients';
import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import useApi from './useApi.ts';
import { routes } from '../../routes/apiRoutes.ts';

// Interface for the budget burndown response
export interface BudgetBurndownData {
  month: number;
  year: number;
  categories: CategoryBurndownData[];
}

export interface CategoryBurndownData {
  categoryId: number;
  categoryName: string;
  budget: number;
  totalSpent: number;
  dailySpending: Record<number, number>;
  remainingBudget: Record<number, number>;
}

export const useGetBudget = (): [() => Promise<AxiosResponse | undefined>] => {
  const { get } = useApi();
  const callback = useCallback(() => {
    return get(routes.budget.get);
  }, [get]);
  return [callback];
};

export const usePostModify = (): [
  (body: IUpdateBudgetDto[]) => Promise<AxiosResponse | undefined>,
] => {
  const { post } = useApi();
  const callback = useCallback(
    (body: IUpdateBudgetDto[]) => {
      return post(routes.budget.modify, body);
    },
    [post],
  );
  return [callback];
};

/**
 * Hook for fetching budget burn-down data
 * @returns A function that fetches budget burn-down data for a specific month and year
 */
export const useGetBudgetBurndown = (): [
  (
    month?: number,
    year?: number,
  ) => Promise<AxiosResponse<BudgetBurndownData> | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month !== undefined) params.append('month', month.toString());
      if (year !== undefined) params.append('year', year.toString());

      return get(routes.budget.burndown, params) as Promise<
        AxiosResponse<BudgetBurndownData> | undefined
      >;
    },
    [get],
  );
  return [callback];
};

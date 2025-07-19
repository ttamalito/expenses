import { ICreateExpenseDto, IExpense } from '@clients';
import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import useApi from './useApi.ts';
import { routes } from '../../routes/apiRoutes.ts';

export const usePostAdd = (): [
  (body: ICreateExpenseDto) => Promise<AxiosResponse | undefined>,
] => {
  const { post } = useApi();
  const callback = useCallback(
    (body: ICreateExpenseDto) => {
      return post(routes.expenses.add, body);
    },
    [post],
  );
  return [callback];
};

export const useGetExpense = (): [
  (id: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (id: number) => {
      return get(routes.expenses.get(id));
    },
    [get],
  );
  return [callback];
};

export const useGetMonthly = (): [
  (month: number, year: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (month: number, year: number) => {
      return get(routes.expenses.monthly(month, year));
    },
    [get],
  );
  return [callback];
};

export const useGetSingleType = (): [
  (
    month: number,
    year: number,
    categoryId: number,
  ) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (month: number, year: number, categoryId: number) => {
      const params = new URLSearchParams();
      params.append('categoryId', categoryId.toString());
      return get(routes.expenses.singleType(month, year), params);
    },
    [get],
  );
  return [callback];
};

export const useGetYearly = (): [
  (year: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (year: number) => {
      return get(routes.expenses.yearly(year));
    },
    [get],
  );
  return [callback];
};

export const useGetSingleTypeYear = (): [
  (year: number, categoryId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (year: number, categoryId: number) => {
      const params = new URLSearchParams();
      params.append('year', year.toString());
      params.append('categoryId', categoryId.toString());
      return get(routes.expenses.singleTypeYear, params);
    },
    [get],
  );
  return [callback];
};

export const useGetTotalSpent = (): [
  (year: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (year: number) => {
      const params = new URLSearchParams();
      params.append('year', year.toString());
      return get(routes.expenses.totalSpent, params);
    },
    [get],
  );
  return [callback];
};

export const usePostModify = (): [
  (body: IExpense) => Promise<AxiosResponse | undefined>,
] => {
  const { post } = useApi();
  const callback = useCallback(
    (body: IExpense) => {
      return post(routes.expenses.modify, body);
    },
    [post],
  );
  return [callback];
};

export const useGetTotalSpentMonthly = (): [
  (month: number, year: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (month: number, year: number) => {
      const params = new URLSearchParams();
      params.append('month', month.toString());
      params.append('year', year.toString());
      return get(routes.expenses.totalSpentMonthly, params);
    },
    [get],
  );
  return [callback];
};

export const useGetTotalSpentMonthlyCategory = (): [
  (
    month: number,
    year: number,
    category: number,
  ) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (month: number, year: number, category: number) => {
      const params = new URLSearchParams();
      params.append('month', month.toString());
      params.append('year', year.toString());
      params.append('category', category.toString());
      return get(routes.expenses.totalSpentMonthlyCategory, params);
    },
    [get],
  );
  return [callback];
};

export const useDeleteExpense = (): [
  (expenseId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { Delete } = useApi();
  const callback = useCallback(
    (expenseId: number) => {
      const params = new URLSearchParams();
      params.append('expenseId', expenseId.toString());
      return Delete(routes.expenses.delete, undefined, params);
    },
    [Delete],
  );
  return [callback];
};

export const useCompareCategories = (): [
  (
    currentPeriodType: string,
    currentPeriodValue: number,
    previousPeriodType: string,
    previousPeriodValue: number,
    currentYear?: number,
    previousYear?: number,
  ) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (
      currentPeriodType: string,
      currentPeriodValue: number,
      previousPeriodType: string,
      previousPeriodValue: number,
      currentYear?: number,
      previousYear?: number,
    ) => {
      const params = new URLSearchParams();
      params.append('currentPeriodType', currentPeriodType);
      params.append('currentPeriodValue', currentPeriodValue.toString());
      params.append('previousPeriodType', previousPeriodType);
      params.append('previousPeriodValue', previousPeriodValue.toString());

      if (currentYear !== undefined) {
        params.append('currentYear', currentYear.toString());
      }

      if (previousYear !== undefined) {
        params.append('previousYear', previousYear.toString());
      }

      return get(routes.expenses.compare, params);
    },
    [get],
  );
  return [callback];
};

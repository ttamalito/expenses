import {
  ICreateExpenseCategoryDto,
  ICreateIncomeCategoryDto,
  IMigrateCategoryDto,
} from '@clients';
import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import useApi from './useApi.ts';
import { routes } from '@apiRoutes';

export const useGetExpenseCategory = (): [
  (categoryId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (categoryId: number) => {
      return get(routes.category.expenseGet(categoryId));
    },
    [get],
  );
  return [callback];
};

export const usePutExpenseCreate = (): [
  (body: ICreateExpenseCategoryDto) => Promise<AxiosResponse | undefined>,
] => {
  const { put } = useApi();
  const callback = useCallback(
    (body: ICreateExpenseCategoryDto) => {
      return put(routes.category.expenseCreate, body);
    },
    [put],
  );
  return [callback];
};

export const useDeleteExpenseCategory = (): [
  (categoryId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { Delete } = useApi();
  const callback = useCallback(
    (categoryId: number) => {
      return Delete(routes.category.expenseDelete(categoryId));
    },
    [Delete],
  );
  return [callback];
};

export const useGetIncomeCategory = (): [
  (categoryId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (categoryId: number) => {
      return get(routes.category.incomeGet(categoryId));
    },
    [get],
  );
  return [callback];
};

export const usePutIncomeCreate = (): [
  (body: ICreateIncomeCategoryDto) => Promise<AxiosResponse | undefined>,
] => {
  const { put } = useApi();
  const callback = useCallback(
    (body: ICreateIncomeCategoryDto) => {
      return put(routes.category.incomeCreate, body);
    },
    [put],
  );
  return [callback];
};

export const useDeleteIncomeCategory = (): [
  (categoryId: number) => Promise<AxiosResponse | undefined>,
] => {
  const { Delete } = useApi();
  const callback = useCallback(
    (categoryId: number) => {
      return Delete(routes.category.incomeDelete(categoryId));
    },
    [Delete],
  );
  return [callback];
};

export const useGetAllExpenseCategories = (): [
  () => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(() => {
    return get(routes.category.expenseAll);
  }, [get]);
  return [callback];
};

export const useGetAllIncomeCategories = (): [
  () => Promise<AxiosResponse | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(() => {
    return get(routes.category.incomeAll);
  }, [get]);
  return [callback];
};

export const useMigrateCategory = (): [
  (body: IMigrateCategoryDto) => Promise<AxiosResponse | undefined>,
] => {
  const { post } = useApi();
  const callback = useCallback(
    (body: IMigrateCategoryDto) => {
      return post(routes.category.migrate, body);
    },
    [post],
  );
  return [callback];
};

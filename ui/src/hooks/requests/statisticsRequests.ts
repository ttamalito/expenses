import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import useApi from './useApi.ts';
import { routes } from '../../routes/apiRoutes.ts';
import { StatisticalSummaryDto } from '@clients';

/**
 * Hook for fetching statistical summaries
 * @returns A function that fetches statistical summaries
 */
export const useGetStatisticalSummary = (): [
  () => Promise<AxiosResponse<StatisticalSummaryDto> | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(() => {
    return get(routes.statistics.summary) as Promise<
      AxiosResponse<StatisticalSummaryDto> | undefined
    >;
  }, [get]);
  return [callback];
};

import { useCallback } from 'react';
import { AxiosResponse } from 'axios';
import useApi from '@requests/useApi.ts';
import { routes } from '@apiRoutes';
import { ICreateTagDto, IGetTagDto, IUpdateTagDto } from '@clients';

/**
 * Hook for fetching all tags for a user
 * @returns
 */
export const useGetTagsForUser = (): [
  () => Promise<AxiosResponse<IGetTagDto[]> | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(() => {
    return get(routes.tags.allForUser) as Promise<
      AxiosResponse<IGetTagDto[]> | undefined
    >;
  }, [get]);
  return [callback];
};

export const useGetTagById = (): [
  (tagId: number) => Promise<AxiosResponse<IGetTagDto> | undefined>,
] => {
  const { get } = useApi();
  const callback = useCallback(
    (tagId: number) => {
      return get(routes.tags.getTagById(tagId)) as Promise<
        AxiosResponse<IGetTagDto> | undefined
      >;
    },
    [get],
  );
  return [callback];
};

export const usePostCreateTag = (): [
  (tag: ICreateTagDto) => Promise<AxiosResponse<IGetTagDto> | undefined>,
] => {
  const { post } = useApi();
  const callback = useCallback(
    (tag: ICreateTagDto) => {
      return post(routes.tags.create, tag) as Promise<
        AxiosResponse<IGetTagDto> | undefined
      >;
    },
    [post],
  );
  return [callback];
};

export const usePutUpdateTag = (): [
  (
    tagId: number,
    tag: IUpdateTagDto,
  ) => Promise<AxiosResponse<void> | undefined>,
] => {
  const { put } = useApi();
  const callback = useCallback(
    (tagId: number, tag: IUpdateTagDto) => {
      return put(routes.tags.update(tagId), tag) as Promise<
        AxiosResponse<void> | undefined
      >;
    },
    [put],
  );
  return [callback];
};

export const useDeleteTagById = (): [
  (tagId: number) => Promise<AxiosResponse<void> | undefined>,
] => {
  const { Delete } = useApi();
  const callback = useCallback(
    (tagId: number) => {
      return Delete(routes.tags.delete(tagId)) as Promise<
        AxiosResponse<void> | undefined
      >;
    },
    [Delete],
  );
  return [callback];
};

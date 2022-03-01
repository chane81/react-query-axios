import { AxiosRequestConfig } from 'axios';
import { useRef } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { baseFetcher } from '~/utils/fetcher';

export type TQueryConfig<Res = any, Req = any> =
  | Omit<
      UseQueryOptions<Res | undefined, Error, Res, string | TQueryKey<Req>>,
      'queryKey' | 'queryFn'
    >
  | undefined;

/**
 * hooks config
 * axiosConfig: axios config
 * queryConfig: react query config
 */
export interface IConfig<T, RESULT = any> {
  axiosConfig?: AxiosRequestConfig;
  queryConfig?: T;
  baseURL?: string;
  callback?: (result: UseQueryResult<RESULT, Error>) => void;
}

/** react query key type */
export type TQueryKey<T> = (string | T | Record<string, any>)[];

/** select 성격(Method: GET) base api hooks */
const useBaseQuery = <Res, Req = undefined>(
  key: TQueryKey<Req> | string,
  config?: IConfig<TQueryConfig<Res, Req>, Res>,
) => {
  // [url, parameters] 형태로 넘어왔는지 여부
  const isKeyArray = Array.isArray(key);

  // error 처리
  const error = useRef(undefined);
  const isError = useRef(false);

  // fetcher
  const apiFetcher = baseFetcher(
    config?.baseURL,
    () => {},
    (ex: any) => {
      error.current = ex;
      isError.current = true;
    },
  );

  // url, params
  const url = (isKeyArray ? key[0] : key) as string;
  const params = (isKeyArray && key.length > 1 ? key[1] : undefined) as Req;

  // react-query 실행
  const result = useQuery(
    key,
    async ({ signal }) => {
      return apiFetcher<Res, Req>({
        url,
        params,
        config: config?.axiosConfig,
        signal,
      });
    },
    config?.queryConfig,
  ) as UseQueryResult<Res, Error>;

  // callback - query result 전달
  config?.callback?.(result);

  return {
    ...result,
    error: error.current,
    isError: isError.current,
  };
};

export { useBaseQuery };

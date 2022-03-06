import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import axiosHttpAdapt from 'axios/lib/adapters/http';
import nockMock from 'nock';

// import { useQueryClient } from 'react-query';
import { queryClient, wrapper } from '~/src/__test__/utils';
import { useBaseQuery } from '~/src/useQuery';

interface IReqTodos {
  userId: number;
}

export interface IResTodos {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

const BASE_URL = 'https://koreanjson.com';
const GET_URL = '/todos/1';

describe('useBaseQuery each fetch', () => {
  let nock: nockMock.Scope;

  beforeAll(async () => {
    axios.defaults.adapter = axiosHttpAdapt;

    nock = nockMock(BASE_URL);
  });

  it('should useBaseQuery success', async () => {
    const GET_RES_DATA = {
      UserId: 1,
      completed: true,
    };

    // mock api
    nock.get(GET_URL).reply(200, GET_RES_DATA);

    // call query
    const { result, waitFor } = renderHook(
      () =>
        useBaseQuery<IResTodos, IReqTodos>(GET_URL, {
          baseURL: BASE_URL,
        }),
      {
        wrapper,
      },
    );

    // isLoading test
    expect(result.current.isLoading).toBeTruthy();

    // isFetching test
    expect(result.current.isFetching).toBeTruthy();

    await waitFor(() => {
      return result.current.isFetched;
    });

    // data equal test
    expect(result.current.data).toEqual(GET_RES_DATA);

    // react-query current cache clean
    result.current.remove();
  });

  it('should useBaseQuery error', async () => {
    // mock api
    nock.get(GET_URL).reply(500);

    // call query
    const { result, waitFor } = renderHook(
      () =>
        useBaseQuery<IResTodos, IReqTodos>(GET_URL, {
          baseURL: BASE_URL,
        }),
      {
        wrapper,
      },
    );

    // isLoading test
    expect(result.current.isLoading).toBeTruthy();

    // isFetching test
    expect(result.current.isFetching).toBeTruthy();

    await waitFor(() => {
      return result.current.isFetched;
    });

    // data equal test
    expect(result.current.isError).toBeTruthy();

    // react-query current cache clean
    result.current.remove();
  });

  it('should useBaseQuery param query success', async () => {
    const GET_RES_DATA = {
      UserId: 1,
      completed: true,
    };
    const GET_URL_PARAMS = {
      userId: 1,
    };
    const onSuccessMock = jest.fn();

    // mock api
    nock.get(GET_URL).query(GET_URL_PARAMS).reply(200, GET_RES_DATA);

    // call query
    const { result, waitFor } = renderHook(
      () =>
        useBaseQuery<IResTodos, IReqTodos>([GET_URL, GET_URL_PARAMS], {
          baseURL: BASE_URL,
          queryConfig: {
            onSuccess: () => onSuccessMock(GET_URL_PARAMS),
          },
        }),
      {
        wrapper,
      },
    );

    // isLoading test
    expect(result.current.isLoading).toBeTruthy();

    // isFetching test
    expect(result.current.isFetching).toBeTruthy();

    await waitFor(() => {
      return result.current.isFetched;
    });

    // call time test
    expect(onSuccessMock).toHaveBeenCalledTimes(1);

    // query params test
    expect(onSuccessMock).toHaveBeenCalledWith(GET_URL_PARAMS);

    // data equal test
    expect(result.current.data).toEqual(GET_RES_DATA);

    // react-query current cache clean
    result.current.remove();
  });

  it('should useBaseQuery cancel success', async () => {
    const GET_RES_DATA = {
      UserId: 1,
      completed: true,
    };
    const onErrorMock = jest.fn();

    // mock api
    nock.get(GET_URL).delay(2000).reply(500, GET_RES_DATA);

    // call query
    const { result, waitFor } = renderHook(
      () =>
        useBaseQuery<IResTodos, IReqTodos>(GET_URL, {
          baseURL: BASE_URL,
          queryConfig: {
            onError: (err) => onErrorMock(err),
          },
        }),
      {
        wrapper,
      },
    );

    // isLoading test
    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => {
      if (result.current.isLoading) {
        queryClient.cancelQueries(GET_URL);
      }

      return !result.current.isLoading;
    });

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith({ message: 'canceled' });
    expect(result.current.isError).toBeFalsy();

    // react-query current cache clean
    result.current.remove();
  });

  // 모든 테스트가 끝난뒤 모든 mock 를 clear 처리
  afterAll(() => {
    jest.clearAllMocks();

    nockMock.cleanAll();
  });
});

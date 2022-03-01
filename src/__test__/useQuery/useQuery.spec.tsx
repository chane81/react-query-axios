import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryCache, QueryClient } from 'react-query';
import { QueryClientProvider } from 'react-query';

import { wrapper } from '~/src/__test__/utils';
import { useBaseQuery } from '~/src/useQuery';

import { TODO_ONE } from './todos.mock';

class Test {
  name: string;
  constructor(value: string) {
    this.name = value;
  }
}

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

describe('useBaseQuery', () => {
  it('fetch success', async () => {
    const fetchData = (name: string) => Promise.resolve(new Test(name));
    const onSuccess = () => console.log('called');
    const onSuccessMock = jest.fn(() => onSuccess);

    const { result, waitFor } = renderHook(
      () =>
        useBaseQuery<IResTodos, IReqTodos>(
          [
            '/todos/1',
            // {
            //   userId: 1,
            // },
          ],
          {
            baseURL: 'https://koreanjson.com',
          },
        ),
      {
        wrapper,
      },
    );

    // loading test
    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => {
      return result.current.isSuccess;
    });

    // data equal test
    expect(result.current.data).toEqual(TODO_ONE);
  });
});

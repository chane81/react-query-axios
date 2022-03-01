import axios, { AxiosRequestConfig } from 'axios';

export interface IFetcherArgs<Req> {
  url: string;
  params?: Req | void;
  config?: AxiosRequestConfig;
  signal?: AbortSignal;
}

/** 기본 axios fetch 함수 */
const baseFetcher =
  (
    baseURL?: string,
    callback?: (result: any) => void,
    errorCallback?: (ex: any, config?: AxiosRequestConfig) => void,
  ) =>
  async <Res = any, Req = any>(args: IFetcherArgs<Req>) => {
    const { url, params, config, signal } = args;

    const isGetMethod =
      !config || !config.method || config?.method?.toUpperCase() === 'GET';

    try {
      const { data: resData } = await axios.request<Res>({
        // base url
        baseURL: baseURL || axios.defaults.baseURL,

        // url
        url,

        // set method
        method: isGetMethod ? 'GET' : config?.method,

        // GET 방식이면 params 로 paramData 값 넘기고 그외에는 data 로 paramData 넘김
        ...(isGetMethod ? { params } : { data: params }),

        signal,

        // axios config
        ...config,
      });

      // 마지막 api 호출 시간을 쿠키로 저장
      // 마지막 호출 시간으로 부터 9시간이 지나면 자동 로그아웃을 위한 쿠키
      // jsCookie.set(LAST_API_TIME, new Date(), COOKIE_OPTIONS);
      callback?.(resData);

      return resData;
    } catch (ex: any) {
      if (axios.isCancel(ex)) {
        console.info('[CANCEL] fetcher api', ex.message);
      } else {
        console.error('[ERROR] fetcher api call', ex.message);
      }

      // 에러발생시 콜백 - 윗단으로 throw error시 쓰일 수 있음
      errorCallback?.(ex, config);

      return;
    }
  };

export { baseFetcher };

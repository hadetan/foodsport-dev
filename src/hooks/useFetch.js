import { useEffect } from 'react';
import useApi from './useApi';

export default function useFetch(config, deps = []) {
  const { request, loading, error, data } = useApi();

  useEffect(() => {
    request(config);
    // eslint-disable-next-line
  }, deps);

  return { loading, error, data };
}

import useApi from './useApi';

export default function useMutation() {
  const { request, loading, error, data } = useApi();

  const mutate = async (config) => {
    return await request(config);
  };

  return { mutate, loading, error, data };
}

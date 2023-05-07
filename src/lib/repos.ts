import useSWR from 'swr';
import { useUser } from './user';
import { GetRepos } from '@/pages/api/repos';
import { api } from '@/utils/apiClient';
import { REPOS } from '@/utils/cacheKeys';

export function useRepos() {
  const { loggedIn } = useUser();

  const { data, isLoading } = useSWR([loggedIn, REPOS], () => api<GetRepos>('GET', '/repos'));

  return {
    isLoading,
    repos: data || [],
  };
}

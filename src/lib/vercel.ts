import useSWR from 'swr';
import { useUser } from './user';
import type { GetVercelProjects } from '@/entities/VercelIntegration';
import { api } from '@/utils/apiClient';
import { VERCEL } from '@/utils/cacheKeys';

export function useVercel() {
  const { loggedIn } = useUser();

  const { data, error, isLoading } = useSWR([loggedIn, VERCEL], () =>
    api<GetVercelProjects>('GET', '/vercel/projects')
  );

  return {
    error,
    isLoading,
    projects: data || [],
  };
}

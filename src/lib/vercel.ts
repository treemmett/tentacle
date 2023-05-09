import useSWR from 'swr';
import { useUser } from './user';
import type { GetVercelProjects } from '@/entities/VercelIntegration';
import { api } from '@/utils/apiClient';
import { VERCEL } from '@/utils/cacheKeys';
import { APIError } from '@/utils/errors';

export function useVercel() {
  const { user } = useUser();

  const { data, error, isLoading } = useSWR<
    GetVercelProjects,
    APIError,
    () => [string, typeof VERCEL] | null
  >(
    () => (user ? [user.id, VERCEL] : null),
    () => api<GetVercelProjects>('GET', '/vercel/projects')
  );

  return {
    error,
    isLoading,
    projects: data || [],
  };
}

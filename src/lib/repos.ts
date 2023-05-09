import useSWR from 'swr';
import { useUser } from './user';
import { GetRepoWorkflows } from '@/pages/api/repo/[owner]/[repo]';
import { GetRepos } from '@/pages/api/repos';
import { api } from '@/utils/apiClient';
import { REPOS } from '@/utils/cacheKeys';

export function useRepos() {
  const { user } = useUser();

  const { data, isLoading } = useSWR(
    () => (user ? [user.id, REPOS] : null),
    () => api<GetRepos>('GET', '/repos')
  );

  return {
    isLoading,
    repos: data || [],
  };
}

export function useRepo(owner: string, repo: string) {
  const { user } = useUser();

  const { data, isLoading } = useSWR([user, REPOS, owner, repo], () =>
    api<GetRepoWorkflows>('GET', `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
  );

  return {
    isLoading,
    workflows: data || [],
  };
}

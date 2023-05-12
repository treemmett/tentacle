import { useCallback } from 'react';
import useSWR from 'swr';
import { TriggerType } from './triggerType';
import { useUser } from './user';
import type { HookDTO } from '@/entities/Hook';
import type { GetTriggers } from '@/pages/api/triggers';
import { api } from '@/utils/apiClient';
import { TRIGGERS } from '@/utils/cacheKeys';

export function useTriggers() {
  const { user } = useUser();

  const { data, error, isLoading, mutate } = useSWR(
    () => (user ? [user.id, TRIGGERS] : null),
    () => api<GetTriggers>('GET', '/triggers')
  );

  const createTrigger = useCallback(
    async (type: TriggerType, externalId: string, hooks: Omit<HookDTO, 'id'>[]) => {
      await mutate(() => api('POST', '/triggers', { externalId, hooks, type }), {
        populateCache: false,
      });
    },
    [mutate]
  );

  return {
    createTrigger,
    error,
    isLoading,
    triggers: data || [],
  };
}

import { useCallback } from 'react';
import useSWR from 'swr';
import { TriggerType } from './triggerType';
import { useUser } from './user';
import type { GetTriggers } from '@/pages/api/triggers';
import { api } from '@/utils/apiClient';
import { TRIGGERS } from '@/utils/cacheKeys';

export function useTriggers() {
  const { loggedIn } = useUser();

  const { data, error, isLoading, mutate } = useSWR([loggedIn, TRIGGERS], () =>
    api<GetTriggers>('GET', '/triggers')
  );

  const createTrigger = useCallback(
    async (type: TriggerType, externalId: string, blocking?: boolean) => {
      await mutate(() => api('POST', '/triggers', { blocking, externalId, type }), {
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

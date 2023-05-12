import {
  Accordion,
  Box,
  Button,
  Center,
  Code,
  Flex,
  Group,
  Loader,
  Modal,
  Paper,
  Skeleton,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconBrandVercel, IconShieldCheck } from '@tabler/icons-react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { FC, useMemo, useState } from 'react';
import type { Trigger as TriggerDTO } from '@/entities/Trigger';
import { hookIcon, hookName } from '@/lib/hook';
import { TriggerType } from '@/lib/triggerType';
import { useTriggers } from '@/lib/triggers';
import { useVercel } from '@/lib/vercel';

const DynamicTriggerForm = dynamic(
  () => import('@/components/TriggerForm').then((m) => m.TriggerForm),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);

const Trigger: FC<{ trigger: TriggerDTO }> = ({ trigger }) => {
  const { projects, isLoading } = useVercel();

  const name = useMemo(
    () => projects.find((p) => p.id === trigger.externalId)?.name,
    [projects, trigger.externalId]
  );

  let type = '';
  let icon: JSX.Element | null = null;
  if (trigger.type === TriggerType.vercel_deployment) {
    type = 'Vercel Deployment';
    icon = <IconBrandVercel stroke={3} />;
  }

  return (
    <Accordion.Item value={trigger.id}>
      <Accordion.Control>
        <Group>
          {icon}
          <Text>{type}</Text>
          {(name || isLoading) && (
            <Skeleton display="inline-block" visible={isLoading} w={50}>
              <Code>{name}</Code>
            </Skeleton>
          )}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        {trigger.hooks.map((h) => (
          <Paper key={h.id} mt="lg" pl="xl" py="md" withBorder>
            <Flex>
              <Flex align="center" justify="center" mr="lg">
                {hookIcon(h.type)}
              </Flex>
              <Text>{hookName(h.type)}</Text>
              {h.blocking && (
                <Tooltip label="Blocks supported triggers until success">
                  <ThemeIcon
                    aria-label="Blocks supported triggers until success"
                    color="green"
                    ml="lg"
                    sx={{ cursor: 'help' }}
                    variant="light"
                  >
                    <IconShieldCheck size="1rem" stroke={2} />
                  </ThemeIcon>
                </Tooltip>
              )}
            </Flex>
          </Paper>
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const Triggers: NextPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { triggers, isLoading } = useTriggers();

  return (
    <>
      <Group mb="lg">
        <Button onClick={() => setShowForm(true)}>New Trigger</Button>
      </Group>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="New Trigger" opened>
          <DynamicTriggerForm onClose={() => setShowForm(false)} />
        </Modal>
      )}

      {isLoading ? (
        new Array(4).fill(null).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} mb="xl" visible>
            <Box h="lg" />
          </Skeleton>
        ))
      ) : (
        <Accordion>
          {triggers.map((t) => (
            <Trigger key={t.id} trigger={t} />
          ))}
        </Accordion>
      )}
    </>
  );
};

export default Triggers;

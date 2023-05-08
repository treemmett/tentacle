import { Accordion, Box, Button, Center, Code, Group, Loader, Modal, Text } from '@mantine/core';
import { IconBrandVercel } from '@tabler/icons-react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { FC, useMemo, useState } from 'react';
import type { Trigger as TriggerDTO } from '@/entities/Trigger';
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
  const { projects } = useVercel();

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
          {name && <Code>{name}</Code>}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Box>a</Box>
        <Box>b</Box>
        <Box>c</Box>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const Triggers: NextPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { triggers } = useTriggers();

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

      <Accordion>
        {triggers.map((t) => (
          <Trigger key={t.id} trigger={t} />
        ))}
      </Accordion>
    </>
  );
};

export default Triggers;

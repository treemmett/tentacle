import {
  ActionIcon,
  Box,
  Button,
  Center,
  Chip,
  Flex,
  Group,
  Loader,
  ModalProps,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconBrandGithub, IconBrandVercel, IconTrash, IconWebhook } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { FC, forwardRef, useState } from 'react';
import type { HookDTO } from '@/entities/Hook';
import { HookType } from '@/lib/hookType';
import { TriggerType } from '@/lib/triggerType';
import { useTriggers } from '@/lib/triggers';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  icon: JSX.Element;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ icon, label, ...props }: ItemProps, ref) => (
    <Group ref={ref} spacing="sm" {...props}>
      {icon}
      <Text>{label}</Text>
    </Group>
  )
);

SelectItem.displayName = 'SelectItem';

const DynamicVercelIntegrationForm = dynamic(
  () => import('./VercelIntegrationForm').then((m) => m.VercelIntegrationForm),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);

export interface TriggerFormValues {
  type: TriggerType;
  vercel: {
    project: string;
  };
  hooks: {
    blocking: boolean;
    id: string;
    type: HookType;
  }[];
}

const HookForm: FC<{
  disabled?: boolean;
  form: UseFormReturnType<TriggerFormValues>;
  index: number;
}> = ({ disabled, form, index }) => {
  const githubIcon = <IconBrandGithub size="1rem" stroke={2} />;
  const webhookIcon = <IconWebhook size="1rem" stroke={2} />;

  let icon: JSX.Element | null = null;
  switch (form.values.hooks[index].type) {
    case HookType.github_action:
      icon = githubIcon;
      break;
    case HookType.webhook:
      icon = webhookIcon;
      break;
    default:
      break;
  }

  return (
    <Paper p="md" withBorder>
      <Stack>
        <Select
          data={[
            {
              icon: githubIcon,
              label: 'GitHub Action',
              value: HookType.github_action,
            },
            {
              icon: webhookIcon,
              label: 'Webhook',
              value: HookType.webhook,
            },
          ]}
          disabled={disabled}
          icon={icon}
          itemComponent={SelectItem}
          label="Type"
          withinPortal
          {...form.getInputProps(`hooks.${index}.type`)}
        />

        <Flex justify="space-between">
          <Chip disabled={disabled} {...form.getInputProps(`hooks.${index}.blocking`)}>
            Blocking
          </Chip>
          {form.values.hooks.length > 1 && (
            <ActionIcon
              color="red"
              disabled={disabled}
              onClick={() => form.removeListItem('hooks', index)}
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          )}
        </Flex>
      </Stack>
    </Paper>
  );
};

export const TriggerForm: FC<Pick<ModalProps, 'onClose'>> = ({ onClose }) => {
  const { createTrigger } = useTriggers();

  const form = useForm<TriggerFormValues>({
    initialValues: {
      hooks: [
        {
          blocking: false,
          id: randomId(),
          type: '' as HookType,
        } as HookDTO,
      ],
      type: '' as TriggerType,
      vercel: {
        project: '',
      },
    },
    // validate: {
    //   hooks: {
    //     type: (value) => {
    //       if (!value) return 'Hook type is required';
    //       return null;
    //     },
    //   },
    //   type: (value) => {
    //     if (!value) return 'Trigger type is required';
    //     return null;
    //   },
    //   vercel: {
    //     project: (value, values) => {
    //       if (values.type !== TriggerType.vercel_deployment) return null;
    //       if (!value) return 'Project is required';
    //       return null;
    //     },
    //   },
    // },
  });

  const vercelIcon = <IconBrandVercel size="1rem" stroke={2} />;

  let icon: JSX.Element | null = null;
  switch (form.values.type) {
    case TriggerType.vercel_deployment:
      icon = vercelIcon;
      break;
    default:
      break;
  }

  const [submitting, setSubmitting] = useState(false);

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(async (v) => {
        try {
          setSubmitting(true);
          if (v.type === TriggerType.vercel_deployment) {
            await createTrigger(
              v.type,
              v.vercel.project,
              v.hooks.map(({ blocking, type }) => ({ blocking, type } as Omit<HookDTO, 'id'>))
            );
          }

          onClose();
        } finally {
          setSubmitting(false);
        }
      })}
    >
      <Stack>
        <Select
          data={[
            {
              icon: vercelIcon,
              label: 'Vercel Deployment',
              value: TriggerType.vercel_deployment,
            },
          ]}
          disabled={submitting}
          icon={icon}
          itemComponent={SelectItem}
          label="Trigger"
          withinPortal
          {...form.getInputProps('type')}
        />

        {form.values.type === TriggerType.vercel_deployment && (
          <DynamicVercelIntegrationForm disabled={submitting} form={form} />
        )}

        <Text mb="-md">Hooks</Text>
        {form.values.hooks.map((h, i) => (
          <HookForm disabled={submitting} form={form} index={i} key={h.id} />
        ))}

        <Button
          disabled={submitting}
          onClick={() => form.insertListItem('hooks', { id: randomId(), type: '' })}
          variant="outline"
        >
          Add hook
        </Button>

        <Button disabled={submitting} loading={submitting} type="submit">
          Save
        </Button>
      </Stack>
    </Box>
  );
};

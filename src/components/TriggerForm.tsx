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
import { IconBrandVercel, IconTrash } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { FC, forwardRef, useState } from 'react';
import type { HookDTO } from '@/entities/Hook';
import { hookIcon, hookName } from '@/lib/hook';
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

const DynamicGithubForm = dynamic(
  () => import('./GithubActionHookForm').then((m) => m.GithubActionHookForm),
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
  hooks: HookDTO[];
}

const HookForm: FC<{
  disabled?: boolean;
  form: UseFormReturnType<TriggerFormValues>;
  index: number;
}> = ({ disabled, form, index }) => (
  <Paper p="md" withBorder>
    <Stack>
      <Select
        data={[
          {
            icon: hookIcon(HookType.github_action),
            label: hookName(HookType.github_action),
            value: HookType.github_action,
          },
          {
            icon: hookIcon(HookType.webhook),
            label: hookName(HookType.webhook),
            value: HookType.webhook,
          },
        ]}
        disabled={disabled}
        icon={hookIcon(form.values.hooks[index].type)}
        itemComponent={SelectItem}
        label="Type"
        withinPortal
        {...form.getInputProps(`hooks.${index}.type`)}
      />

      {form.values.hooks[index].type === HookType.github_action && (
        <DynamicGithubForm disabled={disabled} form={form} index={index} />
      )}

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

export const TriggerForm: FC<Pick<ModalProps, 'onClose'>> = ({ onClose }) => {
  const { createTrigger } = useTriggers();

  const form = useForm<TriggerFormValues>({
    initialValues: {
      hooks: [
        {
          blocking: false,
          id: randomId(),
          repository: '',
          type: '' as HookType,
        } as HookDTO,
      ],
      type: '' as TriggerType,
      vercel: {
        project: '',
      },
    },
    validate: {
      hooks: {
        repository: (value, values, path) => {
          const hookIndex = parseInt(path.split('.')[1], 10);
          if (values.hooks[hookIndex].type === HookType.github_action) {
            if (!value) return 'Repository is required';
          }
          return null;
        },
        type: (value) => {
          if (!value) return 'Hook type is required';
          return null;
        },
        workflow: (value, values, path) => {
          const hookIndex = parseInt(path.split('.')[1], 10);
          if (values.hooks[hookIndex].type === HookType.github_action) {
            if (!value) return 'Workflow is required';
          }
          return null;
        },
      },
      type: (value) => {
        if (!value) return 'Trigger type is required';
        return null;
      },
      vercel: {
        project: (value, values) => {
          if (values.type !== TriggerType.vercel_deployment) return null;
          if (!value) return 'Project is required';
          return null;
        },
      },
    },
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
            await createTrigger(v.type, v.vercel.project, v.hooks);
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

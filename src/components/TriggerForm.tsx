import { Box, Button, Center, Group, Loader, ModalProps, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandVercel } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { FC, forwardRef } from 'react';
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
  type: TriggerType | '';
  vercel: {
    project: string;
    blocking: boolean;
  };
}

export const TriggerForm: FC<Pick<ModalProps, 'onClose'>> = ({ onClose }) => {
  const { createTrigger } = useTriggers();

  const form = useForm<TriggerFormValues>({
    initialValues: {
      type: '',
      vercel: {
        blocking: false,
        project: '',
      },
    },
    validate: {
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

  const vercelIcon = <IconBrandVercel size="1rem" stroke={3} />;

  let icon: JSX.Element | null = null;
  switch (form.values.type) {
    case TriggerType.vercel_deployment:
      icon = vercelIcon;
      break;
    default:
      break;
  }

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(async (v) => {
        if (v.type === TriggerType.vercel_deployment) {
          await createTrigger(v.type, v.vercel.project, v.vercel.blocking);
        }

        onClose();
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
          icon={icon}
          itemComponent={SelectItem}
          label="Trigger"
          withinPortal
          {...form.getInputProps('type')}
        />
        {form.values.type === TriggerType.vercel_deployment && (
          <DynamicVercelIntegrationForm form={form} />
        )}
        <Button type="submit">Save</Button>
      </Stack>
    </Box>
  );
};

import { Badge, Center, Code, Group, Loader, Select, Stack, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FC, forwardRef } from 'react';
import type { TriggerFormValues } from './TriggerForm';
import { useRepo, useRepos } from '@/lib/repos';

const WorkflowItem = forwardRef<
  HTMLDivElement,
  { error?: string; label: string; disabled: boolean }
>(({ error, label, disabled, ...props }, ref) => {
  if (disabled) {
    return (
      <Group ref={ref} spacing="sm" {...props}>
        <Text>{label}</Text>
        {error ? (
          <Badge color="red" ml="auto" size="sm">
            {error}
          </Badge>
        ) : (
          <Badge color="gray" ml="auto" size="sm">
            <Text inherit>
              Missing{' '}
              <Code color="gray" sx={{ fontSize: '0.6rem' }}>
                repository_dispatch
              </Code>{' '}
              trigger.
            </Text>
          </Badge>
        )}
      </Group>
    );
  }

  return (
    <Group ref={ref} spacing="sm" {...props}>
      <Text>{label}</Text>
    </Group>
  );
});

WorkflowItem.displayName = 'WorkflowItem';

export const GithubActionHookForm: FC<{
  disabled?: boolean;
  form: UseFormReturnType<TriggerFormValues>;
  index: number;
}> = ({ disabled, form, index }) => {
  const { repos, isLoading } = useRepos();
  const { workflows, isLoading: repoLoading } = useRepo(
    ...((form.values.hooks[index]?.repository?.split('/') || '') as [string, string])
  );

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <Stack>
      <Select
        data={repos}
        disabled={disabled}
        label="Repo"
        searchable
        withinPortal
        {...form.getInputProps(`hooks.${index}.repository`)}
        onChange={(v) => {
          form.setFieldValue(`hooks.${index}.repository`, v);
          form.setFieldValue(`hooks.${index}.workflow`, '');
        }}
      />
      <Select
        data={workflows.map((w) => ({
          disabled: !w.supported,
          error: w.error,
          label: w.name,
          value: w.name,
        }))}
        disabled={disabled || !form.values.hooks[index].repository}
        icon={repoLoading && <Loader size="xs" />}
        itemComponent={WorkflowItem}
        label="Workflow"
        nothingFound="No workflows :("
        searchable
        withinPortal
        {...form.getInputProps(`hooks.${index}.workflow`)}
      />
    </Stack>
  );
};

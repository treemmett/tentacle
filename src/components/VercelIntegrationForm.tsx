import { Center, Checkbox, Loader, Select, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FC } from 'react';
import type { TriggerFormValues } from './TriggerForm';
import { useVercel } from '@/lib/vercel';

export const VercelIntegrationForm: FC<{ form: UseFormReturnType<TriggerFormValues> }> = ({
  form,
}) => {
  const { error, isLoading, projects } = useVercel();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return <Text color="red">Communication with Vercel failed.</Text>;
  }

  return (
    <>
      <Select
        data={projects.map((p) => ({ label: p.name, value: p.id }))}
        label="Project"
        withinPortal
        {...form.getInputProps('vercel.project')}
      />
      <Checkbox
        label="Block production promotion if hooks fail"
        {...form.getInputProps('vercel.blocking')}
      />
    </>
  );
};

import { Button, Center, Checkbox, Loader, Select, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconBrandVercel } from '@tabler/icons-react';
import { FC } from 'react';
import type { TriggerFormValues } from './TriggerForm';
import { useVercel } from '@/lib/vercel';
import { IntegrationNotFoundError } from '@/utils/errors';

export const VercelIntegrationForm: FC<{ form: UseFormReturnType<TriggerFormValues> }> = ({
  form,
}) => {
  const { error, isLoading, projects } = useVercel();

  if (error instanceof IntegrationNotFoundError) {
    return (
      <Button
        component="a"
        href="https://vercel.com/integrations/tentacle/new"
        rel="noreferrer noopener"
        target="_blank"
        type="button"
        variant="outline"
        w="100%"
      >
        <IconBrandVercel stroke={2} />
        <Text ml="sm">Login with Vercel</Text>
      </Button>
    );
  }

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

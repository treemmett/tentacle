import { Box, Button, Group, Text, Title } from '@mantine/core';
import { IconBrandVercel } from '@tabler/icons-react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '@/utils/apiClient';

const Workflow: NextPage = () => {
  const { query } = useRouter();
  const { owner, repo, workflow } = query as Record<string, string>;

  return (
    <>
      <Box mb="lg">
        <Title order={3}>
          {query.owner}/{query.repo} - {query.workflow}
        </Title>

        <Text
          color="blue.5"
          component={Link}
          href={{
            pathname: '/repo/[owner]/[repo]',
            query: { owner: query.owner, repo: query.repo },
          }}
          size="sm"
        >
          ← Back to repo
        </Text>
      </Box>

      <Group>
        <Button
          onClick={() =>
            api(
              'POST',
              `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(
                workflow
              )}`
            )
          }
        >
          Run Now
        </Button>

        <Button
          component="a"
          href="https://vercel.com/integrations/tentacle/new"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandVercel stroke={3} />
          <Text ml="sm">Configure with Vercel</Text>
        </Button>
      </Group>
    </>
  );
};

export default Workflow;

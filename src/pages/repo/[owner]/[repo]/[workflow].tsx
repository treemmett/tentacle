import { Box, Button, Text, Title } from '@mantine/core';
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
    </>
  );
};

export default Workflow;

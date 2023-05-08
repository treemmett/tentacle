import { Badge, Box, Center, Code, Flex, Paper, Skeleton, Text, Title } from '@mantine/core';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useRepo } from '@/lib/repos';
import type { GetRepoWorkflows } from '@/pages/api/repo/[owner]/[repo]';

const List: FC<{ workflows: GetRepoWorkflows }> = ({ workflows }) =>
  workflows.length ? (
    <>
      {workflows.map((r) => {
        const color = r.supported ? 'green' : 'gray';

        return (
          <Paper align="center" component={Flex} key={r.name} mb="sm" p="md" shadow="xs" withBorder>
            <Text>{r.name}</Text>
            {r.error ? (
              <Badge color="red" size="sm">
                {r.error}
              </Badge>
            ) : (
              <Badge color={color} ml="auto" size="sm">
                {r.supported ? (
                  'Setup'
                ) : (
                  <Text inherit>
                    Missing{' '}
                    <Code color="gray" sx={{ fontSize: '0.6rem' }}>
                      repository_dispatch
                    </Code>{' '}
                    trigger.
                  </Text>
                )}
              </Badge>
            )}
          </Paper>
        );
      })}
    </>
  ) : (
    <Center my="lg">Repository has no workflows :(</Center>
  );

const Page: NextPage = () => {
  const { query } = useRouter();
  const { isLoading, workflows } = useRepo(query.owner as string, query.repo as string);

  return (
    <>
      <Box mb="lg">
        <Title order={3}>
          {query.owner}/{query.repo}
        </Title>

        <Text color="blue.5" component={Link} href="/" size="sm">
          ← Back to repos
        </Text>
      </Box>

      {/* eslint-disable-next-line no-nested-ternary */}
      {isLoading ? (
        new Array(8).fill(null).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} mb="sm" visible>
            <Box p="md">Loading...</Box>
          </Skeleton>
        ))
      ) : (
        <List workflows={workflows} />
      )}
    </>
  );
};

export default Page;

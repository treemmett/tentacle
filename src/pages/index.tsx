import { Box, Paper, Skeleton } from '@mantine/core';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRepos } from '@/lib/repos';

const Page: NextPage = () => {
  const { isLoading, repos } = useRepos();

  if (isLoading) {
    return (
      <>
        {new Array(8).fill(null).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} mb="sm" visible>
            <Box p="md">Loading...</Box>
          </Skeleton>
        ))}
      </>
    );
  }

  return (
    <>
      {repos.map((r) => (
        <Paper component={Link} href={`/repo/${r}`} key={r} mb="sm" p="md" shadow="xs" withBorder>
          {r}
        </Paper>
      ))}
    </>
  );
};

export default Page;

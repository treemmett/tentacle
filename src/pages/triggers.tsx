import { Accordion, Box, Button, Code, Group, Text } from '@mantine/core';
import { IconBrandVercel } from '@tabler/icons-react';
import { NextPage } from 'next';

const Triggers: NextPage = () => (
  <>
    <Group mb="lg">
      <Button>New Trigger</Button>
    </Group>

    <Accordion>
      <Accordion.Item value="item">
        <Accordion.Control>
          <Group>
            <IconBrandVercel stroke={3} />
            <Text>Vercel Deployment</Text>
            <Code>project-name</Code>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Box>a</Box>
          <Box>b</Box>
          <Box>c</Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </>
);

export default Triggers;

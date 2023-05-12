import { IconBrandGithub, IconWebhook } from '@tabler/icons-react';
import { HookType } from './hookType';

export function hookIcon(type: HookType): JSX.Element | null {
  switch (type) {
    case HookType.github_action:
      return <IconBrandGithub size="1rem" stroke={2} />;
    case HookType.webhook:
      return <IconWebhook size="1rem" stroke={2} />;
    default:
      return null;
  }
}

export function hookName(type: HookType): string {
  switch (type) {
    case HookType.github_action:
      return 'GitHub Action';
    case HookType.webhook:
      return 'Webhook';
    default:
      return '';
  }
}

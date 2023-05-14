import { createHmac } from 'crypto';
import getRawBody from 'raw-body';
import { Trigger } from '@/entities/Trigger';
import { VercelCheck } from '@/entities/VercelCheck';
import { TriggerType } from '@/lib/triggerType';
import { Config } from '@/utils/config';
import { UnauthorizedError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { nc } from '@/utils/nc';

export default nc().post(async (req, res) => {
  const rawBody = await getRawBody(req);

  // check request signature
  const bodySignature = createHmac('sha1', Config.VERCEL_CLIENT_SECRET)
    .update(rawBody)
    .digest('hex');

  if (bodySignature !== req.headers['x-vercel-signature']) {
    throw new UnauthorizedError('Invalid signature');
  }

  const webhook: CreatedWebhook | ReadyWebhook | RecheckWebhook = JSON.parse(
    rawBody.toString('utf-8')
  );

  switch (webhook.type) {
    case 'deployment.created': {
      const triggers = await Trigger.createQueryBuilder('trigger')
        .leftJoin('trigger.hooks', 'hook')
        .leftJoin('trigger.vercel', 'vercel')
        .select('trigger.id')
        .addSelect('hook.id')
        .addSelect('hook.type')
        .addSelect('hook.blocking')
        .addSelect('hook.repository')
        .addSelect('hook.workflow')
        .addSelect('vercel.id')
        .addSelect('vercel.accessToken')
        .where('trigger.externalId = :id', { id: webhook.payload.project.id })
        .andWhere('trigger.type = :type', { type: TriggerType.vercel_deployment })
        .getMany();

      await Promise.all(
        triggers.map((t) =>
          VercelCheck.createChecks(t, webhook.payload.deployment.id, webhook.payload.deployment.url)
        )
      );

      res.end();
      break;
    }

    case 'deployment.ready': {
      logger.trace({ webhook }, 'Deployment ready');
      await VercelCheck.runHooks(webhook.payload.deployment.id);
      res.end();
      break;
    }

    // cspell:word rerequested
    case 'deployment.check-rerequested': {
      logger.trace({ webhook }, 'Re-running checks');
      await VercelCheck.runHooks(webhook.payload.deployment.id);
      res.end();
      break;
    }

    default:
      res.end();
      break;
  }
});

interface VercelWebhook<Type extends string, Payload> {
  type: Type;
  id: string;
  createdAt: number;
  region?: string;
  payload: Payload;
}

export type CreatedWebhook = VercelWebhook<
  'deployment.created',
  {
    team?: {
      id: string;
    };
    user: {
      id: string;
    };
    deployment: {
      id: string;
      name: string;
      url: string;
      inspectorUrl: string;
    };
    project: {
      id: string;
    };
    target?: 'production' | 'staging';
    url: string;
  }
>;

type ReadyWebhook = VercelWebhook<
  'deployment.ready',
  {
    team?: {
      id: string;
    };
    user: {
      id: string;
    };
    deployment: {
      id: string;
      name: string;
      url: string;
      inspectorUrl: string;
    };
    project: {
      id: string;
    };
    target?: 'production' | 'staging';
    url: string;
  }
>;

type RecheckWebhook = VercelWebhook<
  'deployment.check-rerequested',
  {
    team?: {
      id: string;
    };
    user: {
      id: string;
    };
    deployment: {
      id: string;
    };
    check: {
      id: string;
    };
  }
>;

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface CreateCheckResponse {
  id: string;
  name: string;
  path?: string;
  status: 'registered' | 'running' | 'completed';
  conclusion?: 'canceled' | 'failed' | 'neutral' | 'succeeded' | 'skipped' | 'stale';
  blocking: boolean;
  output?: {
    metrics?: {
      FCP: {
        value: number | null;
        previousValue?: number;
        source: 'web-vitals';
      };
      LCP: {
        value: number | null;
        previousValue?: number;
        source: 'web-vitals';
      };
      CLS: {
        value: number | null;
        previousValue?: number;
        source: 'web-vitals';
      };
      TBT: {
        value: number | null;
        previousValue?: number;
        source: 'web-vitals';
      };
      virtualExperienceScore?: {
        value: number | null;
        previousValue?: number;
        source: 'web-vitals';
      };
    };
  };
  detailsUrl?: string;
  integrationId: string;
  deploymentId: string;
  externalId?: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  rerequestable?: boolean;
}

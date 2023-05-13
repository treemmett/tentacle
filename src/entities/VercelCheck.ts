import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { Hook } from './Hook';
import { Trigger } from './Trigger';
import { VercelIntegration } from './VercelIntegration';
import { HookType } from '@/lib/hookType';
import type { CreateCheckResponse } from '@/pages/api/vercel';
import { APIError, BadInputError } from '@/utils/errors';
import { logger } from '@/utils/logger';

@Entity({ name: 'vercel_checks' })
export class VercelCheck extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @Index()
  public checkId: string;

  @Column()
  @Index()
  public deploymentId: string;

  @ManyToOne('hooks', { onDelete: 'CASCADE' })
  public hook: Hook;

  @ManyToOne('vercel_installations', 'checks', { nullable: false, onDelete: 'CASCADE' })
  public integration: VercelIntegration;

  public static async createChecks(trigger: Trigger, deploymentId: string): Promise<VercelCheck[]> {
    logger.trace({ trigger }, 'Creating deployment checks');

    const checks = await Promise.all(
      trigger.hooks.map(async (hook) => {
        try {
          const id = v4();
          logger.trace({ hook, id }, 'Creating deployment check');

          let name = 'Tentacle Hook - ';
          switch (hook.type) {
            case HookType.github_action:
              name += `GitHub Action - ${hook.repository} ${hook.workflow}`;
              break;

            case HookType.webhook:
              name += 'Webhook';
              break;

            default:
              throw new BadInputError('Unknown hook type');
          }

          const response = await trigger.vercel.fetch(
            `/v1/deployments/${encodeURIComponent(deploymentId)}/checks`,
            {
              body: JSON.stringify({
                blocking: hook.blocking,
                detailsUrl: 'http://localhost:3000/',
                externalID: id,
                name,
                rerequestable: true,
              }),
              method: 'POST',
            }
          );

          const responseData: CreateCheckResponse = await response.json();

          if (!response.ok) {
            logger.error(
              { deploymentId, err: responseData, hook, trigger },
              'Creating deployment check failed'
            );
            return false;
          }

          logger.trace({ responseData }, 'Created deployment check');

          const check = new VercelCheck();
          check.id = id;
          check.deploymentId = responseData.deploymentId;
          check.checkId = responseData.id;
          check.hook = hook;
          check.integration = trigger.vercel;
          await VercelCheck.insert(check);
          return check;
        } catch (err) {
          logger.error({ err, hook, trigger }, 'Creating deployment check failed');
          return false;
        }
      })
    );

    return checks.filter(Boolean) as VercelCheck[];
  }

  public static async runHooks(deploymentId: string) {
    const checks = await VercelCheck.createQueryBuilder('check')
      .leftJoinAndSelect('check.hook', 'hook')
      .leftJoinAndSelect('check.integration', 'integration')
      .leftJoinAndSelect('hook.trigger', 'trigger')
      .leftJoinAndSelect('trigger.user', 'user')
      .leftJoinAndSelect('user.githubToken', 'github')
      .addSelect('github.token')
      .where('check.deploymentId = :id', { id: deploymentId })
      .getMany();

    await Promise.all(
      checks.map(async (check) => {
        await check.integration.fetch(
          `/v1/deployments/${check.deploymentId}/checks/${check.checkId}`,
          {
            body: JSON.stringify({
              status: 'running',
            }),
            headers: {
              'content-type': 'application/json',
            },
            method: 'PATCH',
          }
        );
        await check.hook.run().catch(async (err) => {
          logger.error({ check: this, err }, 'Hook run failed');
          await check.updateCheck(false);
        });
      })
    );
  }

  public async updateCheck(succeeded: boolean) {
    logger.trace(this, 'Updating checks');
    const response = await this.integration.fetch(
      `/v1/deployments/${this.deploymentId}/checks/${this.checkId}`,
      {
        body: JSON.stringify({
          conclusion: succeeded ? 'succeeded' : 'failed',
          status: 'completed',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      logger.error({ response: await response.json(), ...this }, 'Check update failed');
      throw new APIError('Check registration failed');
    }
  }
}

import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { VercelIntegration } from './VercelIntegration';
import type { CreatedWebhook, CreateCheckResponse } from '@/pages/api/vercel';
import { APIError, IntegrationNotFoundError } from '@/utils/errors';
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

  @ManyToOne('vercel_installations', 'checks', { nullable: false, onDelete: 'CASCADE' })
  public integration: VercelIntegration;

  public static async createCheck(webhook: CreatedWebhook): Promise<VercelCheck> {
    const id = v4();
    logger.trace({ webhook }, 'Creating deployment checks', { id });

    const vercel = await VercelIntegration.createQueryBuilder('vercel')
      .select('vercel.id')
      .addSelect('vercel.accessToken')
      .where('vercel.userId = :id', { id: webhook.payload.user.id })
      .getOne();

    if (!vercel) {
      throw new IntegrationNotFoundError('No vercel installation found');
    }

    const response = await vercel.fetch(
      `/v1/deployments/${encodeURIComponent(webhook.payload.deployment.id)}/checks`,
      {
        body: JSON.stringify({
          blocking: true,
          detailsUrl: 'http://localhost:3000/',
          externalID: id,
          name: 'Tentacle Checks',
          rerequestable: true,
        }),
        method: 'POST',
      }
    );

    if (!response.ok) {
      logger.error({ err: await response.json() }, 'Creating deployment failed');
      throw new APIError('Check registration failed');
    }

    const data: CreateCheckResponse = await response.json();
    const check = new VercelCheck();
    check.id = id;
    check.deploymentId = data.deploymentId;
    check.checkId = data.id;
    check.integration = vercel;
    await VercelCheck.insert(check);
    return check;
  }

  public async updateCheck(succeeded: boolean) {
    logger.trace(this, 'Updating checks');
    const response = await this.integration.fetch(
      `/v1/deployments/${this.deploymentId}/checks/${this.checkId}`,
      {
        body: JSON.stringify({
          conclusion: succeeded ? 'succeeded' : 'failed',
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

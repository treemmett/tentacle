import { SignJWT } from 'jose';
import { Octokit } from 'octokit';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Trigger } from './Trigger';
import type { VercelCheck } from './VercelCheck';
import { HookType } from '@/lib/hookType';
import { Config } from '@/utils/config';
import { BadInputError, GithubError, IntegrationNotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';

@Entity({ name: 'hooks' })
export class Hook extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne('triggers', 'hooks', { nullable: false, onDelete: 'CASCADE' })
  public trigger: Trigger;

  @Column({ enum: HookType, type: 'enum' })
  public type: HookType;

  @Column({ default: false })
  public blocking: boolean;

  @Column({ nullable: true })
  public repository?: string;

  @Column({ nullable: true })
  public workflow?: string;

  public async run(deploymentUrl: string, check?: VercelCheck) {
    const token = await new SignJWT({ cid: check?.id, hid: this.id })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(Config.TOKEN_KEY);

    const callbackUrl = `${Config.BASE_URL}/api/check/callback/${token}`;

    switch (this.type) {
      case HookType.github_action: {
        if (!this.trigger.user?.githubToken) {
          throw new IntegrationNotFoundError('Missing GitHub integration');
        }

        const octokit = new Octokit({ auth: this.trigger.user.githubToken.token });

        if (!this.repository) {
          throw new BadInputError('Missing repository');
        }

        if (!this.workflow) {
          throw new BadInputError('Missing workflow');
        }

        const [owner, repo] = this.repository.split('/');
        await octokit
          .request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
            inputs: {
              callback_url: callbackUrl,
              deployment_url: deploymentUrl,
            },
            owner,
            ref: 'main',
            repo,
            workflow_id: this.workflow,
          })
          .catch((err) => {
            logger.error({ err }, 'Failed to dispatch GitHub Action');
            throw new GithubError();
          });

        break;
      }

      default:
        break;
    }
  }
}

export type HookDTO = Omit<Hook, keyof BaseEntity | 'trigger'>;

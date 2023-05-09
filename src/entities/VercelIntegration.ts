import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { VercelCheck } from './VercelCheck';
import { APIError, ProjectNotFound } from '@/utils/errors';
import { logger } from '@/utils/logger';

@Entity({ name: 'vercel_installations' })
export class VercelIntegration extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @Column()
  public accessToken: string;

  @Column()
  public userId: string;

  @Column({ nullable: true })
  public teamId?: string;

  @OneToMany('vercel_checks', 'integration')
  public checks: VercelCheck[];

  public async getProject(id: string): Promise<GetVercelProjects[0]> {
    const response = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(id)}`, {
      headers: {
        authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 404) {
      throw new ProjectNotFound();
    }

    if (!response.ok) {
      logger.error(await response.json(), 'Vercel request failed');
      throw new APIError('Vercel error');
    }

    const data = await response.json();
    return data;
  }

  public async getProjects(): Promise<GetVercelProjects> {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      logger.error(await response.json(), 'Vercel request failed');
      throw new APIError('Vercel error');
    }

    const data: VercelResponse = await response.json();

    return data.projects.map((p) => ({ id: p.id, name: p.name }));
  }
}

export type GetVercelProjects = {
  id: string;
  name: string;
}[];

interface VercelResponse {
  projects: {
    accountId: string;
    analytics?: {
      id: string;
      canceledAt: number | null;
      disabledAt: number;
      enabledAt: number;
      paidAt?: number;
      sampleRatePercent?: number | null;
      spendLimitInDollars?: number | null;
    };
    autoExposeSystemEnvs?: boolean;
    buildCommand?: string | null;
    commandForIgnoringBuildStep?: string | null;
    connectConfigurationId?: string | null;
    connectBuildsEnabled?: boolean;
    createdAt?: number;
    devCommand?: string | null;
    directoryListing: boolean;
    installCommand?: string | null;
    gitForkProtection?: boolean;
    gitLFS?: boolean;
    id: string;
    latestDeployments?: {
      alias?: string[];
      aliasAssigned?: (number | boolean) | null;
      aliasError?: {
        code: string;
        message: string;
      } | null;
      aliasFinal?: string | null;
      automaticAliases?: string[];
      builds?: {
        use: string;
        src?: string;
        dest?: string;
      }[];
      connectConfigurationId?: string;
      createdAt: number;
      createdIn: string;
      creator: {
        email: string;
        githubLogin?: string;
        gitlabLogin?: string;
        uid: string;
        username: string;
      } | null;
      deploymentHostname: string;
      name: string;
      forced?: boolean;
      id: string;
      /** Construct a type with a set of properties K of type T */
      meta?: { [key: string]: string };
      monorepoManager?: string | null;
      plan: 'hobby' | 'enterprise' | 'pro' | 'oss';
      private: boolean;
      readyState: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
      requestedAt?: number;
      target?: string | null;
      teamId?: string | null;
      type: 'LAMBDAS';
      url: string;
      userId: string;
      withCache?: boolean;
      checksConclusion?: 'succeeded' | 'failed' | 'skipped' | 'canceled';
      checksState?: 'registered' | 'running' | 'completed';
      readyAt?: number;
      buildingAt?: number;
      /** Whether or not preview comments are enabled for the deployment */
      previewCommentsEnabled?: boolean;
    }[];
    name: string;
    nodeVersion: '18.x' | '16.x' | '14.x' | '12.x' | '10.x';
    outputDirectory?: string | null;
    passwordProtection?: {
      deploymentType: 'preview' | 'all';
    } | null;
    publicSource?: boolean | null;
    rootDirectory?: string | null;
    serverlessFunctionRegion?: string | null;
    skipGitConnectDuringLink?: boolean;
    sourceFilesOutsideRootDirectory?: boolean;
    ssoProtection?: {
      deploymentType: 'preview' | 'all';
    } | null;
    transferCompletedAt?: number;
    transferStartedAt?: number;
    transferToAccountId?: string;
    transferredFromAccountId?: string;
    updatedAt?: number;
    live?: boolean;
    enablePreviewFeedback?: boolean | null;
    lastRollbackTarget?: {
      fromDeploymentId: string;
      toDeploymentId: string;
      jobStatus: 'succeeded' | 'failed' | 'skipped' | 'pending' | 'in-progress';
      requestedAt: number;
    } | null;
    hasFloatingAliases?: boolean;
    /** Construct a type with a set of properties K of type T */
    protectionBypass?: { [key: string]: string };
    hasActiveBranches?: boolean;
    ipAllowlist?: {
      deploymentType: 'preview' | 'all';
      ipAddresses: string[];
      protectionMode: 'additional' | 'exclusive';
    } | null;
  }[];
}

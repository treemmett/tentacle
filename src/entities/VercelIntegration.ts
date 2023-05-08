import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { VercelCheck } from './VercelCheck';

@Entity({ name: 'vercel_installations' })
export class VercelInstallation extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @Column()
  public accessToken: string;

  @Column()
  public userId: string;

  @Column({ nullable: true })
  public teamId?: string;

  @OneToMany('vercel_checks', 'integration')
  public checks: VercelCheck;
}

import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

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
}

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { GithubUser } from './GithubUser';
import type { VercelIntegration } from './VercelIntegration';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public email: string;

  @CreateDateColumn()
  public dateCreated: Date;

  @OneToOne('github_users', 'user')
  public githubToken: GithubUser;

  @OneToOne('vercel_installations', 'user')
  public vercel: VercelIntegration;
}

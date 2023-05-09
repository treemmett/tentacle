import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { GithubUser } from './GithubUser';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public email: string;

  @CreateDateColumn()
  public dateCreated: Date;

  @OneToOne('github_users', 'user')
  public githubToken: GithubUser;
}

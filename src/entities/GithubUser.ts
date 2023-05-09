import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import type { User } from './User';

@Entity({ name: 'github_users' })
export class GithubUser extends BaseEntity {
  @PrimaryColumn()
  public id: number;

  // TODO encrypt this column
  @Column({ select: false })
  public token: string;

  @OneToOne('users', 'github', { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  public user: User;
}

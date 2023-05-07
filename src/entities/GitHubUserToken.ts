import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'github_user_tokens' })
export class GitHubUserToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public refreshToken: string;

  @Column()
  public refreshTokenExpiration: Date;
}

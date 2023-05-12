import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Trigger } from './Trigger';
import { HookType } from '@/lib/hookType';

@Entity({ name: 'hooks' })
export class Hook extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne('triggers', 'hooks', { nullable: false, onDelete: 'CASCADE' })
  public trigger?: Trigger;

  @Column({ enum: HookType, type: 'enum' })
  public type: HookType;

  @Column({ default: false })
  public blocking: boolean;
}

export type HookDTO = Omit<Hook, keyof BaseEntity | 'trigger'>;

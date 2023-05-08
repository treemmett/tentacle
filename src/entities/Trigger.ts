import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TriggerType } from '@/lib/triggerType';

@Entity({ name: 'triggers' })
export class Trigger extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ enum: TriggerType, type: 'enum' })
  public type: TriggerType;

  @Column()
  public externalId: string;

  @Column({ default: false })
  public blocking: boolean;

  public static async getAll() {
    const triggers = await Trigger.find({ where: {} });
    return triggers;
  }

  public static async createTrigger(type: TriggerType, id: string, blocking = false) {
    const trigger = new Trigger();
    trigger.type = type;
    trigger.blocking = blocking;
    trigger.externalId = id;
    await Trigger.insert(trigger);
    return trigger;
  }
}

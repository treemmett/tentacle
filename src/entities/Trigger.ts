import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hook, HookDTO } from './Hook';
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

  @OneToMany('hooks', 'trigger')
  public hooks: Hook[];

  public static async getAll() {
    const triggers = await Trigger.find({ where: {} });
    return triggers;
  }

  public static async createTrigger(type: TriggerType, id: string, hooks: HookDTO[]) {
    const trigger = new Trigger();
    trigger.type = type;
    trigger.externalId = id;
    await Trigger.insert(trigger);
    trigger.hooks = await Promise.all(
      hooks.map(async (h) => {
        const hook = new Hook();
        hook.blocking = h.blocking;
        hook.type = h.type;
        hook.trigger = trigger;
        await Hook.insert(hook);
        delete hook.trigger;
        return hook;
      })
    );
    return trigger;
  }
}

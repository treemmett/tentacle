import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hook, HookDTO } from './Hook';
import type { User } from './User';
import { VercelIntegration } from './VercelIntegration';
import { TriggerType } from '@/lib/triggerType';
import { BadInputError } from '@/utils/errors';

@Entity({ name: 'triggers' })
export class Trigger extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ enum: TriggerType, type: 'enum' })
  public type: TriggerType;

  @Column()
  public externalId: string;

  @ManyToOne('vercel_installations', 'triggers', { onDelete: 'CASCADE' })
  public vercel: VercelIntegration;

  @OneToMany('hooks', 'trigger')
  public hooks: Hook[];

  @ManyToOne('users', 'triggers')
  public user: User;

  public static async getAll(user: User) {
    const triggers = Trigger.createQueryBuilder('trigger')
      .leftJoin('trigger.user', 'user')
      .leftJoin('trigger.hooks', 'hook')
      .select('trigger.id')
      .addSelect('trigger.type')
      .addSelect('trigger.externalId')
      .addSelect('hook.id')
      .addSelect('hook.type')
      .addSelect('hook.blocking')
      .addSelect('hook.repository')
      .addSelect('hook.workflow')
      .where('user.id = :id', { id: user.id })
      .getMany();

    return triggers;
  }

  public static async createTrigger(user: User, type: TriggerType, id: string, hooks: HookDTO[]) {
    const trigger = new Trigger();
    trigger.type = type;
    trigger.user = user;
    trigger.externalId = id;

    switch (type) {
      case TriggerType.vercel_deployment:
        trigger.vercel = await VercelIntegration.findOneOrFail({
          where: { user: { id: user.id } },
        });
        break;

      default:
        throw new BadInputError('Unknown trigger type');
    }

    await Trigger.insert(trigger);
    trigger.hooks = await Promise.all(
      hooks.map(async (h) => {
        const hook = new Hook();
        hook.blocking = h.blocking;
        hook.type = h.type;
        hook.trigger = trigger;
        hook.repository = h.repository;
        hook.workflow = h.workflow;
        await Hook.insert(hook);
        delete hook.trigger;
        return hook;
      })
    );
    return trigger;
  }
}

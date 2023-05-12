import { Joi, celebrate } from 'celebrate';
import { Trigger } from '@/entities/Trigger';
import { VercelIntegration } from '@/entities/VercelIntegration';
import { HookType } from '@/lib/hookType';
import { TriggerType } from '@/lib/triggerType';
import { IntegrationNotFoundError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC()
  .get(async (req, res) => {
    const triggers = await Trigger.getAll(req.user);
    res.send(triggers);
  })
  .post(
    celebrate({
      body: {
        externalId: Joi.string(),
        hooks: Joi.array()
          .items({
            blocking: Joi.boolean().default(false),
            id: Joi.string().optional(),
            repository: Joi.string().optional(),
            type: Joi.string()
              .required()
              .valid(...Object.values(HookType)),
            workflow: Joi.string().optional(),
          })
          .min(1),
        id: Joi.string().optional(),
        type: Joi.string()
          .required()
          .valid(...Object.values(TriggerType)),
      },
    }),
    async (req, res) => {
      const { externalId, hooks, type } = req.body;
      // confirm the user has access to the project
      const vercel = await VercelIntegration.findOne({ where: { user: { id: req.user.id } } });

      if (!vercel) {
        throw new IntegrationNotFoundError('No vercel installation found');
      }

      const project = await vercel.getProject(externalId);

      const trigger = await Trigger.createTrigger(req.user, type, project.id, hooks);

      res.send(trigger);
    }
  );

export type GetTriggers = Trigger[];

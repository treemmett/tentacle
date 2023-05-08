import { Joi, celebrate } from 'celebrate';
import { Trigger } from '@/entities/Trigger';
import { VercelInstallation } from '@/entities/VercelIntegration';
import { TriggerType } from '@/lib/triggerType';
import { IntegrationNotFoundError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC()
  .get(async (req, res) => {
    const triggers = await Trigger.getAll();
    res.send(triggers);
  })
  .post(
    celebrate({
      body: {
        blocking: Joi.boolean(),
        externalId: Joi.string(),
        type: Joi.string()
          .required()
          .valid(...Object.values(TriggerType)),
      },
    }),
    async (req, res) => {
      const { blocking, externalId, type } = req.body;
      // confirm the user has access to the project
      // TODO relate to user somehow
      const vercel = await VercelInstallation.findOne({ where: {} });

      if (!vercel) {
        throw new IntegrationNotFoundError('No vercel installation found');
      }

      const project = await vercel.getProject(externalId);

      const trigger = await Trigger.createTrigger(type, project.id, blocking);

      res.send(trigger);
    }
  );

export type GetTriggers = Trigger[];

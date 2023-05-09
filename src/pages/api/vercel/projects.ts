import { VercelIntegration } from '@/entities/VercelIntegration';
import { IntegrationNotFoundError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get(async (req, res) => {
  const vercel = await VercelIntegration.findOne({ where: { user: { id: req.user.id } } });

  if (!vercel) {
    throw new IntegrationNotFoundError('No vercel installation found');
  }

  res.send(await vercel.getProjects());
});

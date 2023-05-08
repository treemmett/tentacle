import { VercelInstallation } from '@/entities/VercelIntegration';
import { IntegrationNotFoundError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get(async (req, res) => {
  // TODO relate to user somehow
  const vercel = await VercelInstallation.findOne({ where: {} });

  if (!vercel) {
    throw new IntegrationNotFoundError('No vercel installation found');
  }

  res.send(await vercel.getProjects());
});

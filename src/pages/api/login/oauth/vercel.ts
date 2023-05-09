import { Joi, celebrate } from 'celebrate';
import { VercelIntegration } from '@/entities/VercelIntegration';
import { Config } from '@/utils/config';
import { AuthorizationError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().post(
  celebrate({ body: { code: Joi.string().required() } }),
  async (req, res) => {
    const { code } = req.body as Record<string, string>;
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      body: new URLSearchParams({
        client_id: Config.VERCEL_CLIENT_ID,
        client_secret: Config.VERCEL_CLIENT_SECRET,
        code,
        redirect_uri: Config.VERCEL_REDIRECT_URL,
      }).toString(),
      headers,
      method: 'POST',
    });

    if (!response.ok) {
      throw new AuthorizationError('Bad access code');
    }

    const data = await response.json();

    const integration = new VercelIntegration();
    integration.id = data.installation_id;
    integration.accessToken = data.access_token;
    integration.teamId = data.team_id;
    integration.userId = data.user_id;
    await integration.save();

    res.send({ ok: true });
  }
);

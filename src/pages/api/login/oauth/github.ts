import { Joi, celebrate } from 'celebrate';
import { App } from 'octokit';
import { GitHubUserToken } from '@/entities/GitHubUserToken';
import { Config } from '@/utils/config';
import { nc } from '@/utils/nc';

const GithubApp = new App({
  appId: Config.GITHUB_APP_ID,
  oauth: {
    clientId: Config.GITHUB_CLIENT_ID,
    clientSecret: Config.GITHUB_CLIENT_SECRET,
  },
  privateKey: Config.GITHUB_PRIVATE_KEY,
});

export default nc().post(
  celebrate({
    body: {
      code: Joi.string().required(),
    },
  }),
  async (req, res) => {
    const response = await GithubApp.oauth.createToken({
      code: req.body.code,
    });

    if (!('refreshToken' in response.authentication)) {
      throw new Error('Authentication missing refresh token');
    }

    const token = new GitHubUserToken();
    token.refreshToken = response.authentication.refreshToken;
    token.refreshTokenExpiration = new Date(response.authentication.refreshTokenExpiresAt);
    await GitHubUserToken.insert(token);

    res.send(token);
  }
);

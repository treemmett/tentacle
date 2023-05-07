import { Joi, celebrate } from 'celebrate';
import { CompactEncrypt } from 'jose';
import { App } from 'octokit';
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
    const { authentication } = await GithubApp.oauth.createToken({
      code: req.body.code,
    });

    const token = await new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify({ token: authentication.token }))
    )
      .setProtectedHeader({ alg: 'A256KW', enc: 'A256GCM' })
      .encrypt(Config.TOKEN_KEY);

    res.send({ token });
  }
);

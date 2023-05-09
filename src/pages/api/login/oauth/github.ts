import { Joi, celebrate } from 'celebrate';
import { SignJWT } from 'jose';
import { App, Octokit } from 'octokit';
import { GithubUser } from '@/entities/GithubUser';
import { User } from '@/entities/User';
import { Config } from '@/utils/config';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest, nc } from '@/utils/nc';

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
  async (req: AuthenticatedRequest, res) => {
    const { authentication } = await GithubApp.oauth.createToken({
      code: req.body.code,
    });

    req.octokit = new Octokit({ auth: authentication.token });

    const githubUserRequest = await req.octokit.request('GET /user');

    // find existing user first
    let githubUser = await GithubUser.findOne({
      relations: { user: true },
      where: { id: githubUserRequest.data.id },
    });

    if (!githubUser) {
      githubUser = new GithubUser();
      githubUser.id = githubUserRequest.data.id;
      githubUser.token = authentication.token;
      githubUser.user = new User();
      // TODO possible null email might break if the github user hasn't publicized their email
      githubUser.user.email = githubUserRequest.data.email as string;
      await User.insert(githubUser.user);
      await GithubUser.insert(githubUser);
    } else if (githubUser) {
      githubUser.token = authentication.token;
      await githubUser.save();
    }

    const token = await new SignJWT({})
      .setSubject(githubUser.user.id)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(Config.TOKEN_KEY);

    logger.trace({ token }, 'token here');

    res.send({ token });
  }
);

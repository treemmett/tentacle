import { errors, isCelebrateError } from 'celebrate';
import { compactDecrypt } from 'jose';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect, { Middleware } from 'next-connect';
import { Octokit } from 'octokit';
import logHttp, { Options } from 'pino-http';
import { Config } from './config';
import { connectToDatabase } from './dataSource';
import { APIError, AuthorizationError } from './errors';
import { logger } from './logger';

const celebrateErrorHandler = errors();

export type ApiMiddleware = Middleware<NextApiRequest, NextApiResponse>;

export interface AuthenticatedRequest extends NextApiRequest {
  octokit: Octokit;
}

export function nc<Req extends NextApiRequest, Res extends NextApiResponse>() {
  return nextConnect<Req, Res>({
    onError: (err, req, res, next) => {
      logger.error(err);

      if (isCelebrateError(err)) {
        celebrateErrorHandler(err, req, res, next);
        return;
      }

      if (err instanceof APIError) {
        res
          .status(err.status)
          .send({ error: { code: err.constructor.name, message: err.message, stack: err.stack } });
        return;
      }

      res.status(500).send({ error: err });
    },
  })
    .use(logHttp({ logger } as Options))
    .use(connectToDatabase);
}

export function authenticatedNC() {
  return nc<AuthenticatedRequest, NextApiResponse>().use(async (req, res, next) => {
    if (!req.headers.authorization) {
      throw new AuthorizationError('No access token');
    }

    const [, accessToken] = req.headers.authorization.split(' ');

    if (!accessToken) {
      throw new AuthorizationError('No access token');
    }

    try {
      const { plaintext } = await compactDecrypt(accessToken, Config.TOKEN_KEY);
      const { token } = JSON.parse(new TextDecoder().decode(plaintext));
      req.octokit = new Octokit({ auth: token });
      next();
    } catch (err) {
      console.error(err);
      throw new AuthorizationError('Invalid access token');
    }
  });
}

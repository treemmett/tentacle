import { errors, isCelebrateError } from 'celebrate';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect, { Middleware } from 'next-connect';
import { connectToDatabase } from './dataSource';

const celebrateErrorHandler = errors();

export type ApiMiddleware = Middleware<NextApiRequest, NextApiResponse>;

export function nc() {
  return nextConnect<NextApiRequest, NextApiResponse>({
    onError: (err, req, res, next) => {
      if (isCelebrateError(err)) {
        celebrateErrorHandler(err, req, res, next);
        return;
      }

      res.status(500).send({
        error: {
          name: err.name || 'Unknown Error',
          stack: err.stack,
        },
      });
    },
  }).use(connectToDatabase);
}

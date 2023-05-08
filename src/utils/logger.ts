import { pino } from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: isProd ? 'info' : 'trace',
  redact: {
    paths: isProd ? ['req.headers.cookie', 'res.headers["set-cookie"]'] : [],
  },
});

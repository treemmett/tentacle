import { createSecretKey, randomBytes } from 'crypto';
import { PublicConfig } from './publicConfig';

export class Config extends PublicConfig {
  public static readonly DB_CERTIFICATE = process.env.DB_CERTIFICATE;

  public static readonly DB_DATABASE = process.env.DB_DATABASE || 'tentacle';

  public static readonly DB_HOST = process.env.DB_HOST || 'localhost';

  public static readonly DB_PASSWORD = process.env.DB_PASSWORD;

  public static readonly DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

  public static readonly DB_USERNAME = process.env.DB_USERNAME;

  public static readonly GITHUB_APP_ID = process.env.GITHUB_APP_ID as string;

  public static readonly GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

  public static readonly GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY as string;

  public static readonly TOKEN_KEY = createSecretKey(
    process.env.TOKEN_KEY ? Buffer.from(process.env.TOKEN_KEY, 'hex') : randomBytes(32)
  );
}

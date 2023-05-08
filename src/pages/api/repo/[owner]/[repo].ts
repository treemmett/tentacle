import { Joi, celebrate } from 'celebrate';
import yaml from 'js-yaml';
import { RepositoryNotFoundError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC()
  .use(
    celebrate({
      query: {
        owner: Joi.string().required(),
        repo: Joi.string().required(),
      },
    })
  )
  .get(async (req, res) => {
    const { owner, repo } = req.query as Record<string, string>;

    const { data } = await req.octokit
      .request('GET /repos/{owner}/{repo}/actions/workflows', {
        owner,
        repo,
      })
      .catch((err) => {
        if ('status' in err) {
          if (err.status === 404) {
            throw new RepositoryNotFoundError();
          }
        }

        throw err;
      });

    const repos = await Promise.all(
      data.workflows.map(
        async ({
          path,
        }): Promise<{
          error?: string;
          name: string;
          supported: boolean;
        }> => {
          try {
            const { data: workflow } = await req.octokit.request(
              'GET /repos/{owner}/{repo}/contents/{path}',
              {
                owner,
                path,
                repo,
              }
            );

            if (!('content' in workflow)) throw new Error();

            const file = Buffer.from(
              workflow.content,
              workflow.encoding as BufferEncoding
            ).toString();

            const parsed = yaml.load(file) as Workflow;

            return {
              name: path.split('/').at(-1) || path,
              supported: !!parsed.on?.repository_dispatch,
            };
          } catch {
            return {
              error: 'Unable to read workflow',
              name: path.split('/').at(-1) || path,
              supported: false,
            };
          }
        }
      )
    );

    res.send(repos as GetRepoWorkflows);
  });

export type GetRepoWorkflows = {
  error?: string;
  name: string;
  supported: boolean;
}[];

interface Workflow {
  name: string;
  on: {
    [key: string]: unknown;
    push?: {
      branches?: string[];
      tags?: string[];
      paths?: string[];
      [key: string]: unknown;
    };
    pull_request?: {
      types?: string[];
      [key: string]: unknown;
    };
  };
  env?: {
    [key: string]: unknown;
  };
  jobs: {
    [key: string]: {
      'runs-on': string;
      steps?: {
        uses: string;
        with?: {
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }[];
      [key: string]: unknown;
    };
  };
}

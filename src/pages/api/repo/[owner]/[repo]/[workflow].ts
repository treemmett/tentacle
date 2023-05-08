import { RequestError } from '@octokit/request-error';
import { Joi, celebrate } from 'celebrate';
import { APIError } from '@/utils/errors';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC()
  .use(
    celebrate({
      query: {
        owner: Joi.string().required(),
        repo: Joi.string().required(),
        workflow: Joi.string().required(),
      },
    })
  )
  .post(async (req, res) => {
    const { owner, repo, workflow } = req.query as Record<string, string>;
    await req.octokit
      .request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner,
        ref: 'main',
        repo,
        workflow_id: workflow,
      })
      .catch((err) => {
        if (err instanceof RequestError) {
          throw new APIError(err.message, err.status);
        }

        throw err;
      });

    res.status(201).send({ ok: true });
  });

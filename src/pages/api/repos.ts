import { Joi, celebrate } from 'celebrate';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get(
  celebrate({
    query: {
      page: Joi.number().integer().min(1).default(1),
    },
  }),
  async (req, res) => {
    const { data } = await req.octokit.request('GET /user/repos', {
      per_page: 100,
    });
    res.send(data.map((r) => r.full_name) as GetRepos);
  }
);

export type GetRepos = string[];

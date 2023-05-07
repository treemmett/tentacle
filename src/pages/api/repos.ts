import { Octokit } from 'octokit';
import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get(async (req, res) => {
  const { data } = await new Octokit({ auth: req.token }).request('GET /user/repos');
  res.send(data.map((r) => r.full_name) as GetRepos);
});

export type GetRepos = string[];

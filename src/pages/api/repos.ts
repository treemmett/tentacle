import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get(async (req, res) => {
  const { data } = await req.octokit.request('GET /user/repos');
  res.send(data.map((r) => r.full_name) as GetRepos);
});

export type GetRepos = string[];

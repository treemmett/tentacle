import { authenticatedNC } from '@/utils/nc';

export default authenticatedNC().get((req, res) => {
  res.send(req.user);
});

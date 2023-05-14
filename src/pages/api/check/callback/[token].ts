import { Joi, celebrate } from 'celebrate';
import { jwtVerify } from 'jose';
import { VercelCheck } from '@/entities/VercelCheck';
import { Config } from '@/utils/config';
import { AuthorizationError, CheckNotFoundError } from '@/utils/errors';
import { nc } from '@/utils/nc';

export default nc().post(
  celebrate({ body: { success: Joi.boolean().default(true) } }),
  async (req, res) => {
    const { payload } = await jwtVerify(req.query.token as string, Config.TOKEN_KEY).catch(() => {
      throw new AuthorizationError('Invalid token');
    });

    const check = await VercelCheck.createQueryBuilder('check')
      .leftJoinAndSelect('check.hook', 'hook')
      .leftJoinAndSelect('check.integration', 'integration')
      .where('check.id = :id', { id: payload.cid })
      .getOne();

    if (!check) {
      throw new CheckNotFoundError();
    }

    await check.updateCheck(req.body.success);
    res.end();
  }
);

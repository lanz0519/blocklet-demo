// import middleware from '@blocklet/sdk/lib/middlewares';
import { Router } from 'express';

import User from './user/index';

const router = Router();

router.use('/user', User);

export default router;

import { NextFunction, Request, Response, Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import db from 'lokijs';

import { APIError, APIErrorMsg } from '../../../../constant';
import { IUser } from './type.js';

const router = Router();
const users = new db.Collection<IUser>('users');

// 验证中间件
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

/* 
  创建一个用户
*/
router.post(
  '/',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    validate,
  ],
  (req: Request, res: Response) => {
    const { username, email, phone } = req.body;

    users.insert({ username, email, phone });

    return res.json({
      username,
      email,
      phone,
    });
  },
);

router.get(
  '/info',
  [query('username').notEmpty().withMessage('用户名不能为空'), validate],
  (req: Request, res: Response) => {
    const { username } = req.query;

    const user = users.findOne({ username: username as string });

    if (!user) {
      return res.status(200).json({
        code: APIError.USER_NOT_FOUND,
        msg: APIErrorMsg[APIError.USER_NOT_FOUND],
      });
    }

    return res.json({
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  },
);

router.put(
  '/update',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    validate,
  ],
  (req: Request, res: Response) => {
    const { username, email, phone } = req.body;

    const user = users.findOne({ username });

    if (!user) {
      return res.status(200).json({
        code: APIError.USER_NOT_FOUND,
        msg: APIErrorMsg[APIError.USER_NOT_FOUND],
      });
    }

    user.email = email;
    user.phone = phone;

    users.update(user);

    return res.json({
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  },
);

export default router;

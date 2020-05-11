import { Request, Response } from 'express';

export default {
  'POST /api/user/*': (req: Request, res: Response) => {
    res.send("mock环境无法操作");
  },
};

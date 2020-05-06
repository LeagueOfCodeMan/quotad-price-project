import {Request, Response} from 'express';

export default {
  'PUT  /api/user/*': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法修改");
  },
  'POST  /api/user/*': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法修改");
  },
  'POST  /api/addr': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法新增");
  },
  'PUT  /api/addr/*': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法修改");
  },
  'DELETE  /api/addr/*': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法修改");
  },
};

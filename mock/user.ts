import {Request, Response} from 'express';

const getUserDetailList =
  {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "area": "上海",
        "users": [
          {
            "id": 2,
            "username": "leader",
            "real_name": "cssdcsdcsdc",
            "project_list": [],
            "one_level": [
              {
                "id": 3,
                "username": "cdp",
                "real_name": "",
                "project_list": []
              }
            ],
            "two_level": []
          }
        ]
      },
      {
        "area": "江西",
        "users": [
          {
            "id": 5,
            "username": "jiangxi",
            "real_name": "江西老表",
            "project_list": [],
            "one_level": [
              {
                "id": 6,
                "username": "jiangxi1",
                "real_name": "老表1号",
                "project_list": [
                  {
                    "id": 14,
                    "project_name": "xiangmu"
                  },
                  {
                    "id": 15,
                    "project_name": "xiangmu2"
                  }
                ]
              }
            ],
            "two_level": []
          }
        ]
      }
    ]
  };

const getUsers = {
  "count": 7,
  "next": null,
  "previous": null,
  "results": [
    {
      "url": "http://192.168.1.188:9099/api/user/7",
      "id": 7,
      "username": "beijing1",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-28 16:29:43",
      "last_login": null,
      "real_name": "大萨达所多所所多多所",
      "company": "北京北京休息休息",
      "addr": "asdsddfsdcs",
      "email": "111@qq.xsd",
      "tel": "111",
      "area": 1,
      "area_name": "北京",
      "code": "GD001",
      "identity": 3,
      "state": 0
    },
    {
      "url": "http://192.168.1.188:9099/api/user/6",
      "id": 6,
      "username": "jiangxi1",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-28 10:55:53",
      "last_login": "2020-04-30 15:09:52",
      "real_name": "老表1号",
      "company": "刘佳琪科技有限公司",
      "addr": "大萨达所多",
      "email": "111@qq.com",
      "tel": "111",
      "area": 4,
      "area_name": "江西",
      "code": "JX0001",
      "identity": 3,
      "state": 1
    },
    {
      "url": "http://192.168.1.188:9099/api/user/5",
      "id": 5,
      "username": "jiangxi",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-28 10:53:06",
      "last_login": "2020-04-30 17:08:00",
      "real_name": "江西老表",
      "company": "刘佳琪科技有限公司",
      "addr": "sdfsdf",
      "email": "110@qq.com",
      "tel": "110",
      "area": 4,
      "area_name": "江西",
      "code": "JX0001",
      "identity": 2,
      "state": 1
    },
    {
      "url": "http://192.168.1.188:9099/api/user/4",
      "id": 4,
      "username": "zhengbigbig",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-28 10:35:06",
      "last_login": null,
      "real_name": "dasdasdass",
      "company": "北京北京休息休息",
      "addr": "dsdsd",
      "email": "asdasdasdas@qq.csdsd",
      "tel": "dasdasd",
      "area": 1,
      "area_name": "北京",
      "code": "GD001",
      "identity": 3,
      "state": 1
    },
    {
      "url": "http://192.168.1.188:9099/api/user/3",
      "id": 3,
      "username": "cdp",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-26 10:09:52",
      "last_login": "2020-04-28 18:33:03",
      "real_name": "",
      "company": "东方德康",
      "addr": "",
      "email": "",
      "tel": "",
      "area": 2,
      "area_name": "上海",
      "code": "SH2001",
      "identity": 3,
      "state": 0
    },
    {
      "url": "http://192.168.1.188:9099/api/user/2",
      "id": 2,
      "username": "leader",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": false,
      "date_joined": "2020-04-21 10:53:19",
      "last_login": "2020-04-29 13:38:11",
      "real_name": "cssdcsdcsdc",
      "company": "东方德康",
      "addr": "",
      "email": "",
      "tel": "",
      "area": 2,
      "area_name": "上海",
      "code": "SH2001",
      "identity": 2,
      "state": 1
    },
    {
      "url": "http://192.168.1.188:9099/api/user/1",
      "id": 1,
      "username": "admin",
      "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
      "is_superuser": true,
      "date_joined": "2020-04-20 13:52:42",
      "last_login": "2020-05-06 13:31:54",
      "real_name": "皮皮虾",
      "company": "",
      "addr": "硅谷亮城",
      "email": "",
      "tel": "",
      "area": null,
      "code": "",
      "identity": 1,
      "state": 1
    }
  ]
};

const mockAdmin = {
  "url": "http://192.168.1.188:9099/api/user/1",
  "id": 1,
  "username": "admin",
  "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
  "is_superuser": true,
  "date_joined": "2020-04-20 13:52:42",
  "last_login": "2020-05-06 16:45:02",
  "real_name": "皮皮虾",
  "company": "",
  "addr": "硅谷亮城",
  "email": "",
  "tel": "",
  "area": null,
  "code": "",
  "identity": 1,
  "state": 1
};
const mockLeader = {
  "url": "http://192.168.1.188:9099/api/user/5",
  "id": 5,
  "username": "jiangxi",
  "avatar": "http://192.168.1.188:9099/media/img/1.jpeg",
  "is_superuser": false,
  "date_joined": "2020-04-28 10:53:06",
  "last_login": "2020-05-06 16:46:22",
  "real_name": "江西老表",
  "company": "刘佳琪科技有限公司",
  "addr": "sdfsdf",
  "email": "110@qq.com",
  "tel": "110",
  "area": 4,
  "area_name": "江西",
  "code": "JX0001",
  "identity": 2,
  "state": 1
};

let current:any;

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /api/user/current_user': (req: Request, res: Response) => {
    res.send(current)
  },
  // GET POST 可省略
  'GET /api/user':
    getUsers,
  'POST  /api/login/account': (req: Request, res: Response) => {
    const {password, username, type} = req.body;
    console.log(1111)
    if (password === '123456' && username === 'admin') {
      current = mockAdmin;
      res.send(mockAdmin);

      return;
    }
    if (password === '123456' && username === 'user') {
      current = mockLeader;
      res.send(mockLeader);
      return;
    }
    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },
  'POST /api/user/test_password': (req: Request, res: Response) => {
    res.send({"code": 200, "msg": "验证成功"});
  },
  'POST /api/user/*': (req: Request, res: Response) => {
    res.send("mock环境无法操作");
  },
  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  'GET  /api/user/user_detail_list': getUserDetailList,
};

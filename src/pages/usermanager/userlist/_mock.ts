import {Request, Response} from 'express';

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

const areaList =
  {
    "count": 4,
    "next": null,
    "previous": null,
    "results": [
      {
        "url": "http://192.168.1.188:9099/api/area/4",
        "id": 4,
        "company": "科技有限公司",
        "code": "JX0001",
        "area_name": "江西",
        "bill_id": "11112121212",
        "bill_addr": "12121212",
        "bill_phone": "11112121212",
        "bill_bank": "11112121212",
        "bill_account": "11112121212"
      },
      {
        "url": "http://192.168.1.188:9099/api/area/3",
        "id": 3,
        "company": "上海xxx公司",
        "code": "SH0001",
        "area_name": "上海",
        "bill_id": "",
        "bill_addr": "",
        "bill_phone": "",
        "bill_bank": "",
        "bill_account": ""
      },
      {
        "url": "http://192.168.1.188:9099/api/area/2",
        "id": 2,
        "company": "东方德康",
        "code": "SH2001",
        "area_name": "上海",
        "bill_id": "",
        "bill_addr": "",
        "bill_phone": "",
        "bill_bank": "",
        "bill_account": ""
      },
      {
        "url": "http://192.168.1.188:9099/api/area/1",
        "id": 1,
        "company": "北京北京休息休息",
        "code": "GD001",
        "area_name": "北京",
        "bill_id": "",
        "bill_addr": "",
        "bill_phone": "",
        "bill_bank": "",
        "bill_account": ""
      }
    ]
  };


export default {
  'POST /api/user': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法新建");
  },
  'GET /api/user': getUsers,
  'GET  /api/area': areaList,
  'PUT /api/user/*': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
  'DELETE /api/user/*': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
};

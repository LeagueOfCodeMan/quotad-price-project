import {Request, Response} from 'express';

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
  }
function getAreaList(req: Request, res: Response) {
  return res.json(areaList);
}

export default {
  'GET  /api/area': getAreaList,
  'POST  /api/area': (req: Request, res: Response) => {
    res.send("Mock环境无法新建");
  },
  'PUT  /api/area/*': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
  'DELETE /api/area/*': (req: Request, res: Response, u: string) => {
    res.send("Mock环境无法修改");
  },
};

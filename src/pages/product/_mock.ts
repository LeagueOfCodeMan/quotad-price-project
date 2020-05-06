import {Request, Response} from 'express';

const productList = {
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "url": "http://192.168.1.188:9099/api/product/2",
      "id": 2,
      "avatar": "http://192.168.1.188:9099/media/product/zhiyun_SRguDjm.png",
      "genre": 1,
      "pro_type": "YT-5000",
      "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；64GB内存；12个热插拔盘位；内含8块4TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，32TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "666666",
      "conf_list": [
        {
          "url": "http://192.168.1.188:9099/api/product/4",
          "id": 4,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-HDD4",
          "desc": "扩展4TB容量授权（含磁盘）",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "扩展4TB容量授权（含磁盘）",
          "conf_list": [],
          "is_required": true
        },
        {
          "url": "http://192.168.1.188:9099/api/product/13",
          "id": 13,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-10GED-SFP",
          "desc": "多模光纤双端口万兆以太网卡(SFP)",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "YT-10GED-SFP",
          "conf_list": [],
          "is_required": false
        },
        {
          "url": "http://192.168.1.188:9099/api/product/20",
          "id": 20,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 7,
          "pro_type": "YT-SEV-001",
          "desc": "基础服务( 7 x 24 三年 )\n -故障硬件更换服务（配件先行）\n -电话、邮件等非现场技术支持",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "sadsdfsdf",
          "conf_list": [],
          "is_required": true
        }
      ]
    },
    {
      "url": "http://192.168.1.188:9099/api/product/3",
      "id": 3,
      "avatar": "http://192.168.1.188:9099/media/product/zhiyun_qgC59UO.png",
      "genre": 1,
      "pro_type": "YT-8000",
      "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；128GB内存；12个热插拔盘位；内含12块6TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，72TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "66666",
      "conf_list": [
        {
          "url": "http://192.168.1.188:9099/api/product/4",
          "id": 4,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-HDD4",
          "desc": "扩展4TB容量授权（含磁盘）",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "扩展4TB容量授权（含磁盘）",
          "conf_list": [],
          "is_required": false
        },
        {
          "url": "http://192.168.1.188:9099/api/product/13",
          "id": 13,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-10GED-SFP",
          "desc": "多模光纤双端口万兆以太网卡(SFP)",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "YT-10GED-SFP",
          "conf_list": [],
          "is_required": false
        }
      ]
    },
    {
      "url": "http://192.168.1.188:9099/api/product/4",
      "id": 4,
      "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
      "genre": 6,
      "pro_type": "YT-HDD4",
      "desc": "扩展4TB容量授权（含磁盘）",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "扩展4TB容量授权（含磁盘）",
      "conf_list": []
    },
    {
      "url": "http://192.168.1.188:9099/api/product/13",
      "id": 13,
      "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
      "genre": 6,
      "pro_type": "YT-10GED-SFP",
      "desc": "多模光纤双端口万兆以太网卡(SFP)",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "YT-10GED-SFP",
      "conf_list": []
    },
    {
      "url": "http://192.168.1.188:9099/api/product/19",
      "id": 19,
      "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
      "genre": 2,
      "pro_type": "YT-1004",
      "desc": "* 全铝合金定制超小机箱；300W电源；64位八核16线程处理器；16GB内存；128G高速缓存；内含2块4TB SATA磁盘（RAID 1）；1个千兆以太网接口；4个USB3.0接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；内含全局统一管理平台；持续数据保护功能主模块；应急接管主模块；含智能数据同步、数据精简、重复数据删除；含断点续备、AES256传输数据加密，数据库及文件一致性代理，自动快照、副本归档、I/O记录等功能；\n* 内含Linux、Windows（含桌面版）客户端授权，客户端应急接管授权；4TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
      "leader_price": "3.00",
      "member_price": null,
      "second_price": null,
      "mark": "sadqsdasd",
      "conf_list": []
    },
    {
      "url": "http://192.168.1.188:9099/api/product/20",
      "id": 20,
      "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
      "genre": 7,
      "pro_type": "YT-SEV-001",
      "desc": "基础服务( 7 x 24 三年 )\n -故障硬件更换服务（配件先行）\n -电话、邮件等非现场技术支持",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "sadsdfsdf",
      "conf_list": []
    }
  ]
}

const productConfigList =
  [
    {
      "url": "http://192.168.1.188:9099/api/product/2",
      "id": 2,
      "avatar": "http://192.168.1.188:9099/media/product/zhiyun_SRguDjm.png",
      "genre": 1,
      "pro_type": "YT-5000",
      "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；64GB内存；12个热插拔盘位；内含8块4TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，32TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "666666",
      "conf_list": [
        {
          "url": "http://192.168.1.188:9099/api/product/4",
          "id": 4,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-HDD4",
          "desc": "扩展4TB容量授权（含磁盘）",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "扩展4TB容量授权（含磁盘）",
          "conf_list": [],
          "is_required": true
        },
        {
          "url": "http://192.168.1.188:9099/api/product/13",
          "id": 13,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-10GED-SFP",
          "desc": "多模光纤双端口万兆以太网卡(SFP)",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "YT-10GED-SFP",
          "conf_list": [],
          "is_required": false
        },
        {
          "url": "http://192.168.1.188:9099/api/product/20",
          "id": 20,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 7,
          "pro_type": "YT-SEV-001",
          "desc": "基础服务( 7 x 24 三年 )\n -故障硬件更换服务（配件先行）\n -电话、邮件等非现场技术支持",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "sadsdfsdf",
          "conf_list": [],
          "is_required": true
        }
      ],
      "is_required": true
    },
    {
      "url": "http://192.168.1.188:9099/api/product/3",
      "id": 3,
      "avatar": "http://192.168.1.188:9099/media/product/zhiyun_qgC59UO.png",
      "genre": 1,
      "pro_type": "YT-8000",
      "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；128GB内存；12个热插拔盘位；内含12块6TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，72TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
      "leader_price": "1.00",
      "member_price": null,
      "second_price": null,
      "mark": "66666",
      "conf_list": [
        {
          "url": "http://192.168.1.188:9099/api/product/4",
          "id": 4,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-HDD4",
          "desc": "扩展4TB容量授权（含磁盘）",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "扩展4TB容量授权（含磁盘）",
          "conf_list": [],
          "is_required": false
        },
        {
          "url": "http://192.168.1.188:9099/api/product/13",
          "id": 13,
          "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
          "genre": 6,
          "pro_type": "YT-10GED-SFP",
          "desc": "多模光纤双端口万兆以太网卡(SFP)",
          "leader_price": "1.00",
          "member_price": null,
          "second_price": null,
          "mark": "YT-10GED-SFP",
          "conf_list": [],
          "is_required": false
        }
      ],
      "is_required": false
    }
  ];

function getProductList(req: Request, res: Response) {
  const params = req.query;
  console.log(params);
  return res.json(productList);
}


export default {
  'GET  /api/product': getProductList,
  'DELETE  /api/product/*': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
  'POST  /api/product': (req: Request, res: Response) => {
    res.send("Mock环境无法新建");
  },
  'POST  /api/product/*': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
  'GET  /api/product/count_statistics': (req: Request, res: Response) => {
    res.send({
      "0": 6, "1": 2, "2": 1, "3": 0, "4": 0, "5": 0, "6": 2, "7": 1, "8": 0
    });
  },
  'GET  /api/product/*/second_user_list': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
  'GET  /api/product/*/get_product_list': (req: Request, res: Response) => {
    res.send(productConfigList);
  },
};

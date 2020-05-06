import { Request, Response } from 'express';

const orderList = {
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "url": "http://192.168.1.188:9099/api/order/9",
      "label": 2,
      "create_time": "2020-04-30 16:32:57",
      "create_user": "老表1号",
      "order_user": "江西老表",
      "project_name": "xiangmu",
      "project_desc": "xiangmu",
      "area": "江西",
      "order_number": "JX00010014",
      "order_status": 1,
      "addr": "111112121212",
      "company": "刘佳琪科技有限公司2",
      "bill_account": "11112121212",
      "bill_addr": "12121212",
      "bill_bank": "11112121212",
      "bill_id": "11112121212",
      "bill_phone": "11112121212",
      "contact": "11112121212",
      "contract_addr": "11112121212",
      "contract_contact": "11112121212",
      "contract_phone": "11112121212",
      "phone": "11112121212",
      "order_leader_price": "2.00",
      "order_leader_quota": "6.00",
      "order_sell_price": null,
      "order_sell_quota": null,
      "project": [
        {
          "url": "http://192.168.1.188:9099/api/project/14",
          "id": 14,
          "project_id": "JX00010014",
          "company": "科技有限公司",
          "bill_id": "11112121212",
          "bill_addr": "12121212",
          "bill_phone": "11112121212",
          "bill_bank": "11112121212",
          "bill_account": "11112121212",
          "username": "jiangxi1",
          "real_name": "老表1号",
          "user_name": "xiangmu",
          "create_time": "2020-04-30 15:10:13",
          "project_name": "xiangmu",
          "project_desc": "xiangmu",
          "user_addr": "",
          "user_iphone": "",
          "user_contact": "",
          "leader_total_quota": "4.00",
          "sell_total_quota": null,
          "leader_total_price": null,
          "sell_total_price": null,
          "pro_status": 4,
          "product_list": [
            {
              "id": 54,
              "sn": "5422222221",
              "create_time": "2020-04-30 16:32:57",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/2",
                "id": 2,
                "avatar": "http://192.168.1.188:9099/media/product/zhiyun_SRguDjm.png",
                "genre": 1,
                "pro_type": "YT-5000",
                "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；64GB内存；12个热插拔盘位；内含8块4TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，32TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "1.00",
                "member_price": null,
                "second_price": null,
                "mark": "666666"
              },
              "count": 1,
              "leader_quota": "1.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            },
            {
              "id": 55,
              "sn": "dsasdasdasdasd",
              "create_time": "2020-04-30 16:32:57",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/2",
                "id": 2,
                "avatar": "http://192.168.1.188:9099/media/product/zhiyun_SRguDjm.png",
                "genre": 1,
                "pro_type": "YT-5000",
                "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；64GB内存；12个热插拔盘位；内含8块4TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，32TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "1.00",
                "member_price": null,
                "second_price": null,
                "mark": "666666"
              },
              "count": 1,
              "leader_quota": "3.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": [
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
                  "count": 1
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
                  "count": 1
                }
              ]
            }
          ]
        }
      ],
      "other_list": [
        {
          "id": 9,
          "pro_type": "1",
          "price": "1.00",
          "count": 1
        }
      ]
    },
    {
      "id": 2,
      "url": "http://192.168.1.188:9099/api/order/8",
      "label": 1,
      "create_time": "2020-04-30 15:11:13",
      "create_user": "老表1号",
      "order_user": "江西老表",
      "project_name": "xiangmu2",
      "project_desc": "xiangmu",
      "area": "江西",
      "order_number": "JX00010015",
      "order_status": 2,
      "addr": "xiangmuxiangmuxiangmu",
      "company": null,
      "bill_account": "11112121212",
      "bill_addr": "12121212",
      "bill_bank": "11112121212",
      "bill_id": "11112121212",
      "bill_phone": "11112121212",
      "contact": "xiangmu",
      "contract_addr": "xiangmuxiangmuxiangmu",
      "contract_contact": "xiangmu",
      "contract_phone": "xiangmu",
      "phone": "xiangmu",
      "order_leader_price": "4.00",
      "order_leader_quota": "6.00",
      "order_sell_price": null,
      "order_sell_quota": null,
      "project": [
        {
          "url": "http://192.168.1.188:9099/api/project/15",
          "id": 15,
          "project_id": "JX00010015",
          "company": "刘佳琪科技有限公司",
          "bill_id": "11112121212",
          "bill_addr": "12121212",
          "bill_phone": "11112121212",
          "bill_bank": "11112121212",
          "bill_account": "11112121212",
          "username": "jiangxi1",
          "real_name": "老表1号",
          "user_name": "xiangmu",
          "create_time": "2020-04-30 15:10:34",
          "project_name": "xiangmu2",
          "project_desc": "xiangmu",
          "user_addr": "",
          "user_iphone": "",
          "user_contact": "",
          "leader_total_quota": "4.00",
          "sell_total_quota": null,
          "leader_total_price": null,
          "sell_total_price": null,
          "pro_status": 4,
          "product_list": [
            {
              "id": 52,
              "sn": "523",
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/19",
                "id": 19,
                "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
                "genre": 2,
                "pro_type": "YT-1004",
                "desc": "* 全铝合金定制超小机箱；300W电源；64位八核16线程处理器；16GB内存；128G高速缓存；内含2块4TB SATA磁盘（RAID 1）；1个千兆以太网接口；4个USB3.0接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；内含全局统一管理平台；持续数据保护功能主模块；应急接管主模块；含智能数据同步、数据精简、重复数据删除；含断点续备、AES256传输数据加密，数据库及文件一致性代理，自动快照、副本归档、I/O记录等功能；\n* 内含Linux、Windows（含桌面版）客户端授权，客户端应急接管授权；4TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "3.00",
                "member_price": null,
                "second_price": null,
                "mark": "sadqsdasd"
              },
              "count": 1,
              "leader_quota": "3.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            },
            {
              "id": 53,
              "sn": null,
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/3",
                "id": 3,
                "avatar": "http://192.168.1.188:9099/media/product/zhiyun_qgC59UO.png",
                "genre": 1,
                "pro_type": "YT-8000",
                "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；128GB内存；12个热插拔盘位；内含12块6TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，72TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "1.00",
                "member_price": null,
                "second_price": null,
                "mark": "66666"
              },
              "count": 1,
              "leader_quota": "1.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            }
          ]
        }
      ],
      "other_list": [
        {
          "id": 8,
          "pro_type": "1",
          "price": "1.00",
          "count": 1
        }
      ]
    },
    {
      "id": 3,
      "url": "http://192.168.1.188:9099/api/order/8",
      "label": 1,
      "create_time": "2020-04-30 15:11:13",
      "create_user": "老表1号",
      "order_user": "江西老表",
      "project_name": "xiangmu2",
      "project_desc": "xiangmu",
      "area": "江西",
      "order_number": "JX00010015",
      "order_status": 3,
      "addr": "xiangmuxiangmuxiangmu",
      "company": null,
      "bill_account": "11112121212",
      "bill_addr": "12121212",
      "bill_bank": "11112121212",
      "bill_id": "11112121212",
      "bill_phone": "11112121212",
      "contact": "xiangmu",
      "contract_addr": "xiangmuxiangmuxiangmu",
      "contract_contact": "xiangmu",
      "contract_phone": "xiangmu",
      "phone": "xiangmu",
      "order_leader_price": "4.00",
      "order_leader_quota": "6.00",
      "order_sell_price": null,
      "order_sell_quota": null,
      "project": [
        {
          "url": "http://192.168.1.188:9099/api/project/15",
          "id": 15,
          "project_id": "JX00010015",
          "company": "刘佳琪科技有限公司",
          "bill_id": "11112121212",
          "bill_addr": "12121212",
          "bill_phone": "11112121212",
          "bill_bank": "11112121212",
          "bill_account": "11112121212",
          "username": "jiangxi1",
          "real_name": "老表1号",
          "user_name": "xiangmu",
          "create_time": "2020-04-30 15:10:34",
          "project_name": "xiangmu2",
          "project_desc": "xiangmu",
          "user_addr": "",
          "user_iphone": "",
          "user_contact": "",
          "leader_total_quota": "4.00",
          "sell_total_quota": null,
          "leader_total_price": null,
          "sell_total_price": null,
          "pro_status": 4,
          "product_list": [
            {
              "id": 52,
              "sn": "523",
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/19",
                "id": 19,
                "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
                "genre": 2,
                "pro_type": "YT-1004",
                "desc": "* 全铝合金定制超小机箱；300W电源；64位八核16线程处理器；16GB内存；128G高速缓存；内含2块4TB SATA磁盘（RAID 1）；1个千兆以太网接口；4个USB3.0接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；内含全局统一管理平台；持续数据保护功能主模块；应急接管主模块；含智能数据同步、数据精简、重复数据删除；含断点续备、AES256传输数据加密，数据库及文件一致性代理，自动快照、副本归档、I/O记录等功能；\n* 内含Linux、Windows（含桌面版）客户端授权，客户端应急接管授权；4TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "3.00",
                "member_price": null,
                "second_price": null,
                "mark": "sadqsdasd"
              },
              "count": 1,
              "leader_quota": "3.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            },
            {
              "id": 53,
              "sn": null,
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/3",
                "id": 3,
                "avatar": "http://192.168.1.188:9099/media/product/zhiyun_qgC59UO.png",
                "genre": 1,
                "pro_type": "YT-8000",
                "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；128GB内存；12个热插拔盘位；内含12块6TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，72TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "1.00",
                "member_price": null,
                "second_price": null,
                "mark": "66666"
              },
              "count": 1,
              "leader_quota": "1.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            }
          ]
        }
      ],
      "other_list": [
        {
          "id": 8,
          "pro_type": "1",
          "price": "1.00",
          "count": 1
        }
      ]
    },
    {
      "id": 4,
      "url": "http://192.168.1.188:9099/api/order/8",
      "label": 1,
      "create_time": "2020-04-30 15:11:13",
      "create_user": "老表1号",
      "order_user": "江西老表",
      "project_name": "xiangmu2",
      "project_desc": "xiangmu",
      "area": "江西",
      "order_number": "JX00010015",
      "order_status": 4,
      "addr": "xiangmuxiangmuxiangmu",
      "company": null,
      "bill_account": "11112121212",
      "bill_addr": "12121212",
      "bill_bank": "11112121212",
      "bill_id": "11112121212",
      "bill_phone": "11112121212",
      "contact": "xiangmu",
      "contract_addr": "xiangmuxiangmuxiangmu",
      "contract_contact": "xiangmu",
      "contract_phone": "xiangmu",
      "phone": "xiangmu",
      "order_leader_price": "4.00",
      "order_leader_quota": "6.00",
      "order_sell_price": null,
      "order_sell_quota": null,
      "project": [
        {
          "url": "http://192.168.1.188:9099/api/project/15",
          "id": 15,
          "project_id": "JX00010015",
          "company": "刘佳琪科技有限公司",
          "bill_id": "11112121212",
          "bill_addr": "12121212",
          "bill_phone": "11112121212",
          "bill_bank": "11112121212",
          "bill_account": "11112121212",
          "username": "jiangxi1",
          "real_name": "老表1号",
          "user_name": "xiangmu",
          "create_time": "2020-04-30 15:10:34",
          "project_name": "xiangmu2",
          "project_desc": "xiangmu",
          "user_addr": "",
          "user_iphone": "",
          "user_contact": "",
          "leader_total_quota": "4.00",
          "sell_total_quota": null,
          "leader_total_price": null,
          "sell_total_price": null,
          "pro_status": 4,
          "product_list": [
            {
              "id": 52,
              "sn": "523",
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/19",
                "id": 19,
                "avatar": "http://192.168.1.188:9099/media/product/1.jpeg",
                "genre": 2,
                "pro_type": "YT-1004",
                "desc": "* 全铝合金定制超小机箱；300W电源；64位八核16线程处理器；16GB内存；128G高速缓存；内含2块4TB SATA磁盘（RAID 1）；1个千兆以太网接口；4个USB3.0接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；内含全局统一管理平台；持续数据保护功能主模块；应急接管主模块；含智能数据同步、数据精简、重复数据删除；含断点续备、AES256传输数据加密，数据库及文件一致性代理，自动快照、副本归档、I/O记录等功能；\n* 内含Linux、Windows（含桌面版）客户端授权，客户端应急接管授权；4TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "3.00",
                "member_price": null,
                "second_price": null,
                "mark": "sadqsdasd"
              },
              "count": 1,
              "leader_quota": "3.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            },
            {
              "id": 53,
              "sn": null,
              "create_time": "2020-04-30 15:11:13",
              "production": {
                "url": "http://192.168.1.188:9099/api/product/3",
                "id": 3,
                "avatar": "http://192.168.1.188:9099/media/product/zhiyun_qgC59UO.png",
                "genre": 1,
                "pro_type": "YT-8000",
                "desc": "* 2U机架式存储设备；550W（1+1）冗余电源；两颗64六核处理器；128GB内存；12个热插拔盘位；内含12块6TB 7200转企业级磁盘；4个千兆以太网接口。\n--------------------------------------------------------------------------------\n* 内嵌云态业务保护系统；持续数据保护功能主模块；应急接管主模块；含智能数据同步，重复数据删除，数据库一致性代理，自动快照、I/O记录等功能；\n* 内含无数量限制Linux、Windows（含桌面版）客户端数量授权，无限数量客户端应急接管授权，72TB数据保护容量授权；\n* 远程容灾复制模块可另行购买；",
                "leader_price": "1.00",
                "member_price": null,
                "second_price": null,
                "mark": "66666"
              },
              "count": 1,
              "leader_quota": "1.00",
              "sell_quota": null,
              "leader_price": null,
              "sell_price": null,
              "user": 6,
              "conf_par": []
            }
          ]
        }
      ],
      "other_list": [
        {
          "id": 8,
          "pro_type": "1",
          "price": "1.00",
          "count": 1
        }
      ]
    }
  ]
};

function getOrderList(req: Request, res: Response) {
  return res.json(orderList);
}


function postOrderList(req: Request, res: Response) {
  const { /* url = '', */ body } = req;
  // const params = getUrlParams(url);
  const { method, id } = body;
  // const count = (params.count * 1) || 20;
  let result = orderList?.results;

  switch (method) {
    case 'delete':
      result = result.filter(item => item.id !== id);
      break;
    case 'update':
      result.forEach((item, i) => {
        if (item.id === id) {
          result[i] = { ...item, ...body };
        }
      });
      break;
    case 'post':
      result.unshift({
        ...body,
        id: `fake-list-${result.length}`,
        createdAt: new Date().getTime(),
      });
      break;
    default:
      break;
  }

  return res.json(result);
}

export default {
  'GET  /api/order': getOrderList,
  'POST  /api/order/*/oper_order': (req: Request, res: Response) => {
    res.send("Mock环境无法操作");
  },
  'POST  /api/order/*/modify_sn': (req: Request, res: Response) => {
    res.send("Mock环境无法操作");
  },
  'POST  /api/order/*/modify_price': (req: Request, res: Response) => {
    res.send("Mock环境无法修改");
  },
};

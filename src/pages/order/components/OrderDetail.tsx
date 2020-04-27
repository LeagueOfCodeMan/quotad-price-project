import React, {FC, useRef, useState} from 'react';
import {Alert, Avatar, Card, Descriptions, Input, Modal, Table, Tag, Typography, List} from 'antd';
import {CurrentUser} from "@/models/user";

import {productType} from "@/utils/utils";
import _ from 'lodash';
import {OrderListItem, OtherListItem} from "@/pages/order/data";
import styles from '../style.less';
import {ProductBaseListItem} from "@/pages/product/data";
import {ColumnsType} from "antd/lib/table";
import {ProjectProductionInfoItem} from "@/pages/project/data";
import {PaginationConfig} from "antd/lib/pagination";

const {Search} = Input;
const {confirm} = Modal;
const {Text} = Typography;

interface BasicListProps {
  current: OrderListItem;
  currentUser: CurrentUser;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}

const ListContentWrapper = ({item}: { item: ProjectProductionInfoItem }) => {
  const {} = item;
  return (
    <Descriptions bordered column={4} size="small">
      <Descriptions.Item label="产品图" span={1}>
        <Avatar src={item?.production?.avatar || ''} shape="square"
                size="large"/>
      </Descriptions.Item>
      <Descriptions.Item label="产品名称" span={1}>
        <Text style={{color: '#181818'}}>{productType(item?.production?.genre)}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="型号" span={1}>
        <Text style={{color: '#1890FF'}}>{item?.production?.pro_type}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="备注" span={1}>
        <Text style={{color: '#181818'}}>{item?.production?.mark}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="数量" span={1}>
        <Text style={{color: '#181818'}}>{item?.count}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="采购总价" span={1}>
        <Text style={{color: '#181818'}}>{item?.leader_quota}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="项目描述" span={2}>
        {item?.production?.desc?.split("\n")?.map((o, i) => {
          return (
            <div key={i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
          )
        })}
      </Descriptions.Item>
      <Descriptions.Item label="附件清单" span={4}>
        <ListContent conf_par={item?.conf_par}/>
      </Descriptions.Item>
    </Descriptions>
  )
}

const ListContent = ({
                       conf_par
                     }: {
  conf_par: ProductBaseListItem[];
}) => {
  const columns: ColumnsType<ProductBaseListItem> = [

    {
      title: '产品图',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 100,
      render: (text) => {
        return (
          <div>
            <Avatar src={text || ''} shape="square"
                    size="large"/>
          </div>
        )
      },
    },
    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
      width: 100,
      render: (text: number) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{productType(text)}</Text>
          </div>
        )
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      width: 100,
      render: (text: string) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '采购价格',
      dataIndex: 'leader_price',
      key: 'leader_price',
      width: 120,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>{'¥ ' + text}</Text>
          </div>
        );
      },
    },
    {
      title: '描述',
      key: 'desc',
      dataIndex: 'desc',
      render: (text: string) => (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          {text?.split("\n")?.map((o, i) => {
            return (
              <div><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </div>
      ),
    },
    {
      title: '备注',
      dataIndex: 'mark',
      key: 'mark',
      width: 50,
      render: (text) => {
        return (
          <div>
            <Text type="danger">{text}</Text>
          </div>
        )
      },
    },
  ];
  return (
    <div className={styles.listContentWrapper}>
      <Table
        bordered size="small"
        rowKey={record => record?.id}
        columns={columns}
        pagination={false}
        dataSource={conf_par || []}
      />
    </div>
  )
};

const Content = ({data, currentUser}: {
  data: OrderListItem; currentUser: CurrentUser;
}) => {
  const {
    create_user, order_user, area, leader_company,
    project_name, project_desc, company, order_status,
    addr, contact, phone, create_time,
    bill_id, bill_addr, bill_phone, bill_bank, bill_account,
    contract_addr, contract_contact, contract_phone,
    order_leader_price,
    order_leader_quota, project, other_list
  } = data;
  const {identity} = currentUser;
  const product_list = _.result(_.head(project), 'product_list') as ProjectProductionInfoItem[];
  let state: JSX.Element;
  switch (order_status) {
    case 1:
      state = <Tag>待确认</Tag>;
      break;
    case 2:
      state = <Tag>已确认</Tag>;
      break;
    case 3:
      state = <Tag>已终止</Tag>;
      break;
    default:
      state = <Tag>已完成</Tag>;
      break;
  }

  const columns: ColumnsType<OtherListItem> = [
    {
      title: '产品名称',
      dataIndex: 'pro_type',
      key: 'pro_type',
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '采购单价',
      dataIndex: 'price',
      key: 'price',
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>{'¥ ' + text}</Text>
          </div>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>{text}</Text>
          </div>
        );
      },
    },
  ];
  /**
   * 基础信息：状态、地区、组长、组长单位、项目名称，项目描述，销售总价，成交总价，订单创建时间
   * 收货信息，开票信息，合同、发票收件信息，
   * 项目产品信息(产品库中)
   * 项目其他附加购买产品信息
   */

  return (
    <div className={styles.listContentWrapper}>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="基本信息"
          type="success"
          closable
        />
      </div>

      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="合同方" span={1}>
          <Text style={{color: '#FF6A00'}}>{company}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="订单总价" span={1}>
          <>
            <Text style={{color: '#1890FF'}}>销售总价：</Text>
            <Text style={{color: '#FF6A00'}}>{order_leader_quota}</Text>
            <br/>
            {
              order_leader_price ?
                <>
                  <Text style={{color: '#1890FF'}}>成交总价：</Text>
                  <Text style={{color: '#FF6A00'}}>{order_leader_price}</Text>
                </> : null
            }
          </>
        </Descriptions.Item>
        <Descriptions.Item label="订单创建时间" span={1}>
          <Text style={{color: '#1890FF'}}>{create_time}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="状态" span={1}>
          <Text style={{color: '#181818'}}>{state}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="项目基础信息" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>项目名称：</Text>
            <Text style={{color: '#FF6A00'}}>{project_name}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>项目创建人：</Text>
            <Text style={{color: '#FF6A00'}}>{create_user}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>地区：</Text>
            <Text style={{color: '#FF6A00'}}>{area}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>组长：</Text>
            <Text style={{color: '#FF6A00'}}>{order_user}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>组长单位：</Text>
            <Text style={{color: '#FF6A00'}}>{leader_company}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="项目描述" span={2}>
          {project_desc?.split("\n")?.map((o, i) => {
            return (
              <div key={i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </Descriptions.Item>
        <Descriptions.Item label="收货信息" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>收货地址：</Text>
            <Text style={{color: '#FF6A00'}}>{addr}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>联系人：</Text>
            <Text style={{color: '#FF6A00'}}>{contact}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>联系电话：</Text>
            <Text style={{color: '#FF6A00'}}>{phone}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="开票信息" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>名称：</Text>
            <Text style={{color: '#FF6A00'}}>{company}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>税号：</Text>
            <Text style={{color: '#FF6A00'}}>{bill_id}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>地址：</Text>
            <Text style={{color: '#FF6A00'}}>{bill_addr}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>电话：</Text>
            <Text style={{color: '#FF6A00'}}>{bill_phone}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>开户行：</Text>
            <Text style={{color: '#FF6A00'}}>{bill_bank}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>账号：</Text>
            <Text style={{color: '#FF6A00'}}>{bill_account}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="发票、合同收件信息" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>收件地址：</Text>
            <Text style={{color: '#FF6A00'}}>{contract_addr}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>联系人：</Text>
            <Text style={{color: '#FF6A00'}}>{contract_contact}</Text>
            <br/>
            <Text style={{color: '#1890FF'}}>电话：</Text>
            <Text style={{color: '#FF6A00'}}>{contract_phone}</Text>
          </>
        </Descriptions.Item>

      </Descriptions>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="产品清单"
          type="info"
          closable
        />
      </div>
      <List
        size="large"
        rowKey={record => record.id}
        pagination={false}
        dataSource={product_list || []}
        renderItem={(item: ProjectProductionInfoItem) => (
          <List.Item
          >
            <div>
              <ListContentWrapper item={item}/>
            </div>
          </List.Item>
        )}
      >
      </List>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="自定义采购清单"
          type="info"
          closable
        />
      </div>
      <Table
        bordered size="small"
        rowKey={record => record?.id}
        columns={columns}
        pagination={false}
        dataSource={other_list || []}
      />
    </div>
  )
};

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  mem_state?: 1 | 2;
  conf_name?: string;

  [propName: string]: any;
}

const OrderDetail: FC<BasicListProps> = props => {
  const {
    current,
    currentUser,
  } = props;
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 1
  });
  console.log(current);
  const paginationProps = {
    showQuickJumper: true,
    pageSize: 1,
    total: 1,
    size: 'small',
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    }
  };

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
        >
          <Content data={current} currentUser={currentUser}/>
        </Card>
      </div>

    </div>
  );
};

export default OrderDetail;

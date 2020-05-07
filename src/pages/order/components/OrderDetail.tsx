import React, {FC} from 'react';
import {Alert, Avatar, Card, Descriptions, Divider, List, Table, Tag, Typography} from 'antd';
import {CurrentUser} from "@/models/user";
import {IdentityType, productType, ValidatePwdResult} from "@/utils/utils";
import _ from 'lodash';
import {OrderListItem, OtherListItem} from "@/pages/order/data";
import styles from '../style.less';
import {ProductBaseListItem} from "@/pages/product/data";
import {ColumnsType} from "antd/lib/table";
import {ProjectProductionInfoItem} from "@/pages/project/data";
import Ellipsis from "@/components/Ellipsis";
import {modifyOrder, modifyProductSN} from "@/pages/order/service";

const {Paragraph} = Typography;
const {Text} = Typography;

interface BasicListProps {
  current: OrderListItem;
  currentUser: CurrentUser;
  reload: () => void;
}

const ListContentWrapper = ({item, order_status, identity, id, reload}:
                              {
                                item: ProjectProductionInfoItem; identity: IdentityType;
                                id: number; order_status: 1 | 2 | 3 | 4 | undefined;
                                reload: () => void;
                              }) => {
  const onChangeSN = async (str: string) => {
    const response = await modifyProductSN({id, data: {id: item?.id, sn: str}});
    const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
    if (success) {
      reload();
    }
  };
  const projectDesc = (
    <p style={{marginBottom: '0px'}}>
      {item?.production?.desc?.split("\n")?.map((o, i) => {
        return (
          <span key={i}>{o}<br/></span>
        )
      })}
    </p>
  );
  return (
    <Descriptions bordered column={5} size="small">
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
      <Descriptions.Item label="SN码" span={1}>
        <Paragraph
          editable={identity === 1 && order_status === 2 ? {onChange: onChangeSN} : false}>{item?.sn || ''}</Paragraph>
      </Descriptions.Item>
      <Descriptions.Item label="数量" span={1}>
        <Text style={{color: '#181818'}}>{item?.count}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="采购总价" span={1}>
        <Text style={{color: '#FF6A00'}}>{'¥ ' + item?.leader_quota}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="项目描述" span={3}>

        <Ellipsis tooltip lines={1}>
          {projectDesc}
        </Ellipsis>
      </Descriptions.Item>
      {_.head(item?.conf_par) ?
        <Descriptions.Item label="附件清单" span={5}>
          <ListContent conf_par={item?.conf_par}/>
        </Descriptions.Item> : null
      }

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
      width: 50,
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
      title: '数量',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '采购总价',
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
        showHeader={false}
        bordered={false} size="small"
        rowKey={record => record?.id}
        columns={columns}
        pagination={false}
        dataSource={conf_par || []}
      />
    </div>
  )
};

const Content = ({data, currentUser, reload}: {
  data: OrderListItem; currentUser: CurrentUser; reload: () => void;
}) => {
  const {
    create_user, order_user, id, company, order_number,
    project_name, project_desc, order_status,
    addr, contact, phone, create_time,
    bill_id, bill_addr, bill_phone, bill_bank, bill_account,
    contract_addr, contract_contact, contract_phone,
    order_leader_price,
    order_leader_quota, project, other_list, mark,
  } = data;
  const {identity} = currentUser;
  const product_list = _.result(_.head(project), 'product_list') as ProjectProductionInfoItem[];
  let state: JSX.Element;
  switch (order_status) {
    case 1:
      state = <Tag color="cyan">待确认</Tag>;
      break;
    case 2:
      state = <Tag color="blue">已确认</Tag>;
      break;
    case 3:
      state = <Tag color="red">已终止</Tag>;
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
  const onChangeMark = async (str: string) => {
    const response = await modifyOrder({id, data: {mark: str}});
    const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
    if (success) {
      reload();
    }
  };
  return (
    <div className={styles.listContentWrapper}>
      {
        identity === 1 ?

          <div style={{margin: '10px 0'}}>
            <Alert
              message={
                <div style={{display: 'flex'}}>
                  <div>订单备注：</div>
                  <Paragraph
                    editable={order_status === 2 ? {onChange: onChangeMark} : false}>{mark || ''}</Paragraph></div>}
              type="info"
              closable
            />
          </div>
          : null
      }
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
            <Text style={{color: '#FF6A00'}}>{'¥' + order_leader_quota}</Text>
            <Divider type="vertical"/>
            {
              order_leader_price ?
                <>
                  <Text style={{color: '#1890FF'}}>成交总价：</Text>
                  <Text style={{color: '#FF6A00'}}>{'¥' + order_leader_price}</Text>
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
          <div style={{display: 'flex'}}>
            <div style={{marginRight: '5px'}}>
              <Text>项目名称：</Text>
              <Text>{project_name}</Text>
              <br/>
              <Text>项目编号：</Text>
              <Text>{order_number}</Text>
            </div>
            <div>
              <Text>下单人：</Text>
              <Text>{order_user}</Text>
              <br/>
              <Text>填报人：</Text>
              <Text>{create_user}</Text>
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="项目描述" span={2}>
          {project_desc?.split("\n")?.map((o, i) => {
            return (
              <div key={id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </Descriptions.Item>
        <Descriptions.Item label="收货信息" span={2}>
          <>
            <Text>收货地址：</Text>
            <Text>{addr}</Text>
            <br/>
            <Text>联系人：</Text>
            <Text>{contact}</Text>
            <br/>
            <Text>联系电话：</Text>
            <Text>{phone}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="开票信息" span={2}>
          <div>
            <Text>税号：</Text>
            <Text>{bill_id}</Text>
          </div>
          <div style={{display: 'flex'}}>
            <div style={{marginRight: '5px'}}>
              <Text>地址：</Text>
              <Text>{bill_addr}</Text>
              <br/>
              <Text>电话：</Text>
              <Text>{bill_phone}</Text>
              <br/>
            </div>
            <div>
              <Text>开户行：</Text>
              <Text>{bill_bank}</Text>
              <br/>
              <Text>账号：</Text>
              <Text>{bill_account}</Text>
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="发票、合同收件信息" span={2}>
          <>
            <Text>收件地址：</Text>
            <Text>{contract_addr}</Text>
            <Divider type="vertical"/>
            <Text>联系人：</Text>
            <Text>{contract_contact}</Text>
            <Divider type="vertical"/>
            <Text>电话：</Text>
            <Text>{contract_phone}</Text>
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
        rowKey={record => record.id?.toString()}
        pagination={false}
        dataSource={product_list || []}
        renderItem={(item: ProjectProductionInfoItem) => (
          <List.Item
          >
            <div>
              <ListContentWrapper item={item} order_status={order_status} identity={identity as IdentityType} id={id}
                                  reload={reload}/>
            </div>
          </List.Item>
        )}
      >
      </List>
      {_.head(other_list) ?
        <>
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
        </> : null
      }


    </div>
  )
};

const OrderDetail: FC<BasicListProps> = props => {
  const {
    current,
    currentUser,
    reload
  } = props;

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
        >
          <Content data={current} currentUser={currentUser} reload={reload}/>
        </Card>
      </div>

    </div>
  );
};

export default OrderDetail;

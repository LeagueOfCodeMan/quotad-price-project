import React, {FC, useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  List,
  message,
  Modal,
  Space,
  Table,
  Typography,
  Menu
} from 'antd';
import {CurrentUser} from '@/models/user';
import {calculateOtherList, handleProjectListItemData, ResultType, ValidatePwdResult} from '@/utils/utils';
import _ from 'lodash';
import {OrderListItem} from '@/pages/order/data';
import styles from '../style.less';
import {ProductBaseListItem} from '@/pages/product/data';
import {ColumnsType} from 'antd/lib/table';
import {ProjectProductionInfoItem} from '@/pages/project/data';
import Ellipsis from '@/components/Ellipsis';
import {changeOrderStatus, modifyOrder, modifyProductSN, modifyTotalPrice} from '@/pages/order/service';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import {DownOutlined, ExclamationCircleOutlined} from '@ant-design/icons/lib';
import ValidatePassword from '@/components/ValidatePassword';
import {testPassword} from '@/services/user';
import PublishModal from '@/pages/order/components/PublishModal';
import ModifyProjectDetail from '@/pages/order/components/ModifyProjectDetail';

enum ValidateType {
  CONFIRM = 'CONFIRM',
  TERMINATION = 'TERMINATION',
  COMPLETE = 'COMPLETE',
  PRICE = 'PRICE',
  PROJECT = 'PROJECT',
}

const {Paragraph} = Typography;
const {Text} = Typography;

interface BasicListProps {
  current: OrderListItem;
  currentUser: CurrentUser;
  reload: () => void;
}

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
  const [dataSource, setDataSource] = useState<{ uuid: string; data: ProductBaseListItem[] }[]>([]);
  const product_list = _.result(_.head(project), 'product_list') as ProjectProductionInfoItem[];
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [modifyVisible, setModifyVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<OrderListItem>>({});

  useEffect(() => {
    const newDt = handleProjectListItemData(product_list);
    console.log(newDt);
    setDataSource(newDt);
  }, [product_list]);

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

  const columnsOtherList: ColumnsType<any> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 160,
      render: (text: string) => {
        return (
          <div>
            <Ellipsis tooltip lines={1}>
              {text}
            </Ellipsis>
          </div>
        );
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      width: 120,
      align: 'center',
      render: (text: string) => {
        return (
          <div>
            <Ellipsis tooltip lines={1}>
              {text}
            </Ellipsis>
          </div>
        );
      },
    },
    {
      title: '产品描述',
      dataIndex: 'desc',
      width: 190,
      render: (text) => {
        return (
          <div style={{textAlign: 'left'}}>
            <Ellipsis tooltip lines={1}>
              <p style={{marginBottom: '0px'}}>
                {(text as string)?.split('\n')?.map((o, i) => {
                  return (
                    <span key={i}>{o}<br/></span>
                  );
                })}
              </p>
            </Ellipsis>
          </div>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 170,
      align: 'right',
      render: (text: any) => {
        const price = parseFloat(text || '');
        return (
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <StatisticWrapper value={price}/>
          </div>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 170,
      align: 'center',
      render: (value, row, index) => {
        const obj: {
          props: { rowSpan?: number; [propName: string]: any; };
          [propName: string]: any;
        } = {
          children: <div>
            <StatisticWrapper value={calculateOtherList(other_list)}/>
          </div>,
          props: {},
        };
        if (other_list?.length > 0) {
          obj.props.rowSpan = other_list?.length;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ];

  const onChangeSN = async (str: string, item: ProductBaseListItem) => {
    const response = await modifyProductSN({id, data: {id: item?.id, sn: str}});
    const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
    if (success) {
      reload();
    }
  };

  const handleMenuClick = (e: { key: string; }) => {
    if (e?.key === '1') {
      console.log('打印合同');
    } else if (e?.key === '2') {
      console.log('上传合同');
    }
  };

  const operationButtons = () => {
    const template2: JSX.Element[] = [];
    // order_status 1 ： 可终止，同意，拒绝
    // 2：无操作
    // 3：已完成，打印合同，上传合同
    const confirm = (<Button
      type="primary"
      onClick={() => operationClick(ValidateType.CONFIRM)}
    >
      同意
    </Button>);
    const complete = (<Button
      type="primary"
      onClick={() => operationClick(ValidateType.COMPLETE)}
    >
      完成
    </Button>);
    const modifyPrice = (<Button
      type="primary"
      onClick={() => operationClick(ValidateType.PRICE)}
    >
      编辑总价
    </Button>);
    const modifyProject = (<Button
      type="primary"
      onClick={() => operationClick(ValidateType.PROJECT)}
    >编辑订单信息</Button>);
    const termination = (<Button
      type="primary"
      danger
      key="termination"
      onClick={() => operationClick(ValidateType.TERMINATION)}
    >
      终止
    </Button>);
    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="1">打印合同</Menu.Item>
        <Menu.Item key="2">上传合同</Menu.Item>
      </Menu>
    );
    const more = (
      <Dropdown overlay={menu}>
        <Button type="primary">
          更多 <DownOutlined/>
        </Button>
      </Dropdown>
    );
    if (order_status === 1) {
      template2.push(confirm, termination, modifyPrice, modifyProject);
    } else if (order_status === 2) {
      template2.push(complete, termination, modifyPrice, modifyProject, more);
    }
    return template2;
  };

  const operationClick = (type: ValidateType) => {
    setValidateType(type);
    setValidateVisible(true);
  };

  //  =========== 密码校验 ======================
  const onCreate = async (values: { password: string }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id, create_user, order_leader_quota, order_leader_price, company, order_number, project_name, order_user} = current as OrderListItem;
    if (validateType === ValidateType.PRICE) {
      setVisible(true);
    } else if (validateType === ValidateType.PROJECT) {
      setModifyVisible(true);
    }
    let oper_code: number = 0;
    let operation: string = '';
    switch (validateType) {
      case ValidateType.CONFIRM:
        oper_code = 1;
        operation = '同意操作';
        break;
      case ValidateType.TERMINATION:
        oper_code = 2;
        operation = '终止操作';
        break;
      case ValidateType.COMPLETE:
        oper_code = 3;
        operation = '完成操作';
        break;
    }
    if (!!oper_code) {
      Modal.confirm({
        title: `订单-${operation}`,
        icon: <ExclamationCircleOutlined/>,
        content: (
          <div>
            <Descriptions bordered column={4} size="small">
              <Descriptions.Item label="订单ID" span={1}>
                <Text style={{color: '#FF6A00'}}>{id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="订单总价" span={3}>
                <>
                  <Text style={{color: '#1890FF'}}>销售总价：</Text>
                  <Text style={{color: '#FF6A00'}}>{'¥' + order_leader_quota}</Text>
                  <br/>
                  {
                    order_leader_price ?
                      <>
                        <Text style={{color: '#1890FF'}}>成交总价：</Text>
                        <Text style={{color: '#FF6A00'}}>{'¥' + order_leader_price}</Text>
                      </> : null
                  }
                </>
              </Descriptions.Item>
              <Descriptions.Item label="项目基础信息" span={4}>
                <div>
                  <Text>合同方：</Text>
                  <Text style={{color: '#FF6A00'}}>{company}</Text>
                </div>
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
            </Descriptions>
          </div>

        ),
        okText: '确认',
        // @ts-ignore
        okType: 'danger',
        cancelText: '取消',
        width: 620,
        onOk: async () => {
          const result: ResultType | string = await changeOrderStatus({id, data: {oper_code}});
          const success: boolean = new ValidatePwdResult(result).validate('操作成功', null, undefined);
          // 刷新数据
          if (success) {
            reload();
          }
        },
        onCancel() {
          setCurrent({});
        },
      });
    }
  };


  return (
    <div className={styles.listContentWrapper}>
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await modifyTotalPrice({id: current?.id as number, data: value});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            reload();
            callback();
            setVisible(false);
            setCurrent({});
          }
        }}
        onCancel={() => {
          setVisible(false);
          setCurrent({});
        }}
        updateModalVisible={visible}
        current={current}
      />
      <ModifyProjectDetail
        onSubmit={async (value, callback) => {
          const response = await modifyOrder({id: current?.id as number, data: value});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            reload();
            callback();
            setModifyVisible(false);
            setCurrent({});
          }
        }}
        onCancel={() => {
          setModifyVisible(false);
          setCurrent({});
        }}
        updateModalVisible={modifyVisible}
        current={current}
      />
      <ValidatePassword
        visible={validateVisible}
        onCreate={async values => {
          const success = await onCreate(values);
          if (success) {
            setValidateVisible(false);
            // TODO something
            validatePasswordSuccessToDo();
          }
        }}
        onCancel={() => {
          setValidateVisible(false);
        }}
      />
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
        <Descriptions.Item label="订单总价" span={2}>
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
          {project_desc?.split('\n')?.map((o, i) => {
            return (
              <div key={id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            );
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
        rowKey={(record) => record?.uuid}
        pagination={false}
        dataSource={dataSource || []}
        renderItem={(item: { uuid: string; data: ProductBaseListItem[] }, index: number) => {
          const columns: ColumnsType<any> = [
            {
              title: '产品名称',
              dataIndex: 'name',
              key: 'name',
              align: 'center',
              width: 160,
              render: (text: string) => {
                return (
                  <div>
                    <Ellipsis tooltip lines={1}>
                      {text}
                    </Ellipsis>
                  </div>
                );
              },
            },
            {
              title: '型号',
              dataIndex: 'pro_type',
              key: 'pro_type',
              width: 120,
              align: 'center',
              render: (text: string) => {
                return (
                  <div>
                    <Ellipsis tooltip lines={1}>
                      {text}
                    </Ellipsis>
                  </div>
                );
              },
            },
            {
              title: '产品描述',
              dataIndex: 'desc',
              width: 190,
              render: (text) => {
                return (
                  <div style={{textAlign: 'left'}}>
                    <Ellipsis tooltip lines={1}>
                      <p style={{marginBottom: '0px'}}>
                        {(text as string)?.split('\n')?.map((o, i) => {
                          return (
                            <span key={i}>{o}<br/></span>
                          );
                        })}
                      </p>
                    </Ellipsis>
                  </div>
                );
              },
            },
            {
              title: '单价',
              dataIndex: 'leader_quota',
              width: 170,
              align: 'right',
              render: (text: any, record) => {
                const price = text || record?.leader_price;
                return (
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Text style={{color: '#FF6A00', textAlign: 'right'}}>
                      {price ?
                        <StatisticWrapper value={price}/>
                        : '尚未定价'}
                    </Text>
                  </div>
                );
              },
            },
            {
              title: '数量',
              dataIndex: 'count',
              key: 'count',
              align: 'center',
              width: 100,
            },
            {
              title: '金额',
              dataIndex: 'leader_quota',
              key: 'leader_quota',
              width: 170,
              align: 'center',
              render: (value, row, index) => {
                const obj: {
                  props: { rowSpan?: number; [propName: string]: any; };
                  [propName: string]: any;
                } = {
                  children: <div>
                    <Text style={{color: '#FF6A00'}}>
                      {value ?
                        <StatisticWrapper value={value}/>
                        : '部分尚未定价'}
                    </Text>
                  </div>,
                  props: {},
                };
                if (row?.production > 0) {
                  obj.props.rowSpan = item?.data?.length;
                } else {
                  obj.props.rowSpan = 0;
                }
                return obj;
              },
            },
            {
              title: 'SN码',
              dataIndex: 'sn',
              key: 'sn',
              width: 170,
              align: 'center',
              render: (value, row, index) => {
                const obj: {
                  props: { rowSpan?: number; [propName: string]: any; };
                  [propName: string]: any;
                } = {
                  children: <div>
                    <Paragraph
                      editable={identity === 1 && order_status === 2 ? {onChange: (str) => onChangeSN(str, row)} : false}>{value || ''}</Paragraph>
                  </div>,
                  props: {},
                };
                if (row?.production > 0) {
                  obj.props.rowSpan = item?.data?.length;
                } else {
                  obj.props.rowSpan = 0;
                }
                return obj;
              },
            },
          ];
          return (
            <List.Item
            >
              <div style={{width: '100%'}}>
                <Space style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Text strong>产品{index + 1}</Text>
                </Space>
                <Table
                  bordered
                  size="small"
                  rowKey={record => record?.id}
                  columns={columns}
                  pagination={false}
                  dataSource={item?.data || []}
                />
              </div>
            </List.Item>
          );
        }}
      >
      </List>
      <div style={{padding: '16px 24px'}}>
        <Space style={{display: 'flex', justifyContent: 'space-between'}}>
          <Text strong>附加产品</Text>
        </Space>
        <Table
          bordered
          size="small"
          rowKey={record => record?.id}
          columns={columnsOtherList}
          pagination={false}
          dataSource={other_list || []}
        />
      </div>
      {
        identity === 1 ?
          <>
            <div style={{margin: '10px 0'}}>
              <Alert
                message="更多操作"
                type="info"
                closable
              />
            </div>
            <Space style={{display: 'flex', justifyContent: 'flex-end'}}>
              {operationButtons()}
            </Space>
          </> : null
      }

    </div>
  );
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

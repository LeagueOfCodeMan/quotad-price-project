import React, {FC, useRef, useState} from 'react';
import {Button, Divider, message, Modal, TreeSelect, Typography, Descriptions, Dropdown, Menu} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';

import ValidatePassword from '../../components/ValidatePassword/index';
import {DownOutlined, ExclamationCircleOutlined, PlusOutlined,} from '@ant-design/icons/lib';
import _ from 'lodash';
import {useEffectOnce} from 'react-use';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from '@/models/data';
import {CurrentUser, UserModelState} from '@/models/user';
import {addKeyToEachArray, currentPriceNumber, ResultType, ValidatePwdResult} from '@/utils/utils';
import {testPassword} from '@/services/user';
import {OrderListItem} from '@/pages/order/data';
import {changeOrderStatus, modifyOrder, modifyTotalPrice, queryOrder} from '@/pages/order/service';
import {PaneDetail, TabsList} from '@/pages/order/components/TabsList';
import OrderDetail from '@/pages/order/components/OrderDetail';
import PublishModal from '@/pages/order/components/PublishModal';
import ModifyProjectDetail from '@/pages/order/components/ModifyProjectDetail';
import {StatisticWrapper} from '@/components/StatisticWrapper';

const {confirm} = Modal;
const {Text} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
  users: NotRequired<CurrentChildren>;
}

enum ValidateType {
  CONFIRM = 'CONFIRM',
  TERMINATION = 'TERMINATION',
  COMPLETE = 'COMPLETE',
  PRICE = 'PRICE',
  PROJECT = 'PROJECT',
}

type TreeDataItem = { title: JSX.Element; value: string; children?: TreeDataItem }[];

export const handleUsersProjectToTreeData = (array: CurrentChildrenResults) => {
  const template = _.map(array, v => {
    const child = _.map(v?.users, v2 => {
      // 组长项目
      const children2: TreeDataItem = [];
      v2?.project_list?.forEach((d: { project_name: React.ReactNode; id: any }) => {
        children2.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.project_name}</b>
            </span>
          ),
          value: 'project_name' + '-' + d?.project_name + d?.id,
        });
      });
      // 一级组员
      const children3: TreeDataItem = [];
      v2?.one_level?.forEach(d => {
        const project: TreeDataItem = [];
        d?.project_list?.forEach(d2 => {
          project.push({
            title: (
              <span>
                <b style={{color: '#FF6A00'}}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children3.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.real_name}</b>
            </span>
          ),
          value: 'real_name' + '-' + d?.real_name,
          children: project,
        });
      });
      // 二级组员
      const children4: TreeDataItem = [];
      v2?.two_level?.forEach(d => {
        const project: TreeDataItem = [];
        d?.project_list?.forEach(d2 => {
          project.push({
            title: (
              <span>
                <b style={{color: '#FF6A00'}}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children4.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.real_name}</b>
            </span>
          ),
          value: 'real_name' + '-' + d?.real_name,
          children: project,
        });
      });
      const children = [];
      if (children2?.length > 0) {
        children.push({
          title: <span>组长项目</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key,
          children: children2,
          disabled: true,
        });
      }
      if (children3?.length > 0) {
        children.push({
          title: <span>一级组员</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key + 1,
          children: children3,
          disabled: true,
        });
      }
      if (children4?.length > 0) {
        children.push({
          title: <span>二级组员</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key + 2,
          children: children4,
          disabled: true,
        });
      }

      return {
        title: (
          <span>
            组长：<b style={{color: '#08c'}}>{v2?.real_name}</b>
          </span>
        ),
        value: 'real_name' + '-' + v2?.real_name,
        children,
      };
    });
    return {
      title: <b style={{color: '#FF6A00'}}>{v?.area}</b>,
      value: v?.area,
      disabled: true,
      children: child,
    };
  });
  return template;
};

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  search?: string;
  real_name?: string;
  project_name?: string;

  [propName: string]: any;
}

const OrderList: FC<BasicListProps> = props => {
  const {
    dispatch,
    users,
    currentUser,
  } = props;
  const {identity} = currentUser;
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({
    ['delivery_message']: {show: false,},
    ['bill_message']: {show: false},
    ['bill_delivery_message']: {show: false},
  });
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [modifyVisible, setModifyVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<OrderListItem>>({});
  const [details, setDetails] = useState<OrderListItem[]>([]);
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [listParams, setListParams] = useState<ListSearchParams>({});

  useEffectOnce(() => {
    dispatch({
      type: 'user/queryCurrentUsers',
    });
  });

  const showModal = () => {
    setVisible(true);
    setCurrent({});
  };

  const treeData = () => {
    const initArr: CurrentChildrenResults = addKeyToEachArray(users?.results as any[]);
    return handleUsersProjectToTreeData(initArr);
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
      confirm({
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
            if (actionRef.current) {
              actionRef.current.reload();
            }
            setCurrent({});
          }
        },
        onCancel() {
          setCurrent({});
        },
      });
    }
  };

  // ================= 列表操作 ================

  const action = () => {
    const buttons = [];
    const treeButton = (
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <TreeSelect
          showSearch
          style={{width: 150, marginRight: '25px'}}
          dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
          placeholder="请选择用户或项目"
          allowClear
          treeData={treeData()}
          dropdownMatchSelectWidth={500}
          treeDefaultExpandAll
          onChange={(value: string) => {
            const splitSearch = value?.split('-');
            const searchKey = splitSearch?.[0];
            const searchValue = splitSearch?.[1];
            setListParams({
              ..._.omit(listParams, ['project_name', 'real_name']),
              [searchKey]: searchValue,
            });
          }}
        />
      </div>
    );
    if (currentUser?.identity === 1 || currentUser?.identity === 2) {
      buttons.push(treeButton);
    }
    const add = (
      <Button icon={<PlusOutlined/>} type="primary" onClick={showModal}>
        新建
      </Button>
    );
    if (currentUser?.identity !== 1) {
      buttons.push(add);
    }
    return buttons;
  };

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<OrderListItem>> => {
    const result = await queryOrder({...params});
    // 刷新当前current
    result?.results && refreshData(result?.results);
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count || 0,
    });
  };

  const refreshData = (data: OrderListItem[]) => {
    const newArr: OrderListItem[] = [];
    details?.forEach(item => {
      const item2 = _.find(data, d => d?.id === item?.id);
      if (item2?.id) {
        newArr.push(item2 as OrderListItem);
      }
    });
    setDetails(newArr);
  };

  const columnsGenerate = () => {
    const template: ProColumns<OrderListItem>[] = [];
    const commonMessage: ProColumns<OrderListItem>[] = [
      {
        title: '状态',
        dataIndex: 'order_status',
        key: 'order_status',
        width: 100,
        valueEnum: {
          1: {text: '待确认', status: 'Warning'},
          2: {text: '已确认', status: 'Processing'},
          3: {text: '已终止', status: 'Error'},
          4: {text: '已完成', status: 'Success'},
        },
      },
      {
        title: '项目编号',
        dataIndex: 'order_number',
        key: 'order_number',
        render: (text, record) => {
          return (
            <div style={{display: 'flex'}}>
              <span style={{margin: 'auto 0'}}>{text}</span>
              <Button type="link" onClick={() => showMoreDetail(record)}>
                点击更多详情
              </Button>
            </div>

          );
        }
      },
      {
        title: '销售总价',
        dataIndex: 'order_leader_quota',
        key: 'order_leader_quota',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <Text style={{color: '#1890FF'}}>销售总价：</Text>
              <StatisticWrapper
                style={{
                  color: record?.order_leader_price === record?.order_leader_quota ? 'red' : '#FF6A00'
                }}
                value={record?.order_leader_quota}/>
              <Divider type="vertical"/>
              <Text style={{color: '#1890FF'}}>成交总价：</Text>
              <StatisticWrapper value={record?.order_leader_price || record?.order_leader_quota}/>
            </div>
          );
        },
      },
      {
        title: '收货信息',
        dataIndex: 'delivery_message',
        key: 'delivery_message',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <div>
                <Text>收货地址：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.addr}
                </Text>
              </div>
              <div>
                <Text>联系人：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.contact}
                </Text>
              </div>
              <div>
                <Text>联系电话：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.phone}
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: '开票信息',
        dataIndex: 'bill_message',
        key: 'bill_message',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <div>
                <Text>公司名称：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.company}
                </Text>
              </div>
              <div>
                <Text>税号：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.bill_id}
                </Text>
              </div>
              <div>
                <Text>地址：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.bill_addr}
                </Text>
              </div>
              <div>
                <Text>电话：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.bill_phone}
                </Text>
              </div>
              <div>
                <Text>开户行：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.bill_bank}
                </Text>
              </div>
              <div>
                <Text>账号：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.bill_account}
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: '合同、发票收件信息',
        dataIndex: 'bill_delivery_message',
        key: 'bill_delivery_message',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <div>
                <Text>收货地址：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.contract_addr}
                </Text>
              </div>
              <div>
                <Text>联系人：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.contract_contact}
                </Text>
              </div>
              <div>
                <Text>联系电话：</Text>
                <Text copyable style={{color: '#1890FF'}}>
                  {record?.contract_phone}
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: '订单创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
        valueType: 'dateTime',
        hideInSearch: true,
      },
    ];
    const operation: ProColumns<OrderListItem>[] = [
      {
        title: '操作',
        dataIndex: 'option',
        valueType: 'option',
        render: (text, record) => {
          return (
            <div style={{display: 'flex'}}>
              {operationButtons(record)}
            </div>
          );
        },
      },
    ];
    if (identity === 1) {
      return template.concat(commonMessage, operation);
    } else {
      return template.concat(commonMessage);
    }
  };

  /**
   * 操作项
   * @param record
   */
  const showMoreDetail = (record: OrderListItem) => {
    const newDetails = [...details];
    _.remove(newDetails, d => d?.id?.toString() === record?.id?.toString());
    setDetails([...newDetails, record]);
  };

  const handleMenuClick = (e: { key: string; }) => {
    if (e?.key === '1') {
      console.log('打印合同');
    } else if (e?.key === '2') {
      console.log('上传合同');
    }
  };

  const operationButtons = (record: OrderListItem) => {
    const template2: JSX.Element[] = [];
    // order_status 1 ： 可终止，同意，拒绝
    // 2：无操作
    // 3：已完成，打印合同，上传合同
    const confirm = (<Button
      type="link"
      key="confirm"
      onClick={() => operationClick(record, ValidateType.CONFIRM)}
    >
      同意
    </Button>);
    const complete = (<Button
      key="remove"
      type="link"
      onClick={() => operationClick(record, ValidateType.COMPLETE)}
    >
      完成
    </Button>);
    const modifyPrice = (<Button
      key="price"
      type="link"
      onClick={() => operationClick(record, ValidateType.PRICE)}
    >
      编辑总价
    </Button>);
    const modifyProject = (<Button
      key="project"
      type="link"
      onClick={() => operationClick(record, ValidateType.PROJECT)}
    >编辑订单信息</Button>);
    const termination = (<Button
      type="link"
      danger
      key="termination"
      onClick={() => operationClick(record, ValidateType.TERMINATION)}
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
        <Button type="link">
          更多 <DownOutlined/>
        </Button>
      </Dropdown>
    );
    if (record?.order_status === 1) {
      template2.push(confirm, termination, modifyPrice, modifyProject);
    } else if (record?.order_status === 2) {
      template2.push(complete, termination, modifyPrice, modifyProject, more);
    }
    return template2;
  };

  const operationClick = (item: OrderListItem, type: ValidateType) => {
    setCurrent(item);
    setValidateType(type);
    setValidateVisible(true);
  };

  const panesGenerate = () => {
    const panes: PaneDetail[] = [
      {
        title: '订单列表',
        content: (
          <ProTable<OrderListItem>
            options={{reload: true, fullScreen: true, setting: true, density: false}}
            size="small"
            actionRef={actionRef}
            rowKey={record => record.id}
            toolBarRender={() => {
              return action();
            }}
            request={request}
            params={{...listParams}}
            search={{
              collapsed: false,
              resetText: undefined,
            }}
            columns={columnsGenerate()}
            columnsStateMap={columnsStateMap}
            onColumnsStateChange={map => {
              setColumnsStateMap(map);
            }}
            pagination={{pageSize: 5, showQuickJumper: true}}
          />

        ),
        key: 'order',
        closable: false,
      },
    ];
    details?.forEach(d => {
      panes.push({
        title: `${d?.create_user + '-' + d?.project_name}`,
        content: <OrderDetail current={d} currentUser={currentUser} reload={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}/>,
        key: d?.id?.toString(),
        closable: true,
      });
    });

    return panes;
  };

  const removeItem = (target: string) => {
    const newDetails = [...details];
    _.remove(newDetails, d => d?.id?.toString() === target);
    setDetails(newDetails);
  };

  return (
    <div>
      <div className={styles.standardList}>
        <TabsList
          panes={panesGenerate()}
          removeItem={removeItem}
        />

      </div>
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await modifyTotalPrice({id: current?.id as number, data: value});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
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
            if (actionRef.current) {
              actionRef.current.reload();
            }
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
    </div>
  );
};

export default connect(
  ({
     project,
     loading,
     user,
   }: {
    project: ProjectStateType;
    loading: {
      models: { [key: string]: boolean };
      effects: {
        [key: string]: boolean;
      };
    };
    user: UserModelState;
  }) => ({
    project,
    currentUser: user.currentUser,
    users: user.users,
    fetch: loading.effects['project/fetch'],
    queryProjectOneDetail: loading.effects['user/queryProjectOneDetail'],
  }),
)(OrderList);

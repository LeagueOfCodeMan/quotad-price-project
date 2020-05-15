import React, {FC, useRef, useState} from 'react';
import {Button, Tag, TreeSelect, Typography} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons/lib';
import _ from 'lodash';
import {useEffectOnce} from 'react-use';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from '@/models/data';
import {CurrentUser, UserModelState} from '@/models/user';
import {addKeyToEachArray} from '@/utils/utils';
import {OrderListItem} from '@/pages/order/data';
import {queryOrder} from '@/pages/order/service';
import {PaneDetail, TabsList} from '@/pages/order/components/TabsList';
import OrderDetail from '@/pages/order/components/OrderDetail';
import {StatisticArrow, StatisticWrapper} from '@/components/StatisticWrapper';

const {Text} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
  users: NotRequired<CurrentChildren>;
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
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({
    ['delivery_message']: {show: false,},
    ['bill_message']: {show: false},
    ['bill_delivery_message']: {show: false},
    ['sn']: {show: false},
  });
  const actionRef = useRef<ActionType>();

  const [details, setDetails] = useState<OrderListItem[]>([]);

  const [listParams, setListParams] = useState<ListSearchParams>({});

  useEffectOnce(() => {
    dispatch({
      type: 'user/queryCurrentUsers',
    });
  });

  const treeData = () => {
    const initArr: CurrentChildrenResults = addKeyToEachArray(users?.results as any[]);
    return handleUsersProjectToTreeData(initArr);
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
        title: '项目ID',
        dataIndex: 'order_number',
        key: 'order_number',
        width: 120,
      },
      {
        title: '合同方',
        dataIndex: 'company',
        width: 220,
        ellipsis: true,
        hideInSearch: true,
      },
      {
        title: '下单人',
        dataIndex: 'order_user',
        width: 100,
        ellipsis: true,
        hideInSearch: true,
      },
      {
        title: '填报人',
        dataIndex: 'create_user',
        width: 100,
        ellipsis: true,
        hideInSearch: true,
      },
      {
        title: '销售价格明细',
        dataIndex: 'order_leader_quota',
        key: 'order_leader_quota',
        hideInSearch: true,
        render: (text, record) => {
          console.log(record);
          const price = parseFloat(record?.order_leader_price || record?.order_leader_quota);
          const quota = parseFloat(record?.order_leader_quota);
          return (
            <div style={{display: 'flex'}}>
              <Text style={{color: '#1890FF'}}>订单额：</Text>
              <StatisticWrapper
                style={{
                  color: price === quota ? 'red' : 'gold'
                }}
                value={record?.order_leader_quota}/>
              <Text style={{color: '#1890FF', marginLeft: '10px'}}>成交价：</Text>
              <StatisticWrapper value={price}/>
              <Text style={{color: '#1890FF', marginLeft: '10px'}}>差价：</Text>
              <StatisticArrow value={Math.floor((price - quota) * 100) / 100}/>
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
      {
        title: 'SN码',
        dataIndex: 'sn',
        key: 'sn',
      },
      {
        title: '操作',
        dataIndex: 'option',
        valueType: 'option',
        render: (text, record) => {
          return (
            <div style={{display: 'flex'}}>
              <Button type="link" onClick={() => showMoreDetail(record)}>
                详情
              </Button>
            </div>
          );
        },
      },
    ];
    return commonMessage;
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
      let state: JSX.Element;
      switch (d?.order_status) {
        case 2:
          state = <Tag icon={<SyncOutlined spin/>} color="processing">
            已确认
          </Tag>;
          break;
        case 3:
          state = <Tag icon={<CloseCircleOutlined/>} color="error">
            终止
          </Tag>;
          break;
        case 1:
          state = <Tag icon={<ExclamationCircleOutlined/>} color="warning">
            待确认</Tag>;
          break;
        default:
          state = <Tag icon={<CheckCircleOutlined/>} color="success">
            已完成
          </Tag>;
          break;
      }
      panes.push({
        title: <span>{state}
          <span>{d?.create_user + '-' + d?.project_name}</span></span>,
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

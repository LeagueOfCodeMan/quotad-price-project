import React, {FC, useRef, useState} from 'react';
import {Button, Divider, message, Modal, Tooltip, TreeSelect, Typography,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';

import ValidatePassword from '../../components/ValidatePassword/index';
import {ExclamationCircleOutlined, PlusOutlined,} from '@ant-design/icons/lib';
import _ from 'lodash';
import {deleteProduct} from '../product/service';
import {useEffectOnce} from 'react-use';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from "@/models/data";
import {ProjectListItem} from "@/pages/project/data";
import {createOrder, createProject, modifyProductList, modifyProject} from "@/pages/project/service";
import CreateForm from "@/pages/project/components/CreateForm";
import EditProject from "@/pages/project/components/EditProject";
import {CurrentUser, UserModelState} from "@/models/user";
import {addKeyToEachArray, ResultType, ValidatePwdResult} from "@/utils/utils";
import {testPassword} from "@/services/user";
import EditProductList from "@/pages/project/components/EditProductList";
import CreateOrder from "@/pages/project/components/CreateOrder";
import {OrderListItem} from "@/pages/order/data";
import {queryOrder} from "@/pages/order/service";
import {PaneDetail, TabsList} from "@/pages/order/components/TabsList";
import OrderDetail from "@/pages/order/components/OrderDetail";

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
  REFUSE = 'REFUSE',
  TERMINATION = 'TERMINATION',
  COMPLETE = 'COMPLETE',
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
              <b style={{color: '#FF6A00'}}>{d?.username}</b>
            </span>
          ),
          value: 'username' + '-' + d?.username,
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
              <b style={{color: '#FF6A00'}}>{d?.username}</b>
            </span>
          ),
          value: 'username' + '-' + d?.username,
          children: project,
        });
      });
      const children = [];
      if (children2?.length > 0) {
        children.push({
          title: <span>组长项目</span>,
          value: 'username' + '-' + v2?.username + '-' + v2?.key,
          children: children2,
          disabled: true,
        });
      }
      if (children3?.length > 0) {
        children.push({
          title: <span>一级组员</span>,
          value: 'username' + '-' + v2?.username + '-' + v2?.key + 1,
          children: children3,
          disabled: true,
        });
      }
      if (children4?.length > 0) {
        children.push({
          title: <span>二级组员</span>,
          value: 'username' + '-' + v2?.username + '-' + v2?.key + 2,
          children: children4,
          disabled: true,
        });
      }

      return {
        title: (
          <span>
            组长：<b style={{color: '#08c'}}>{v2?.username}</b>
          </span>
        ),
        value: 'username' + '-' + v2?.username,
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
  username?: string;
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
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({});
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [orderVisible, setOrderVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editVisible2, setEditVisible2] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProjectListItem>>({});
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
    const {id, pro_type, desc, mark} = current as ProjectListItem;
    if (validateType === ValidateType.REFUSE) {
      const hide = () => {
        message.loading('正在删除');
      };
      confirm({
        title: '删除产品',
        icon: <ExclamationCircleOutlined/>,
        content: (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>
              产品名：<span>{pro_type}</span>
            </span>
            <span>
              备注：<span>{mark}</span>
            </span>
            <span>
              描述：<span>{desc}</span>
            </span>
          </div>
        ),
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteProduct({id});
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (success) {
            setListParams({...listParams, current: 1});
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
              ..._.omit(listParams, ['project_name', 'username']),
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
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count || 0,
    });
  };

  const columnsGenerate = () => {
    const template: ProColumns<OrderListItem>[] = [];
    const columns: ProColumns<OrderListItem>[] = [
      {
        title: '状态',
        dataIndex: 'order_status',
        width: 100,
        valueEnum: {
          1: {text: '待确认', status: 'Warning'},
          2: {text: '已确认', status: 'Processing'},
          3: {text: '已终止', status: 'Error'},
          4: {text: '已完成', status: 'Success'},
        },
      },
    ]
    const managerMessage: ProColumns<OrderListItem>[] = [
      {
        title: '地区',
        dataIndex: 'area',
        width: 100,
        ellipsis: true,
      },
      {
        title: '组长',
        dataIndex: 'order_user',
        width: 100,
        ellipsis: true,
        hideInSearch: true,
      },
      {
        title: '组长单位',
        dataIndex: 'leader_company',
        width: 100,
        ellipsis: true,
      },
    ]
    const commonMessage: ProColumns<OrderListItem>[] = [
      {
        title: '项目信息',
        dataIndex: 'create_user',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <Tooltip title={
                record?.project_desc?.split("\n")?.map((o, i) => {
                  return (
                    <div key={i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
                  )
                })
              }>
                <div>
                  <div>
                    <Text>项目创建人：</Text>
                    <Text style={{color: '#1890FF'}}>
                      {text}
                    </Text>
                  </div>
                  <div>
                    <Text>项目名称：</Text>
                    <Text style={{color: '#1890FF'}}>
                      {record?.project_name}
                    </Text>
                  </div>
                  <Button type="link" onClick={() => {
                    setDetails([...details, record])
                  }}>
                    更多详情
                  </Button>
                </div>
              </Tooltip>

            </div>

          )
        }
      },
      {
        title: '销售总价',
        dataIndex: 'order_leader_quota',
        hideInSearch: true,
        render: (text, record) => {
          return (
            <div>
              <Text style={{color: '#FF6A00'}}>
                ¥ {text}
              </Text>
              {record?.order_leader_price ?
                <div>
                  <Text style={{color: '#FF6A00'}}>
                    ¥ {record?.order_leader_price}
                  </Text>
                </div> : null
              }

            </div>
          );
        },
      },
      {
        title: '收货信息',
        dataIndex: 'delivery_message',
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
        dataIndex: 'delivery_message',
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
          const template2: JSX.Element[] = [];
          // order_status 1 ： 可终止，同意，拒绝
          // 2：无操作
          // 3：已完成，打印合同，上传合同
          const confirm = (<Button
            type="link"
            key="confirm"
            onClick={() => {
              setValidateType(ValidateType.CONFIRM);
              setValidateVisible(true);
            }}
          >
            同意
          </Button>);
          const refuse = (<Button
            type="link"
            key="refuse"
            danger
            onClick={() => {
              setValidateType(ValidateType.REFUSE);
              setValidateVisible(true);
            }}
          >
            拒绝
          </Button>);
          const complete = (<Button
            key="remove"
            type="link"
            onClick={() => {
              setValidateType(ValidateType.COMPLETE);
              setValidateVisible(true);
            }}
          >
            完成
          </Button>);
          const termination = (<Button
            type="link"
            danger
            key="termination"
            onClick={() => {
              setValidateType(ValidateType.TERMINATION);
              setValidateVisible(true);
            }}
          >
            终止
          </Button>);
          const print = (<Button
            type="link"
            key="print"
            onClick={() => {
            }}
          >
            打印合同
          </Button>);
          const upload = (<Button
            type="link"
            key="upload"
            onClick={() => {
            }}
          >
            上传合同
          </Button>);
          if (record?.order_status === 1) {
            template2.push(confirm, refuse, complete, termination);
          } else if (record?.order_status === 3) {
            template2.push(print, upload);
          }
          return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {template2}
            </div>
          );
        },
      },
    ];
    if (identity === 1) {
      return template.concat(columns, managerMessage, commonMessage, operation);
    } else {
      return template.concat(columns, commonMessage);
    }
  }


  const addDividerToActions = (template: JSX.Element[]) => {
    return template?.map((item, index) => {
      if (index === template?.length - 1) {
        return (<>{item}</>);
      }
      return (<>{item}<Divider type="vertical"/></>);
    });
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
            }}
            columns={columnsGenerate()}
            columnsStateMap={columnsStateMap}
            onColumnsStateChange={map => setColumnsStateMap(map)}
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
        content: <OrderDetail current={d} currentUser={currentUser}/>,
        key: d?.id?.toString(),
        closable: true,
      })
    })

    return panes;
  };

  const removeItem = (target: string) => {
    console.log(target);
    const newDetails = details;
    _.remove(newDetails, d => d?.id?.toString() === target);
    console.log(newDetails);
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
      {visible ? (
        <CreateForm
          onSubmit={async value => {
            const response = await createProject(value);
            const success = new ValidatePwdResult(response).validate('创建成功', null, undefined);
            if (success) {
              setVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            setVisible(false);
          }}
          updateModalVisible={visible}
          currentUser={currentUser}
        />
      ) : null}
      {orderVisible ? (
        <CreateOrder
          onSubmit={async value => {
            console.log(value);
            const response = await createOrder({id: current?.id as number, data: value});
            const success = new ValidatePwdResult(response).validate('创建成功', null, undefined);
            if (success) {
              setOrderVisible(false);
            }
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
          onCancel={() => {
            setOrderVisible(false);
          }}
          updateModalVisible={orderVisible}
          current={current}
          currentUser={currentUser}
        />
      ) : null}
      <EditProject
        onSubmit={async value => {
          const response = await modifyProject({id: current?.id as number, data: value});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            setEditVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          setEditVisible(false);
        }}
        updateModalVisible={editVisible}
        current={current}
      />
      {editVisible2 ? (
        <EditProductList
          onSubmit={async value => {
            const response = await modifyProductList({id: current?.id as number, data: {product_list: value}});
            const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
            if (success) {
              setEditVisible2(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            setEditVisible2(false);
          }}
          updateModalVisible={editVisible2}
          current={current}
          currentUser={currentUser}
        />
      ) : null}
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

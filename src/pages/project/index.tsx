import React, {FC, useEffect, useRef, useState} from 'react';
import {Avatar, Button, Descriptions, Divider, message, Modal,List, Table, Tooltip, TreeSelect, Typography,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';

import ValidatePassword from '../../components/ValidatePassword/index';
import {ExclamationCircleOutlined, PlusOutlined,} from '@ant-design/icons/lib';
import _ from 'lodash';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from '@/models/data';
import {ProjectListItem, ProjectProductionInfoItem} from '@/pages/project/data';
import {
  createOrder,
  createProject,
  modifyProductList,
  modifyProject,
  queryProject,
  terminateProject
} from '@/pages/project/service';
import CreateForm from '@/pages/project/components/CreateForm';
import EditProject from '@/pages/project/components/EditProject';
import {CurrentUser, UserModelState} from '@/models/user';
import {
  addKeyToEachArray,
  handleProjectProductListData,
  IdentityType,
  productType,
  projectType,
  ResultType,
  ValidatePwdResult
} from '@/utils/utils';
import {testPassword} from '@/services/user';
import EditProductList from '@/pages/project/components/EditProductList';
import CreateOrder from '@/pages/project/components/CreateOrder';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import {ProductBaseListItem} from '@/pages/product/data';
import {ColumnsType} from 'antd/lib/table';
import Ellipsis from '@/components/Ellipsis';


const {confirm} = Modal;
const {Text,Paragraph} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
  users: NotRequired<CurrentChildren>;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}

type TreeDataItem = { title: JSX.Element; value: string; children?: TreeDataItem }[];

const ListContentWrapper = ({item, identity,index }:
                              {
                                item: ProjectProductionInfoItem; identity: IdentityType;
                                index: number;
                              }) => {
  return (
    <Descriptions bordered title={"产品" + index + 1} column={5} size="small">
      <Descriptions.Item label="产品名称" span={1}>
        <Text style={{color: '#181818'}}>{item?.production?.name}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="型号" span={1}>
        <Text style={{color: '#1890FF'}}>{item?.production?.pro_type}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="数量" span={1}>
        <Text style={{color: '#181818'}}>{item?.count}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="采购总价" span={1}>
        <Text style={{color: '#FF6A00'}}>{'¥ ' + item?.leader_quota}</Text>
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
          value: 'project_name' + '-' + d?.project_name + '-' + d?.id,
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
  pro_status?: 1 | 2 | 3;
  search?: string;
  real_name?: string;
  project_name?: string;

  [propName: string]: any;
}

const ProjectList: FC<BasicListProps> = props => {
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
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [listParams, setListParams] = useState<ListSearchParams>({});

  useEffect(() => {
    if (currentUser?.identity === 1 || currentUser?.identity === 2) {
      dispatch({
        type: 'user/queryCurrentUsers',
      });
    }
  }, [currentUser?.id]);

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
    const {id, project_name, project_desc, pro_status} = current as ProjectListItem;
    if (validateType === ValidateType.DELETE_CONFIG) {
      const hide = () => {
        message.loading('正在终止');
      };
      confirm({
        title: '终止项目',
        icon: <ExclamationCircleOutlined/>,
        content: (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>
              项目名称：<span>{project_name}</span>
            </span>
            <span>
              项目状态：<span>{projectType(pro_status)}</span>
            </span>
            <span>
              项目描述：
              {project_desc?.split('\n')?.map((o, i) => {
                return (
                  <div key={id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
                );
              })}
            </span>
          </div>
        ),
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await terminateProject({id});
          const success: boolean = new ValidatePwdResult(result).validate('终止成功', null, hide);
          // 刷新数据
          if (success) {
            setCurrent({});
            if (actionRef.current) {
              actionRef.current.reload();
            }
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
    if (currentUser?.identity === 3 || currentUser?.identity === 4) {
      buttons.push(add);
    }
    return buttons;
  };

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<ProjectListItem>> => {
    const result = await queryProject({...params});
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count || 0,
    });
  };

  const columns: ProColumns<ProjectListItem>[] = [
    {
      title: '状态',
      dataIndex: 'pro_status',
      width: 100,
      valueEnum: {
        1: {text: '进行中', status: 'Processing'},
        2: {text: '已终止', status: 'Error'},
        3: {text: '审核中', status: 'Warning'},
        4: {text: '交付中', status: 'Processing'},
        5: {text: '已完成', status: 'Success'},
      },
    },
    {
      title: '项目ID',
      dataIndex: 'project_id',
      width: 120,
    },
    {
      title: '填报人',
      dataIndex: 'real_name',
      width: 100,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
      width: 160,
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'user_name',
      hideInSearch: true,
      width: 160,
      render: (text, record) => {
        const {user_name, user_addr, user_iphone, user_contact} = record;
        return (
          <div style={{wordBreak: 'keep-all'}}>
            <Tooltip
              placement="top"
              title={
                <div className={styles.listContentWrapper}>
                  <Descriptions column={4} layout="vertical">
                    <Descriptions.Item label={<span style={{color: '#FFFFFF'}}>用户详细信息：</span>} span={4}>
                      <span style={{color: '#FFFFFF'}}>用户名： </span><Text style={{color: '#FFFFFF'}}>{user_name}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>地址：</span><Text style={{color: '#FFFFFF'}}>{user_addr}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>电话：</span><Text style={{color: '#FFFFFF'}}>{user_iphone}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>联系人：</span><Text style={{color: '#FFFFFF'}}>{user_contact}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              }>
              <span>{text}...</span>
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: '项目描述',
      dataIndex: 'project_desc',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '销售产品',
      dataIndex: 'production',
      hideInSearch: true,
      width: 80,
      render: (text, record) => {
        const {product_list, identity} = record;

        return (
          <div>
            <Button onClick={() => {
              Modal.success({
                maskClosable: true,
                title: 'This is a warning message',
                width: 1000,
                content: (
                  <List
                    size="large"
                    rowKey={record => record.id?.toString()}
                    pagination={false}
                    dataSource={product_list || []}
                    renderItem={(item: ProjectProductionInfoItem,index) => (
                      <List.Item
                      >
                        <div>
                          <ListContentWrapper item={item} identity={identity as IdentityType} index={index}/>
                        </div>
                      </List.Item>
                    )}
                  >
                  </List>
                ),
              });
            }}>Info</Button>
          </div>
        );
      },
    },
    {
      title: '销售总价',
      dataIndex: 'price',
      hideInSearch: true,
      width: 130,
      render: (text, record) => {
        const {
          sell_total_quota
        } = record;
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>
              {sell_total_quota ?
                <StatisticWrapper value={sell_total_quota}/>
                : '部分尚未定价'}
            </Text>
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  const operation: ProColumns<ProjectListItem>[] = [
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        const {pro_status} = record;
        const template: JSX.Element[] = [];
        if (pro_status !== 1) {
          return template;
        }
        const edit = (
          <a
            key="edit"
            onClick={e => {
              e.preventDefault();
              setCurrent(record);
              setEditVisible(true);
            }}
          >
            编辑基础
          </a>
        );
        const edit2 = (
          <a
            key="edit2"
            onClick={e => {
              e.preventDefault();
              setCurrent(record);
              setEditVisible2(true);
            }}
          >
            编辑产品清单
          </a>
        );
        const remove = (<a
          key="remove"
          onClick={e => {
            e.preventDefault();
            setCurrent(record);
            setValidateType(ValidateType.DELETE_CONFIG);
            setValidateVisible(true);
          }}
        >
          终止
        </a>);
        const place = (
          <a
            key="order"
            onClick={e => {
              e.preventDefault();
              setCurrent(record);
              setOrderVisible(true);
            }}
          >
            下单
          </a>
        );

        switch (currentUser?.identity) {
          case 2:
            template.push(place);
            if (record?.username === currentUser?.username) {
              template.push(edit, edit2, remove);
            }
            return addDividerToActions(template);
          case 3:
          case 4:
            if (record?.username === currentUser?.username) {
              template.push(edit, edit2, remove);
            }
            return addDividerToActions(template);
        }
        return template;
      },
    },
  ];


  const addDividerToActions = (template: JSX.Element[]) => {
    return template?.map((item, index) => {
      if (index === template?.length - 1) {
        return (<>{item}</>);
      }
      return (<>{item}<Divider type="vertical"/></>);
    });
  };

  return (
    <div>
      <div className={styles.standardList}>
        <ProTable<ProjectListItem>
          options={{reload: true, fullScreen: true, setting: true, density: false}}
          size="small"
          actionRef={actionRef}
          rowKey={record => record.id}
          toolBarRender={() => {
            return action();
          }}
          request={request}
          search={{
            collapsed: false,
          }}
          params={{...listParams}}
          columns={identity === 1 ? columns : columns.concat(operation)}
          columnsStateMap={columnsStateMap}
          onColumnsStateChange={map => setColumnsStateMap(map)}
          pagination={{pageSize: 5, showQuickJumper: true}}
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
)(ProjectList);

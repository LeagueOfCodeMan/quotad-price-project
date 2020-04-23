import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined} from '@ant-design/icons';
import {Button, Divider, Descriptions, Dropdown, Menu, message, Modal, Tooltip, TreeSelect, Typography,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';
import router from 'umi/router';

import ValidatePassword from '../../components/ValidatePassword/index';
import {ExclamationCircleOutlined, PlusOutlined,} from '@ant-design/icons/lib';
import _ from 'lodash';
import {deleteProduct} from '../product/service';
import {useEffectOnce} from 'react-use';
import {AddressInfo} from '../usermanager/settings/data';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from "@/models/data";
import {ProjectListItem} from "@/pages/project/data";
import {createProject, modifyProductList, modifyProject, queryProject} from "@/pages/project/service";
import CreateForm from "@/pages/project/components/CreateForm";
import EditProject from "@/pages/project/components/EditProject";
import {CurrentUser, UserModelState} from "@/models/user";
import {actPrice, addIcontains, addKeyToEachArray, productType, ResultType, ValidatePwdResult} from "@/utils/utils";
import {testPassword} from "@/services/user";
import ScrollList from "@/components/ScrollList";
import EditProductList from "@/pages/project/components/EditProductList";
import CreateOrder from "@/pages/project/components/CreateOrder";

const {confirm} = Modal;
const {Text} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
  users: NotRequired<CurrentChildren>;
  addressList: AddressInfo;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
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
  pro_status?: 1 | 2 | 3;
  search?: string;
  username?: string;

  [propName: string]: any;
}

const ProjectList: FC<BasicListProps> = props => {
  const {
    dispatch,
    project: {projectList},
    users,
    currentUser,
    addressList,
  } = props;
  const {identity} = currentUser;
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({
    addr: {show: false},
    email: {show: false},
    ['data_joined']: {show: false},
    ['last_login']: {show: false},
    company: {show: false},
    duty: {show: false},
  });
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [orderVisible, setOrderVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editVisible2, setEditVisible2] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProjectListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1,
    pageSize: 3,
  });

  const {results = [], count = 0} = projectList;

  useEffectOnce(() => {
    dispatch({
      type: 'user/queryCurrentUsers',
    });
    dispatch({
      type: 'user/fetchAddress',
    });
  });

  useEffect(() => {
    reloadList();
  }, [listParams]);

  const reloadList = () => {
    dispatch({
      type: 'project/fetch',
      payload: {
        ...listParams,
      },
    });
  };

  const showModal = () => {
    setVisible(true);
    setCurrent({});
  };

  const paginationProps = {
    showQuickJumper: true,
    pageSize: 3,
    total: count,
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    },
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
    if (validateType === ValidateType.DELETE_CONFIG) {
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
  }): Promise<RequestData<ProjectListItem>> => {
    const searchParamsType = addIcontains(params);
    const result = await queryProject({...searchParamsType});
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
        2: {text: '已下单', status: 'Warning'},
        3: {text: '终止', status: 'Error'},
        4: {text: '审核中', status: 'Processing'},
        5: {text: '交付中', status: 'Processing'},
        6: {text: '已完成', status: 'Success'},
      },
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
      width: 100,
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'username',
      render: (text, record) => {
        const {user_name, user_addr, user_iphone, user_contact} = record;
        return (
          <div>
            <Tooltip
              placement="top"
              title={
                <div className={styles.listContentWrapper}>
                  <Descriptions column={4} layout="vertical">
                    <Descriptions.Item label={<span style={{color: '#FFFFFF'}}>用户详细信息：</span>} span={4}>
                      <span style={{color: '#FFFFFF'}}>用户名称： </span><Text style={{color: '#FFFFFF'}}>{user_name}</Text>
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
        )
      }
    },
    {
      title: '项目描述',
      dataIndex: 'project_desc',
      ellipsis: true,
      width: 100,
    },
    {
      title: '销售产品',
      dataIndex: 'production',
      hideInSearch: true,
      render: (text, record) => {
        const {product_list} = record;
        return (
          <div>
            <ScrollList title="产品详情">
              {product_list?.map(item => {
                return (
                  <div key={item?.id}>
                    <div>
                      <span>{productType(item?.production?.genre)}：</span>
                      <span>{item?.production?.pro_type}</span>
                    </div>
                    <div style={{margin: '2px 2px 2px 20px', width: '100%'}}>
                      {item?.conf_par?.map(d => {
                        return (
                          <div key={d?.id}>
                            {productType(d?.genre)}：
                            <span>{d?.pro_type}</span>
                            <br/>
                            <span style={{color: '#FF6A00'}}>{d?.sell_price ? `价格：¥${d?.sell_price}` : '尚未定价'}</span>
                            <Divider type="vertical"/>
                            <span>数量：{d?.count}</span>
                          </div>
                        )
                      })
                      }
                    </div>
                    <div>
                      产品数量：{item?.count}
                      <Divider type="vertical"/>
                      <span style={{color: '#FF6A00'}}>
                        {item?.sell_quota ? `产品总价：¥${item?.sell_quota}` : '尚未定价'}
                        </span>
                    </div>
                    <Divider type="horizontal"/>
                  </div>
                )
              })}
            </ScrollList>
          </div>
        );
      },
    },
    {
      title: '销售总价',
      dataIndex: 'price',
      hideInSearch: true,
      render: (text, record) => {
        const {
          leader_total_quota,
          sell_total_quota
        } = record;
        return (
          <div>
            {identity === 1 || identity === 2 ? (
              <>
                <Text style={{color: '#1890FF'}}>组长：</Text>
                <Text style={{color: '#FF6A00'}}>
                  ¥ {leader_total_quota}
                </Text>
                <Divider type="vertical"/>
              </>
            ) : null}
            <>
              <Text style={{color: '#61C37A'}}>{identity === 2 ? '采购人价格：' : ''}</Text>
              <Text style={{color: '#FF6A00'}}>
                {sell_total_quota}
              </Text>
            </>
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
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        const template: JSX.Element[] = [];
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
            setValidateType(ValidateType.DELETE_CONFIG);
            setValidateVisible(true);
          }}
        >
          撤销
        </a>);

        switch (currentUser?.identity) {
          case 2:
            template.push(<a
              key="order"
              onClick={e => {
                e.preventDefault();
                setCurrent(record);
                setOrderVisible(true);
              }}
            >
              下单
            </a>);
            if (record?.username === currentUser?.username) {
              template.push(edit, edit2, remove)
            }
            return addDividerToActions(template);
          case 3:
          case 4:
            if (record?.username === currentUser?.username) {
              template.push(edit, edit2, remove)
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
          columns={columns}
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
            console.log(value);
            // const response = await createProject(value);
            // const success = new ValidatePwdResult(response).validate('创建成功', null, undefined);
            // if (success) {
            //   setOrderVisible(false);
            // }
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
          console.log(value);
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
    addressList: user.addressList,
    fetch: loading.effects['project/fetch'],
    queryProjectOneDetail: loading.effects['user/queryProjectOneDetail'],
  }),
)(ProjectList);

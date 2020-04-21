import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined} from '@ant-design/icons';
import {Button, Divider, Dropdown, Menu, message, Modal, TreeSelect, Typography,} from 'antd';
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
import {CurrentChildren, CurrentChildrenResults, UserListItem} from "@/models/data";
import {ProjectListItem} from "@/pages/project/data";
import {createProject, modifyProject, queryProject} from "@/pages/project/service";
import CreateForm from "@/pages/project/components/CreateForm";
import EditProject from "@/pages/project/components/EditProject";
import {CurrentUser, UserModelState} from "@/models/user";
import {addIcontains, addKeyToEachArray, ResultType, ValidatePwdResult} from "@/utils/utils";
import {testPassword} from "@/services/user";

const { confirm } = Modal;
const { Text } = Typography;

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
              <b style={{ color: '#FF6A00' }}>{d?.project_name}</b>
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
                <b style={{ color: '#FF6A00' }}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children3.push({
          title: (
            <span>
              <b style={{ color: '#FF6A00' }}>{d?.username}</b>
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
                <b style={{ color: '#FF6A00' }}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children4.push({
          title: (
            <span>
              <b style={{ color: '#FF6A00' }}>{d?.username}</b>
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
            组长：<b style={{ color: '#08c' }}>{v2?.username}</b>
          </span>
        ),
        value: 'username' + '-' + v2?.username,
        children,
      };
    });
    return {
      title: <b style={{ color: '#FF6A00' }}>{v?.area}</b>,
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
    project: { projectList },
    users,
    currentUser,
    addressList,
  } = props;
  const { identity } = currentUser;
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({
    addr: { show: false },
    email: { show: false },
    ['data_joined']: { show: false },
    ['last_login']: { show: false },
    company: { show: false },
    duty: { show: false },
  });
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProjectListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1,
    pageSize: 3,
  });

  const { results = [], count = 0 } = projectList;

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
      setListParams({ ...listParams, current: page, pageSize });
    },
  };

  const editAndDelete = (key: string, currentItem: ProjectListItem) => {
    setCurrent(currentItem);
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
      setValidateVisible(true);
    } else if (key === 'edit') {
      setEditVisible(true);
    }
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
    const { id, pro_type, desc, mark } = current as ProjectListItem;
    if (validateType === ValidateType.DELETE_CONFIG) {
      const hide = () => {
        message.loading('正在删除');
      };
      confirm({
        title: '删除产品',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          const result: ResultType | string = await deleteProduct({ id });
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (success) {
            setListParams({ ...listParams, current: 1 });
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
  const MoreBtn: React.FC<{
    item: ProjectListItem;
  }> = ({ item }) => (
    <Dropdown
      overlay={
        <Menu onClick={({ key }) => editAndDelete(key, item)}>
          <Menu.Item key="edit">编辑</Menu.Item>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined />
      </a>
    </Dropdown>
  );

  const action = () => {
    const buttons = [];
    const treeButton = (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <TreeSelect
          showSearch
          style={{ width: 150, marginRight: '25px' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
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
      <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
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
    const result = await queryProject({ ...searchParamsType });
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
      valueEnum: {
        1: { text: '未下单' },
        2: { text: '已下单' },
        3: { text: '已完成' },
      },
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
    },
    {
      title: '所属用户',
      dataIndex: 'username',
    },
    {
      title: '项目描述',
      dataIndex: 'project_desc',
    },
    {
      title: '项目采购总价',
      dataIndex: 'price',
      hideInSearch: true,
      render: (text, record) => {
        const {
          leader_total_price,
          leader_total_quota,
          member_total_price,
          member_total_quota,
          second_total_price,
          second_total_quota,
        } = record;
        return (
          <div>
            {identity === 1 || identity === 2 ? (
              <>
                <Text style={{ color: '#1890FF' }}>组长：</Text>
                <Text style={{ color: '#FF6A00' }}>
                  ¥ {leader_total_price || leader_total_quota}
                </Text>
                <Divider type="vertical" />
              </>
            ) : null}
            {identity === 2 || identity === 3 ? (
              <>
                <Text style={{ color: '#61C37A' }}>{identity === 2 ? '一级组员：' : ''}</Text>
                <Text style={{ color: '#FF6A00' }}>
                  {member_total_price || member_total_quota
                    ? '¥ ' + (member_total_price || member_total_quota)
                    : '尚未定价'}
                </Text>
                <Divider type="vertical" />
              </>
            ) : null}
            {identity === 2 || identity === 4 ? (
              <>
                <Text style={{ color: '#61C37A' }}>{identity === 2 ? '二级组员：' : ''}</Text>
                <Text style={{ color: '#FF6A00' }}>
                  {second_total_price || second_total_quota
                    ? '¥ ' + (second_total_price || second_total_quota)
                    : '尚未定价'}
                </Text>
              </>
            ) : null}
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
        const template = [
          <a
            key="detail"
            onClick={e => {
              e.preventDefault();
              dispatch({
                type: 'user/saveProjectListItem',
                payload: { project: record },
              });
              router.push('/project/detail');
            }}
          >
            产品详情
          </a>,
        ];
        switch (currentUser?.identity) {
          case 2:
            return template.concat([
              <a
                key="order"
                onClick={e => {
                  e.preventDefault();
                }}
              >
                下单
              </a>,
              <MoreBtn key="more" item={record} />,
            ]);
        }
        return template;
      },
    },
  ];

  return (
    <div>
      <div className={styles.standardList}>
        <ProTable<ProjectListItem>
          options={{ reload: true, fullScreen: true, setting: true, density: false }}
          size="small"
          actionRef={actionRef}
          rowKey={record => record.id}
          toolBarRender={() => {
            return action();
          }}
          request={request}
          columns={columns}
          columnsStateMap={columnsStateMap}
          onColumnsStateChange={map => setColumnsStateMap(map)}
          pagination={{ pageSize: 5, showQuickJumper: true }}
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
            }
          }}
          onCancel={() => {
            setVisible(false);
          }}
          updateModalVisible={visible}
          addressList={addressList}
          currentUser={currentUser}
        />
      ) : null}
      <EditProject
        onSubmit={async value => {
          console.log(value);
          const response = await modifyProject({ id: current?.id as number, data: value });
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            setEditVisible(false);
          }
        }}
        onCancel={() => {
          setEditVisible(false);
        }}
        updateModalVisible={editVisible}
        addressList={addressList}
        current={current}
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
    addressList: user.addressList,
    fetch: loading.effects['project/fetch'],
    queryProjectOneDetail: loading.effects['user/queryProjectOneDetail'],
  }),
)(ProjectList);

import {PlusOutlined} from '@ant-design/icons';
import {Button, Divider, message, Modal} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import _ from 'lodash';
import CreateForm from './components/CreateForm';
import {CreateUser} from './data';
import {createUser, deleteUser, queryUsers, updateUser} from './service';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {UserListModalState} from 'src/pages/usermanager/userlist/model';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {UserModelState} from '@/models/user';
import {DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined} from '@ant-design/icons/lib';
import ValidatePassword from '@/components/ValidatePassword';
import {testPassword} from '@/services/user';
import {addIcontains, IdentityType, partitionsData, ResultType, ValidatePwdResult} from '@/utils/utils';
import {UserListItem} from '@/models/data';
import styles from '../../project/style.less';

const {confirm} = Modal;
/**
 * 添加
 * @param fields
 */
const handleAdd = async (fields: CreateUser) => {
  const hide = message.loading('正在添加');
  const data = Object.assign({},
    _.omit(fields, ['re_password']),
    {identity: fields?.identity - 0});
  const result: ResultType | string = await createUser(data as UserListItem);

  return new ValidatePwdResult(result).validate(null, null, hide);
};

/**
 * 更新
 * @param fields
 * @param record
 */
const handleUpdate = async (fields: CreateUser, record: UserListItem | {}) => {
  const hide = message.loading('正在修改');
  const result: ResultType | string =
    await updateUser({
      id: (record as CreateUser)?.id, data: fields
    });
  return new ValidatePwdResult(result).validate('修改成功', null, hide);
};


interface UserListProps {
  dispatch: Dispatch<any>;
  userlist: UserListModalState;
  userlistLoading: boolean;
  user: UserModelState;
}

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  state?: 1 | 2;
  search?: string;

  [propName: string]: any;
}


enum ValidateType {
  DELETE = 'DELETE',
  RECOVER = 'RECOVER',
}

const UserList: React.FC<UserListProps> = (props) => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [editFormValues, setEditFormValues] = useState<NotRequired<UserListItem>>({});
  const [validateType, setValidateType] = useState<string>('');
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState; }>({
    ['data_joined']: {show: false},
    ['last_login']: {show: false},
  });
  const [listParams, setListParams] = useState<ListSearchParams>({state: 1});
  const actionRef = useRef<ActionType>();
  const {dispatch} = props;

  useEffect(() => {
    dispatch({
      type: 'userlist/fetchAreas',
      payload: {pageSize: 99999}
    });
  }, []);

  const {user: {currentUser}, userlist: {areaList}} = props;

  const columns: ProColumns<UserListItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'uid',
      width: 200,
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      width: 100,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 176,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '权限',
      dataIndex: 'identity',
      valueEnum: {
        1: {text: '管理员'},
        2: {text: '组长'},
        3: {text: '一级组员'},
        4: {text: '二级组员'},
      },
      width: 100,
      hideInSearch: currentUser?.identity !== 1,
    },
    {
      title: '地区',
      dataIndex: 'area_name',
      width: 60,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '公司名称',
      dataIndex: 'company',
      width: 220,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '电话',
      dataIndex: 'tel',
      width: 135,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '地址',
      dataIndex: 'addr',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'data_joined',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
  ];

  const operation: ProColumns<UserListItem>[] = [
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <EditTwoTone
            onClick={() => {
              setEditFormValues(record);
              handleModalVisible(true);
            }}/>
          <Divider type="vertical"/>
          <DeleteTwoTone
            twoToneColor="#eb2f96"
            onClick={() => {
              setValidateType(ValidateType.DELETE);
              setEditFormValues(record);
              setValidateVisible(true);
            }}
          />
        </>
      ),
    },
  ];

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<UserListItem>> => {
    const searchParamsType = addIcontains(params);
    const result = await queryUsers({...searchParamsType});
    return Promise.resolve({
      data: partitionsData(result?.results, currentUser?.identity as IdentityType) || [],
      success: true,
      total: currentUser?.identity === 1 ? result?.count - 1 || 0 : result?.count,
    });
  };

  // 密码校验
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id, real_name} = editFormValues as UserListItem;
    let state = validateType === ValidateType.DELETE;
    if (state || validateType === ValidateType.RECOVER) {
      const titleContent = state ? '删除用户' : '解封用户';
      confirm({
        title: titleContent,
        icon: <ExclamationCircleOutlined/>,
        content: `请确认是否${titleContent + ':' + real_name}`,
        okText: '确认',
        // @ts-ignore
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteUser({id});
          const success: boolean = new ValidatePwdResult(result).validate('操作成功', null, undefined);
          // 刷新数据
          if (actionRef.current && success) {
            actionRef.current.reload();
          }
        },
        onCancel() {
        },
      });


    }
  };

  return (
    <div className={styles.standardList}>
      <ProTable<UserListItem>
        headerTitle="成员列表"
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        size="small"
        actionRef={actionRef}
        rowKey={record => record.id}
        toolBarRender={() => {
          if (currentUser?.identity === 1) {
            return [
              <Button icon={<PlusOutlined/>} type="primary" onClick={() => {
                setEditFormValues({});
                handleModalVisible(true);
              }}>
                新建
              </Button>,
              <Button onClick={() => {
                setListParams({...listParams, state: listParams.state === 1 ? 2 : 1});
              }}>
                {listParams.state === 1 ? '显示已删除用户' : '显示所有的用户'}
              </Button>,

            ];
          }
          return [];
        }}
        request={request}
        search={{
          collapsed: true,
          resetText: undefined,
        }}
        expandable={{
          rowExpandable: record => record.children?.length > 0,
        }}
        params={{...listParams}}
        columns={currentUser?.identity === 1 ? columns.concat(operation) : columns}
        columnsStateMap={columnsStateMap}
        onColumnsStateChange={map => setColumnsStateMap(map)}
        pagination={{pageSize: 10, showQuickJumper: true}}
      />
      <CreateForm
        onSubmit={async (value, callback) => {
          let success;
          if (editFormValues?.id) {
            success = await handleUpdate(value, editFormValues);
          } else {
            success = await handleAdd(value as CreateUser);
          }
          if (success) {
            callback(true);
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          } else {
            callback(false);
          }
        }}
        currentUser={currentUser}
        areaList={areaList}
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
        editFormValues={editFormValues}
      />
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
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
     loading, userlist, user
   }: {
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
    userlist: UserListModalState;
    user: UserModelState;
  }) => ({
    userlist,
    user,
    userlistLoading: loading.effects['userlist/fetch'],
  }),
)(UserList);

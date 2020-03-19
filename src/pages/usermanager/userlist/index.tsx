import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Divider, Dropdown, Menu, message, Modal} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import _ from 'lodash';
import CreateForm from './components/CreateForm';
import {CreateUser, UserListItem} from './data';
import {createUser, deleteUser, queryUsers, updateRule, updateUser} from './service';
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {UserListModalState} from "src/pages/usermanager/userlist/model";
import {ColumnsState, RequestData} from "@ant-design/pro-table/es";
import {UserModelState} from "@/models/user";
import {DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined} from "@ant-design/icons/lib";
import EditUser from "@/pages/usermanager/userlist/components/EditUser";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ResultType, ValidatePwdResult} from "@/utils/utils";

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
  console.log(result);
  return new ValidatePwdResult(result).validate(null, null, hide);
};

/**
 * 更新
 * @param fields
 */
const handleUpdate = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    // const data = Object.assign({},
    //   _.omit(fields, ['re_password']),
    //   {identity: fields?.identity - 0});
    console.log(fields);
    const result: ResultType | string =
      await updateUser({
        ...fields
      });
    return new ValidatePwdResult(result).validate(null, null, hide);
  } catch (error) {
    return ValidatePwdResult.simplyFailure(hide);
  }
};


interface UserListProps {
  dispatch: Dispatch<any>;
  userlist: UserListModalState;
  userlistLoading: boolean;
  user: UserModelState;
}

enum ValidateType {
  DELETE_URL = 'DELETE_URL',
}

const TableList: React.FC<UserListProps> = (props) => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [editFormValues, setEditFormValues] = useState({});
  const [validateType, setValidateType] = useState<string>("");
  const [keyword, setKeyword] = React.useState<string>("");
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState; }>({
    addr: {show: false,},
    email: {show: false},
    ["data_joined"]: {show: false},
    ["last_login"]: {show: false},
    company: {show: false},
    duty: {show: false}
  });
  const actionRef = useRef<ActionType>();
  const {dispatch} = props;

  useEffect(() => {
    dispatch({
      type: 'userlist/fetchAreas'
    })
  }, []);

  const {user: {currentUser}, userlist: {areaList}} = props;

  const columns: ProColumns<UserListItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
    },
    {
      title: '地区',
      dataIndex: 'area_name',
    },
    {
      title: '公司名',
      dataIndex: 'company',
    },
    {
      title: '职务',
      dataIndex: 'duty',
      hideInSearch: true,
    },
    {
      title: '地址',
      dataIndex: 'addr',
      hideInSearch: true,
    },
    {
      title: '手机号',
      dataIndex: 'tel',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'data_joined',
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login',
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '权限',
      dataIndex: 'identity',
      valueEnum: {
        1: {text: '管理员'},
        2: {text: '一级组长'},
        3: {text: '一级组员'},
        4: {text: '二级组员'},
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          {record.identity !== 1 ?
            <EditTwoTone
              onClick={() => {
                handleUpdateModalVisible(true);
                setEditFormValues(record);
              }}/> : null
          }
          <Divider type="vertical"/>
          {
            record.identity !== 1 ?
              <DeleteTwoTone
                twoToneColor="#eb2f96"
                onClick={() => {
                  setValidateType(ValidateType.DELETE_URL);
                  setEditFormValues(record);
                  setValidateVisible(true);
                }}
              /> : null
          }
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
    console.log('request params: ', params)
    let result;
    try {
      result = await queryUsers({...params})
    } catch (error) {
      // 这里要抛出异常
      debugger
    }
    return Promise.resolve({
      data: result?.results,
      success: true,
      total: result?.count
    })
  };

  // 密码校验
  const onCreate = async (values: { password: string; }) => {
    console.log('Received values of form: ', values);
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id} = editFormValues as UserListItem;
    console.log(keyword);
    if (validateType === ValidateType.DELETE_URL) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除用户',
        icon: <ExclamationCircleOutlined/>,
        content: '请确认是否删除用户',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteUser({id});
          new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (actionRef.current) {
            actionRef.current.reload();
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });


    }
  }

  return (
    <PageHeaderWrapper>
      <ProTable<UserListItem>
        headerTitle="用户列表"
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        size="small"
        actionRef={actionRef}
        rowKey={record => record.id}
        params={{keyword}}
        toolBarRender={(action, {selectedRows}) => {
          return [
            <Button icon={<PlusOutlined/>} type="primary" onClick={() => handleModalVisible(true)}>
              新建
            </Button>,
            selectedRows && selectedRows.length > 0 && (
              <Dropdown
                overlay={
                  <Menu
                    onClick={async e => {
                      if (e.key === 'remove') {
                        // await handleRemove(selectedRows);
                        action.reload();
                      }
                    }}
                    selectedKeys={[]}
                  >
                    <Menu.Item key="remove">批量删除</Menu.Item>
                    <Menu.Item key="approval">批量审批</Menu.Item>
                  </Menu>
                }
              >
                <Button>
                  批量操作 <DownOutlined/>
                </Button>
              </Dropdown>
            ),
          ];
        }}
        tableAlertRender={(selectedRowKeys, selectedRows) => (
          <div>
            已选择 <a style={{fontWeight: 600}}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
          </div>
        )}
        tableAlertOptionRender={false}
        request={request}
        columns={columns}
        // rowSelection={{}}
        columnsStateMap={columnsStateMap}
        onColumnsStateChange={map => setColumnsStateMap(map)}
      />
      <CreateForm
        onSubmit={async (value, callback) => {
          const success = await handleAdd(value);
          if (success) {
            callback(true)
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
      />
      {editFormValues && Object.keys(editFormValues).length ? (
        <EditUser
          onSubmit={async value => {
            const success = await handleUpdate(value);
            if (success) {
              handleModalVisible(false);
              setEditFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setEditFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          areaList={areaList}
          values={editFormValues}
        />
      ) : null}
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
          const success = await onCreate(values)
          console.log(success);
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
    </PageHeaderWrapper>
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
)(TableList);

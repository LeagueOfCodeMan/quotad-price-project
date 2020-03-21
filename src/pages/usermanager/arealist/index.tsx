import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Divider, Dropdown, Menu, message, Modal} from 'antd';
import React, {useRef, useState} from 'react';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {RequestData} from "@ant-design/pro-table/es";
import {UserModelState} from "@/models/user";
import {DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined} from "@ant-design/icons/lib";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {addIcontains, ResultType, ValidatePwdResult} from "@/utils/utils";
import {AreaListItem, UserListItem} from "@/models/data";
import {createArea, deleteArea, queryAreas, updateArea} from "@/pages/usermanager/arealist/service";
import CreateForm from "@/pages/usermanager/arealist/components/CreateForm";
import EditForm from "@/pages/usermanager/arealist/components/EditForm";

const {confirm} = Modal;
/**
 * 添加
 * @param fields
 */
const handleAdd = async (fields: AreaListItem) => {
  const hide = message.loading('正在添加');
  const result: ResultType | string = await createArea(fields as AreaListItem);
  console.log(result);
  return new ValidatePwdResult(result).validate(null, null, hide);
};

/**
 * 更新
 * @param fields
 * @param record
 */
const handleUpdate = async (fields: AreaListItem, record: AreaListItem | {}) => {
  const hide = message.loading('正在修改');
  const result: ResultType | string =
    await updateArea({
      id: ((record as AreaListItem)?.id) as number, data: fields
    });
  return new ValidatePwdResult(result).validate('修改成功', null, hide);
};


interface UserListProps {
  dispatch: Dispatch<any>;
  user: UserModelState;
}

enum ValidateType {
  DELETE_URL = 'DELETE_URL',
}

const AreaList: React.FC<UserListProps> = (props) => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [editFormValues, setEditFormValues] = useState({});
  const [validateType, setValidateType] = useState<string>("");
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<UserListItem>[] = [
    {
      title: '番号',
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: '区域名字',
      dataIndex: 'area_name',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <EditTwoTone
            onClick={() => {
              handleUpdateModalVisible(true);
              setEditFormValues(record);
            }}/>
          <Divider type="vertical"/>
          <DeleteTwoTone
            twoToneColor="#eb2f96"
            onClick={() => {
              setValidateType(ValidateType.DELETE_URL);
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
    console.log('request params: ', params)
    const searchParamsType = addIcontains(params);
    const result = await queryAreas({...searchParamsType});
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count || 0,
    })
  };

  // 密码校验
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id} = editFormValues as UserListItem;
    if (validateType === ValidateType.DELETE_URL) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除用户',
        icon: <ExclamationCircleOutlined/>,
        content: '请确认是否删除',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteArea({id});
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (actionRef.current && success) {
            console.log(actionRef);
            actionRef.current.reset();
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });


    }
  }

  return (
    <>
      <ProTable<UserListItem>
        headerTitle="成员列表"
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        size="small"
        actionRef={actionRef}
        rowKey={record => record.id}
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
        pagination={{pageSize: 5, showQuickJumper: true}}
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
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      />
      {editFormValues && Object.keys(editFormValues).length ? (
        <EditForm
          onSubmit={async (value, callback) => {
            const success = await handleUpdate(value, editFormValues);
            if (success) {
              callback();
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
    </>
  );
};


export default connect(
  ({
     loading, user
   }: {
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
    user: UserModelState;
  }) => ({
    user,
  }),
)(AreaList);

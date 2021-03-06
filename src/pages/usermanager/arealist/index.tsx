import {PlusOutlined} from '@ant-design/icons';
// @ts-ignore
import {Button, Divider, message, Modal, Space, Typography} from 'antd';
import React, {useRef, useState} from 'react';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
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
import styles from '../../project/style.less';
const {confirm} = Modal;

/**
 * 添加
 * @param fields
 */
const handleAdd = async (fields: AreaListItem) => {
  const hide = message.loading('正在添加');
  const result: ResultType | string = await createArea(fields as AreaListItem);
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

enum ValidateType {
  DELETE_URL = 'DELETE_URL',
}

const AreaList: React.FC<AreaListItem> = (props) => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [current, setCurrent] = useState<NotRequired<AreaListItem>>({});
  const [validateType, setValidateType] = useState<string>("");
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<AreaListItem>[] = [
    {
      title: '编码',
      dataIndex: 'code',
      width: 100,
      ellipsis: true,
    },
    {
      title: '区域',
      dataIndex: 'area_name',
      width: 80,
      ellipsis: true,
    },
    {
      title: '公司名称',
      dataIndex: 'company',
      width: 170,
      ellipsis: true,
    },
    {
      title: '营业地址',
      dataIndex: 'addr',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '税号',
      dataIndex: 'bill_id',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '开票地址',
      dataIndex: 'bill_addr',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '开票电话',
      dataIndex: 'bill_phone',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '开户行',
      dataIndex: 'bill_bank',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '账号',
      dataIndex: 'bill_account',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <EditTwoTone
            onClick={() => {
              setCurrent(record);
              handleModalVisible(true);
            }}/>
          <Divider type="vertical"/>
          <DeleteTwoTone
            twoToneColor="#eb2f96"
            onClick={() => {
              setValidateType(ValidateType.DELETE_URL);
              setCurrent(record);
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
  }): Promise<RequestData<AreaListItem>> => {
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
    const {id} = current as UserListItem;
    if (validateType === ValidateType.DELETE_URL) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除用户',
        icon: <ExclamationCircleOutlined/>,
        content: '请确认是否删除',
        okText: '确认',
        // @ts-ignore
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteArea({id});
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (actionRef.current && success) {
            actionRef.current.reset();
          }
        },
        onCancel() {
        },
      });


    }
  }

  return (
    <div className={styles.standardList}>
      <ProTable<AreaListItem>
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        size="small"
        actionRef={actionRef}
        rowKey={record => record.id}
        toolBarRender={() => {
          return [
            <Button icon={<PlusOutlined/>} type="primary" onClick={() => {
              setCurrent({});
              handleModalVisible(true);
            }}>
              新建
            </Button>
          ];
        }}
        search={{
          collapsed: true,
          resetText: undefined,
        }}
        tableAlertOptionRender={false}
        request={request}
        columns={columns}
        // rowSelection={{}}
        pagination={{pageSize: 10, showQuickJumper: true}}
      />
      <CreateForm
        onSubmit={async (value, callback) => {
          let success;
          if (current?.id) {
            success = await handleUpdate(value, current);
          } else {
            success = await handleAdd(value);
          }
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
        current={current}
      />
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
    </div>
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

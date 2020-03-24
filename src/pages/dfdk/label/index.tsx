import {PlusOutlined} from '@ant-design/icons';
import {Button, message, Modal} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import CreateEditModal from './components/CreateEditModal';
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {RequestData} from "@ant-design/pro-table/es";
import {UserModelState} from "@/models/user";
import {DeleteTwoTone, ExclamationCircleOutlined} from "@ant-design/icons/lib";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {addIcontains, identifyLabel, ResultType, ValidatePwdResult} from "@/utils/utils";
import {createLabel, deleteLabel, queryLabels, updateLabel} from "@/pages/dfdk/label/service";
import {LabelListItem} from "@/pages/dfdk/label/data";

const {confirm} = Modal;

interface LabelListProps {
  dispatch: Dispatch<any>;
  user: UserModelState;
}

enum ValidateType {
  DELETE_URL = 'DELETE_URL',
}

const LabelList: React.FC<LabelListProps> = (props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [current, setCurrent] = useState({});
  const [validateType, setValidateType] = useState<string>("");
  const actionRef = useRef<ActionType>();
  const {dispatch} = props;

  useEffect(() => {
    dispatch({
      type: 'label/fetchAreas'
    })
  }, []);

  const columns: ProColumns<LabelListItem>[] = [
    {
      title: '番号',
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: '是否被引用',
      dataIndex: 'state',
      valueEnum: {
        1: {text: '未使用'},
        2: {text: '已使用'},
      },
      hideInSearch: true,
    },
    {
      title: '标签类型',
      dataIndex: 'label_type',
      valueEnum: {
        1: {text: '产品'},
        2: {text: '配件'},
      },
    },
    {
      title: '标签名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          {/*<EditTwoTone*/}
          {/*onClick={() => {*/}
          {/*setModalVisible(true);*/}
          {/*setCurrent(record);*/}
          {/*}}/>*/}
          {/*<Divider type="vertical"/>*/}
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

  const handleSubmit = async (values: LabelListItem, callback: Function) => {
    const id = current ? (current as LabelListItem).id : '';

    let promise;
    if (id) {
      promise = await updateLabel({id, data: values})
    } else {
      promise = await createLabel(values);
    }

    // 成功则回调
    if (promise?.id) {
      callback(true)
      setModalVisible(false);
      setCurrent({});
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } else {
      new ValidatePwdResult(promise).validate('成功处理', null, undefined);
    }
  };

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<LabelListItem>> => {
    const searchParamsType = addIcontains(params);
    const result = await queryLabels({...searchParamsType});
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
    const {id, name, label_type} = current as LabelListItem;
    if (validateType === ValidateType.DELETE_URL) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除标签',
        icon: <ExclamationCircleOutlined/>,
        content: `请确认是否删除标签：${identifyLabel(label_type)} - ${name}`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteLabel({id});
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (actionRef.current && success) {
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
      <ProTable<LabelListItem>
        headerTitle="标签列表"
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        size="small"
        actionRef={actionRef}
        rowKey={record => record.id}
        toolBarRender={(action, {selectedRows}) => {
          return [
            <Button icon={<PlusOutlined/>} type="primary" onClick={() => {
              setModalVisible(true);
              setCurrent({});
            }}>
              新建
            </Button>,
          ];
        }}
        tableAlertOptionRender={false}
        request={request}
        columns={columns}
        // rowSelection={{}}
        pagination={{pageSize: 5, showQuickJumper: true}}
      />
      <CreateEditModal
        onSubmit={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setCurrent({});
        }}
        modalVisible={modalVisible}
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
)(LabelList);

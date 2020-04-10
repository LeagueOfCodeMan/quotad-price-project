import React, {useContext, useEffect, useRef, useState} from 'react';
import {Form, InputNumber, Table, Typography} from 'antd';
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {Dispatch} from "redux";
import {modifyProductMemberPrice, modifyProductSecondPrice, queryUsersByProduct} from "@/pages/dfdk/product/service";
import {isNormalResponseBody, productType, ValidatePwdResult} from "@/utils/utils";
import PublishModal, {PublishType} from "@/pages/dfdk/product/product-base/components/PublishModal";
import _ from 'lodash';
const {Text} = Typography;

// @ts-ignore
const EditableContext = React.createContext<any>();

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({index, ...props}) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: ProductBaseListItem;
  handleSave: (record: ProductBaseListItem) => void;
  dispatch: Dispatch<any>;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     title,
                                                     dispatch,
                                                     editable,
                                                     children,
                                                     dataIndex,
                                                     record,
                                                     handleSave,
                                                     ...restProps
                                                   }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      // @ts-ignore
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    // @ts-ignore
    form.setFieldsValue({[dataIndex]: record[dataIndex]});
  };

  const save = async (e: any) => {
    try {
      // @ts-ignore
      const values = await form.validateFields();
      toggleEdit();
      handleSave({...record, ...values});
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{margin: 0}}
        name={dataIndex}
        rules={[
          {
            required: false,
            message: `${title} 格式为¥ 0.00`,
          },
          {
            validator: (rule, value) => {
              if (!value) {
                return Promise.resolve();
              }
              if (value < (parseFloat(record?.leader_price as string || '') || 0)) {
                return Promise.reject('组员价格不能低于组长价格')
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <InputNumber
          // @ts-ignore
          ref={inputRef}
          onPressEnter={save} onBlur={save}
          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
          min={parseFloat(record?.leader_price as string || '') || 0}
        />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{paddingRight: 24}} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

interface EditableTableProps {
  dataSource: ProductBaseListItem[];
  reload: () => void;
}

export type UsersByProductType = {
  id: number;
  product_id: number;
  username: string;
  second_price: string | null;
  leader_price: string | null;
}

const EditableTable: React.FC<EditableTableProps> = ({dataSource, reload}) => {

  const [data, setData] = useState<ProductBaseListItem[]>(dataSource);
  const [list, setList] = useState<UsersByProductType[]>([]);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProductBaseListItem>>({});

  const handleSave = async (row: { id: number; member_price: string; }) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    const response = await modifyProductMemberPrice({id: row?.id, data: {member_price: row?.member_price}});
    const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
    if (success) {
      setData(newData);
      reload();
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
      align: 'center',
      width: 70,
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
      align: 'center',
      width: 70,
      render: (text: string) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '配置类型',
      dataIndex: 'is_required',
      key: 'is_required',
      align: 'center',
      width: 60,
      render: (text: boolean | 0) => {
        return (
          <div style={{textAlign: 'center'}}>
            {text === 0 ? <Text type="warning">标准</Text> : text ?
              <Text style={{color: '#181818'}}>附加</Text> :
              <Text type="danger">选配</Text>
            }
          </div>
        )
      },
    },
    {
      title: '采购价格',
      dataIndex: 'leader_price',
      key: 'leader_price',
      align: 'center',
      width: 100,
      render: (text: string) => (
        <div>
          <Text style={{color: '#1890FF'}}>组长：</Text>
          <Text style={{color: '#FF6A00'}}>¥ {text}</Text>
        </div>
      ),
    },
    {
      title: '一级组员定价',
      dataIndex: 'member_price',
      key: 'member_price',
      width: 100,
      align: 'center',
      editable: true,
      render: (text: string) => {
        return text ? '¥ ' + text : '尚未定价';
      },
    },
    {
      title: '二级组员定价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center',
      render: (text: string, record: ProductBaseListItem) => {
        return (
          <a
            onClick={e => {
              e.preventDefault();
              handleSecondPrice(record);
            }}
          >
            编辑
          </a>
        );
      },
    },
  ];

  const columnsFinal = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const handleSecondPrice = async (record: ProductBaseListItem) => {
    const {id, leader_price} = record;
    const response = await queryUsersByProduct({id});
    if (isNormalResponseBody(response)) {
      setList(_.map(response?.results, o => ({...o, leader_price})) || []);
    }
    setCurrent(record);
    handleUpdateModalVisible(true);
  };

  return (
    <div>
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await modifyProductSecondPrice({id: current?.id as number, data: value as PublishType});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            callback();
            handleUpdateModalVisible(false);
            setCurrent({});
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrent({});
        }}
        updateModalVisible={updateModalVisible}
        list={list}
      />
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered size="small"
        rowKey={record => record?.id + '-' + record?.genre}
        dataSource={data}
        columns={columnsFinal}
        pagination={{pageSize: 3}}
      />
    </div>
  );
}

export default EditableTable;

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Form, InputNumber, Table} from 'antd';
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {Dispatch} from "redux";
import {modifyProductMemberPrice, queryUsersByProduct} from "@/pages/dfdk/product/service";
import {isNormalResponseBody, ValidatePwdResult} from "@/utils/utils";

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
  columns: any;
  reload: () => void;
}

type UsersByProductType = {
  id: number;
  key: number;
  username: string;
  second_price: string | null;
  leader_price: string | null;
}

const EditableTable: React.FC<EditableTableProps> = ({dataSource, columns, reload}) => {

  const [data, setData] = useState<ProductBaseListItem[]>(dataSource);
  const [list, setList] = useState<{ id: number; users: UsersByProductType[]; }[]>([]);

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

  const columnsFinal = columns.map((col: { editable: boolean; dataIndex: any; title: any; }) => {
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

  const columnsUser = [
    {
      title: '二级组员',
      dataIndex: 'username',
      width: 100,
    },
    {
      title: '二级组员定价',
      dataIndex: 'second_price',
      editable: true,
      render: (text: string | number, record) => {
        console.log(text, record);
        return text ? '¥ ' + text : '尚未定价';
      },
    },
  ];

  const columnsUserFinal = columnsUser.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) =>{
        console.log(record);
        return  ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: handleSave2,
        })
      },
    };
  });

  const handleSave2 = (row: { id: number; key: number; }) => {
    const newData = _.head(_.filter(list, d => d.id === row?.key))?.users || [];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    const newList = _.filter(list, d => d.id !== row?.key);
    setList([...newList, {
      id: row?.key, users: newData
    }]);
  };

  const expandedRowRender = (record: ProductBaseListItem) => {
    const expandedList = _.head(_.filter(list, o => o?.id === record?.id))?.users;
    console.log(list);
    return (
      <Table
        components={components}
        rowClassName={() => 'editable-row2'}
        rowKey={record => record?.id}
        dataSource={expandedList}
        columns={columnsUserFinal}
        pagination={false}
      />
    )
  };

  const onExpand = async (expanded: boolean, record: ProductBaseListItem) => {
    if(expanded){
      const {id, leader_price} = record;
      console.log(1111)
      const response = await queryUsersByProduct({id});
      if (isNormalResponseBody(response)) {
        const newList = _.filter(list, d => d.id !== id);
        setList([...newList, {
          id, users:
            _.map(response?.results, o => ({...o, key: id, leader_price})) || []
        }]);
      }
    }
  };

  return (
    <div>
      <Table
        expandable={{
          expandedRowRender,
          onExpand,
          // rowExpandable: record => record.name !== 'Not Expandable',
        }}
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

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, Drawer, Form, InputNumber, Modal, Select, Table, Typography} from 'antd';
import {ProductBaseListItem} from '@/pages/product/data';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {actPrice, addIcontains, calculateProductList, currentPriceNumber, IdentityType} from '@/utils/utils';
import {queryProduct} from '@/pages/product/service';
import Ellipsis from '@/components/Ellipsis';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import {CurrentUser} from '@/models/user';
import _ from 'lodash';
import {TableRowSelection} from 'antd/es/table/interface';
import {ColumnsType} from 'antd/lib/table';

const {Text} = Typography;
const {Option, OptGroup} = Select;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: ProductBaseListItem, uuid: string | undefined, callback: Function) => void;
  onCancel: () => void;
  current?: { uuid: string; data: ProductBaseListItem[] };
  currentUser: CurrentUser;
}

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  state?: 1 | 2;
  search?: string;
  genre: number;

  [propName: string]: any;
}

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
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     title,
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

  const save = async () => {
    try {
      // @ts-ignore
      const values = await form.validateFields();
      toggleEdit();
      handleSave({...record, ...values});
    } catch (errInfo) {
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
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <InputNumber min={record?.is_required ? 1 : 0} ref={inputRef} onPressEnter={save} onBlur={save} size="small"/>
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{paddingRight: 24}} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};


const AddProduct: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {currentUser: {identity}, updateModalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;
  const [listParams, setListParams] = useState<ListSearchParams>({genre: 1});
  const actionRef = useRef<ActionType>();
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState; }>({});
  const [totalPrice, setPrice] = useState<number>(0);
  const [dataSource, setDataSource] = useState<ProductBaseListItem[]>([]);

  const [selectedRows, setSelectedRows] = useState<ProductBaseListItem[]>([]);

  useEffect(() => {
    if (form && !visible && formRef) {
      initData();
      setTimeout(() => form.resetFields(), 0);

    }
  }, [visible]);


  useEffect(() => {
    if (current && formRef) {
      const data = _.head(_.filter(current?.data, d => d?.production > 0));
      const dataChild = _.filter(current?.data, d => !d?.production);
      setTimeout(() => {
        form.setFieldsValue({
          count: data?.count,
        });
        // 编辑时设置初始化
        setPrice(calculateProductList(current?.data, identity as IdentityType));
        setSelectedRows([data as ProductBaseListItem]);
        setDataSource(dataChild);
      }, 0);
    }
  }, [current]);

  const initData = () => {
    setListParams({genre: 1, current: 1});
    setPrice(0);
    setSelectedRows([]);
    setDataSource([]);
  };

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    const row = selectedRows?.[0];
    const children = dataSource?.filter((i: ProductBaseListItem) => i?.count as number > 0);
    const payload = {...row, production: row?.id, count: fieldsValue?.count, conf_par: children};
    handleAdd(payload as ProductBaseListItem, current?.uuid, (callback: boolean) => {
      if (callback) {form.resetFields();}
    });
    if (!current?.uuid) {
      Modal.confirm({
        title: '操作成功', content: '成功添加一个产品至产品清单，是否继续添加',
        okText: '继续添加', cancelText: '返回产品清单',
        onOk: () => {initData();},
        onCancel: () => {initData();onCancel();},
      });
    } else {initData();onCancel();}
  };

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<ProductBaseListItem>> => {
    const searchParamsType = addIcontains(params);
    const result = await queryProduct({...searchParamsType});
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count,
    });
  };
  const columns: ProColumns<ProductBaseListItem>[] =
    [
      {
        title: '产品名称',
        dataIndex: 'name',
        width: 100,
        ellipsis: true,
        render: (text) => {
          return (
            <div>
              <Text style={{color: '#181818'}}>{text}</Text>
            </div>
          );
        },
      },
      {
        title: '型号',
        dataIndex: 'pro_type',
        width: 120,
        render: (text) => {
          return (
            <div>
              <Text style={{color: '#181818'}}>{text}</Text>
            </div>
          );
        },
      },
      {
        title: '产品描述',
        dataIndex: 'desc',
        render: (text) => {
          return (
            <div style={{textAlign: 'left'}}>
              <Ellipsis tooltip lines={1}>
                <p style={{marginBottom: '0px'}}>
                  {(text as string)?.split('\n')?.map((o, i) => {
                    return (
                      <span key={i}>{o}<br/></span>
                    );
                  })}
                </p>
              </Ellipsis>
            </div>
          );
        },
      },
      {
        title: '单价',
        dataIndex: 'price',
        width: 130,
        align: 'right',
        render: (text: any, record) => {
          const price = currentPriceNumber(record, identity);
          return (
            <div>
              <Text style={{color: '#FF6A00'}}>
                {price ?
                  <StatisticWrapper value={price}/>
                  : '尚未定价'}
              </Text>
            </div>
          );
        },
      }
    ];

  // 配件与服务表格
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns2: ColumnsType<ProductBaseListItem> =
    [
      {
        title: '产品名称',
        dataIndex: 'name',
        width: 100,
        ellipsis: true,
        render: (text) => {
          return (
            <div>
              <Text style={{color: '#181818'}}>{text}</Text>
            </div>
          );
        },
      },
      {
        title: '型号',
        dataIndex: 'pro_type',
        width: 120,
        render: (text) => {
          return (
            <div>
              <Text style={{color: '#181818'}}>{text}</Text>
            </div>
          );
        },
      },
      {
        title: '产品描述',
        dataIndex: 'desc',
        render: (text) => {
          return (
            <div style={{textAlign: 'left'}}>
              <Ellipsis tooltip lines={1}>
                <p style={{marginBottom: '0px'}}>
                  {(text as string)?.split('\n')?.map((o, i) => {
                    return (
                      <span key={i}>{o}<br/></span>
                    );
                  })}
                </p>
              </Ellipsis>
            </div>
          );
        },
      },
      {
        title: '配置类型',
        dataIndex: 'is_required',
        key: 'is_required',
        align: 'center',
        width: 80,
        render: (text: boolean | 0) => {
          return (
            <div style={{textAlign: 'center'}}>
              {text === 0 ? <Text type="warning">标准</Text> : text ?
                <Text style={{color: '#181818'}}>附加</Text> :
                <Text type="danger">选配</Text>
              }
            </div>
          );
        },
      },
      {
        title: '单价',
        dataIndex: 'price',
        width: 160,
        align: 'right',
        render: (text: any, record) => {
          const price = currentPriceNumber(record, identity);
          return (
            <div>
              <Text style={{color: '#FF6A00'}}>
                {price ?
                  <StatisticWrapper value={price}/>
                  : '尚未定价'}
              </Text>
            </div>
          );
        },
      },
      {
        title: '数量(个)',
        dataIndex: 'count',
        key: 'count',
        width: 100,
        // @ts-ignore
        editable: true,
        align: 'right',
        render: (text: any) => {
          return (
            <div>
              <Text style={{color: '#1809FF'}}>
                {text}
              </Text>
            </div>
          );
        },
      },
    ];

  const rowSelection: TableRowSelection<ProductBaseListItem> = {
    type: 'radio',
    selectedRowKeys: _.map(selectedRows, d => (d?.id)),
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setPrice(0);
      form.setFieldsValue({count: 1});
      setSelectedRows(selectedRows);
      setDataSource(_.map((_.head(selectedRows) as ProductBaseListItem)?.conf_list as ProductBaseListItem[], d => ({
        ...d,
        count: d?.is_required ? 1 : 0
      })));
    },
  };

  /**
   * 计算价格
   * @param selectedRowKeys
   * @param selectedRows
   */
  useEffect(() => {
    calculate();
  }, [selectedRows, dataSource]);

  const calculate = () => {
    const {count} = form.getFieldsValue();
    if (count) {
      const price = parseFloat(actPrice(_.head(selectedRows), identity));
      const checkPar = dataSource?.filter((i: ProductBaseListItem) => i?.count as number > 0);
      const tPrice = _.reduce(checkPar, (sum, n) => {
        const priceItem = parseFloat(actPrice(n, identity)) * (n?.count || 0);
        return sum + priceItem;
      }, 0);
      const hPrice = (price + tPrice) * count;
      setPrice(hPrice);
    }
  };

  const handleSave = (row: ProductBaseListItem) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const finalColumn = columns2?.map((col: any) => {
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

  return (
    <Drawer
      title={current?.uuid ? '编辑' : '添加' + '产品'}
      visible={visible}
      onClose={() => onCancel()}
      width={1000}
      maskClosable={false}
      footer={
        <div
          style={{
            display: 'flex', justifyContent: 'space-between'
          }}
        >
          <Form
            form={form}
            ref={(ref) => setFormRef(ref)}
          >
            <div style={{display: 'flex', marginLeft: '80px'}}>
              <Form.Item
                name="count"
                label="产品数量"
                rules={[{required: true, message: '产品数量'}]}
              >
                <InputNumber onChange={() => calculate()} min={1} style={{width: 120}} placeholder="采购数量"/>
              </Form.Item>
              <div style={{marginLeft: '30px', display: 'flex', marginTop: '5px'}}>
                <Text style={{fontSize: '16px', color: 'grey'}}>总价：</Text>
                <Text style={{color: '#FF6A00', fontSize: '20px', marginTop: '-5px'}}>
                  {!_.isNaN(totalPrice) ?
                    <StatisticWrapper value={totalPrice} style={{fontSize: '20px'}}/>
                    : '部分尚未定价'}
                </Text>
              </div>
            </div>
          </Form>
          <div>
            <Button onClick={onCancel} style={{marginRight: 8}}>
              取消
            </Button>
            <Button onClick={okHandle} type="primary">
              {current?.uuid ? '确定' : '添加至产品清单'}
            </Button>
          </div>
        </div>
      }
    >
      <div>
        {!current?.uuid ?
          <>
            <div style={{marginBottom: '10px'}}>
              <span style={{color: 'red', fontSize: '16px'}}>产品分类：</span>
              <Select
                value={listParams?.genre} style={{width: 200}}
                onChange={(genre) => {
                  setListParams({...listParams, genre});
                }}
              >
                <OptGroup label="硬件">
                  <Option value={1}>一体机</Option>
                  <Option value={6}>一体机配件</Option>
                  <Option value={2}>云桶</Option>
                </OptGroup>
                <Option value={3}>软件</Option>
                <Option value={7}>服务</Option>
                <Option value={8}>其他</Option>
              </Select>
            </div>
            <ProTable<ProductBaseListItem>
              headerTitle=""
              options={false}
              size="small"
              actionRef={actionRef}
              rowKey={record => record.id}
              tableAlertRender={false}
              tableAlertOptionRender={false}
              toolBarRender={false}
              rowSelection={{...rowSelection}}
              request={request}
              search={false}
              params={{...listParams}}
              columns={columns}
              columnsStateMap={columnsStateMap}
              onColumnsStateChange={map => setColumnsStateMap(map)}
              pagination={{pageSize: 3, showQuickJumper: true, showSizeChanger: false}}
            />
          </> : <ProTable<ProductBaseListItem>
            headerTitle="产品"
            options={false}
            size="small"
            rowKey={record => record.id}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            toolBarRender={false}
            dataSource={selectedRows}
            search={false}
            columns={columns}
            pagination={false}
          />
        }
        {_.head(dataSource) ?
          <>
            <Table
              title={() => '配件与服务'}
              size="small"
              components={components}
              rowClassName={() => 'editable-row'}
              bordered
              rowKey={record => record?.id}
              dataSource={dataSource || []}
              columns={finalColumn}
              pagination={false}
            />
          </> : null
        }
      </div>
    </Drawer>
  );
};

export default AddProduct;

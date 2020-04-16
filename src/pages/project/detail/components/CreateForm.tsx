import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Divider, Form, InputNumber, Modal, Row, Select, Steps, Table, Typography} from 'antd';
import {v4 as uuidv4} from 'uuid';
import {Moment} from 'moment';
import {actPrice, currentPrice, isNormalResponseBody, ProductType, productType} from '@/utils/utils';
import _ from 'lodash';
import {queryStandardProduct} from '@/pages/dfdk/product/service';
import {ProductBaseListItem} from '@/pages/dfdk/product/data';
import {CurrentUser} from "@/models/user";
import styles from '../style.less';
import {ColumnsType} from "antd/lib/table";
import {ProductList} from "@/pages/project/service";
import {ProjectListItem} from "@/pages/project/data";

const {Text} = Typography;

export interface FormValueType {
  genre?: number;
  production?: number;
  count?: number;
  conf_par?: { id: number; count: number; }[];
  project_name?: string;
  project_company?: string;
  delivery_time?: Moment;
  project_addr?: number;
}

export interface UpdateFormProps extends ProjectListItem {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: ProductList) => void;
  updateModalVisible: boolean;
  currentUser: CurrentUser;
}

const {Step} = Steps;
const {Option} = Select;

const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const CreateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  const [dataSource, setDataSource] = useState<ProductBaseListItem[]>([]);
  const [current, setCurrent] = useState<ProductBaseListItem>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalPrice, setPrice] = useState<string>("0.00");

  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    currentUser: {identity}, project_name,
  } = props;

  useEffect(() => {
    if (current && formRef) {
      setTimeout(() => {
        const conf_par: { id: number; count: number; }[] = [];
        current?.conf_list?.forEach(d => {
          conf_par.push({id: d?.id, count: d?.is_required ? 1 : 0})
        });
        form.setFieldsValue({
          conf_par: conf_par
        });
      }, 0)
    }
  }, [current]);

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();

    setFormVals({...formVals, ...fieldsValue});

    if (currentStep < 1) {
      if (currentStep === 0) {
        const checkPar = fieldsValue?.conf_par?.filter((i: { count: number; }) => i?.count > 0);
        const conf_list: ProductBaseListItem[] = [];
        _.forEach(current?.conf_list, o => {
          const target = _.head(_.filter(checkPar, d => d?.id === o?.id));
          if (target) {
            conf_list.push({...o, count: target?.count, uuid: uuidv4(),});
          }
        });
        setDataSource([...dataSource, {
          ...current, count: fieldsValue?.count, conf_list, conf_par: checkPar, uuid: uuidv4(), is_required: 0,
        } as ProductBaseListItem]);
      }
      forward();
    } else {
      const product_list = _.map(dataSource, o => {
        return (
          {production: o?.id, count: o?.count, conf_par: o?.conf_par}
        )
      });
      handleUpdate(product_list as ProductList);
    }
  };

  const fetchProduct = _.debounce(async () => {
    const response = await queryStandardProduct({
      genre: form.getFieldValue('genre'),
      pageSize: 9999,
    });
    if (isNormalResponseBody(response)) {
      setData(response?.results || []);
    }
  }, 800);

  const handleChange = (value: number) => {
    calculate();
    setCurrent(_.head(_.filter(data, o => o?.id === value)));
  };

  /**
   * 计算价格
   * @param selectedRowKeys
   * @param selectedRows
   */
  const calculate = () => {
    const {count, conf_par} = form.getFieldsValue();
    if (count) {
      const price = parseFloat(actPrice(current, identity) || '0');
      const checkPar = conf_par?.filter((i: { count: number; }) => i?.count > 0);
      const tPrice = _.reduce(checkPar, (sum, n) => {
        const item = _.head(_.filter(current?.conf_list, o => o?.id === n?.id));
        const priceItem = parseFloat(actPrice(item, identity) || '0') * n?.count;
        return sum + priceItem;
      }, 0) || 0;
      const hPrice = (price + tPrice) * count;
      const fPrice: string = hPrice % 1 !== 0 ? hPrice.toString() : hPrice + '.00';
      const price2 = _.isNaN(fPrice) ? '部分未定价' : '¥ ' + fPrice;
      setPrice(price2);
    }
  };

  const columns: ColumnsType<ProductBaseListItem> = [
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
      width: 100,
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
      width: 80,
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
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 100,
      render: (text: string, record: ProductBaseListItem) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>{currentPrice(record, identity)}</Text>
          </div>
        )
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 70,
      render: (text: number) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
  ];

  const operation: ColumnsType<ProductBaseListItem> = [
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      width: 60,
      render: (text: undefined, record: ProductBaseListItem) => {
        return (
          <div style={{textAlign: 'center'}}>
            <a
              onClick={e => {
                e.preventDefault();
                remove(record);
              }}
              style={{color: '#FF4D4F'}}
            >
              删除
            </a>
          </div>
        )
      },
    },
  ];

  const remove = (record: ProductBaseListItem) => {
    const nDataSource = [...dataSource];
    _.remove(nDataSource, d => d?.uuid === record?.uuid);
    setDataSource(nDataSource);
  };

  const expandedRowRender = (record: ProductBaseListItem) => {
    return (
      <Table
        showHeader={false}
        size="small" rowKey={record => record?.uuid as string}
        columns={columns}
        dataSource={record?.conf_list || []}
        pagination={false}
        scroll={{y: 78}}
      />
    );
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <Alert
            message="产品清单"
            type="info"
            closable
          />
          <Table
            rowKey={record => record?.uuid as string}
            columns={columns.concat(operation)}
            expandable={{expandedRowRender}}
            dataSource={dataSource}
            pagination={false}
            scroll={{y: 195}}
            summary={pageData => {
              const tPrice = _.reduce(pageData, (sum, n) => {
                const price = parseFloat(actPrice(n, identity) || '0');
                const priceItem = _.reduce(n?.conf_list, (sum2, n2) => {
                  const price2 = parseFloat(actPrice(n2, identity) || '0');
                  return sum2 + price2 * (n2?.count || 0);
                }, 0) || 0;
                return sum + (price + priceItem) * (n?.count || 0);
              }, 0) || 0;

              const fPrice: string = tPrice % 1 !== 0 ? tPrice.toString() : tPrice + '.00';
              const mes = _.isNaN(fPrice) ? '部分未定价' : '¥ ' + fPrice;
              return (
                <>
                  <tr>
                    <th>
                      <div style={{width: '40px'}}>总计</div>
                    </th>
                    <td colSpan={6}>
                      <Text type="danger">{mes}</Text>
                    </td>
                  </tr>
                </>
              );
            }}

          />
        </>
      );
    }
    return (
      <>
        <Row gutter={[8, 8]}>
          <Col span={11}>
            <Form.Item
              label="产品类别"
              name="genre"
              rules={[{required: true, message: '产品类型'}]}
            >
              <Select
                placeholder="产品类别"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                onChange={() => {
                  fetchProduct();
                }}
                style={{width: '120px'}}
              >
                {(productType(-1) as ProductType[]).map(v => {
                  return (
                    <Option key={v.key} value={v.key} label={v.label}>
                      {v.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={13} style={{marginLeft: '-45px'}}>
            <Form.Item
              name="production"
              label="产品选择"
              rules={[
                ({getFieldValue}) => ({
                  validator(rule, value) {
                    if (!getFieldValue('genre')) {
                      return Promise.reject('请先选择产品类别!');
                    } else if (!value) {
                      return Promise.reject('请选择产品');
                    }
                    return Promise.resolve();
                  },
                })
              ]}
            >
              <Select
                showSearch
                placeholder="基础选配"
                notFoundContent="请先选择类别"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                onChange={handleChange}
                style={{width: 256}}
                dropdownMatchSelectWidth={300}
              >
                {data?.map(d => (
                  <Option
                    key={d.id}
                    value={d.id}
                    label={d.pro_type + '-' + productType(d.genre) + '-' + d.leader_price}
                  >
                    <div>
                      <span>{d.pro_type}</span>
                      <Divider type="vertical"/>
                      <span>{productType(d.genre)}</span>
                      <Divider type="vertical"/>
                      <span style={{color: '#FF6A00'}}>价格：¥{actPrice(d, identity)}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {form.getFieldValue('production') ?
          <>
            <Alert message="服务与配件" type="info" closable style={{marginBottom: '10px'}}/>
            <div className={styles.standardWrapper}>
              <div className={styles.standardInner}>
                <Form.List name="conf_par">
                  {fields => {
                    return (
                      <div>
                        {fields.map((field, index) => {
                          const conf: ProductBaseListItem = current?.conf_list?.[index] as ProductBaseListItem;
                          return (
                            <Row key={field.key} gutter={[8, 8]}>
                              <Col span={16} style={{marginLeft: '-20px'}}>
                                <Form.Item
                                  name={[field.name, 'id']}
                                  label={<Text strong>{productType(conf?.genre)}</Text>}
                                  // @ts-ignore
                                  fieldKey={[field.fieldKey, 'id']}
                                >
                                  <Select disabled style={{width: 256}} showArrow={false}>
                                    <Option key={conf?.id} value={conf?.id}>
                                      <div>
                                        <span>{conf?.pro_type}</span>
                                        <Divider type="vertical"/>
                                        <span style={{color: '#FF6A00'}}>价格：¥{actPrice(conf, identity)}</span>
                                      </div>
                                    </Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  name={[field.name, 'count']}
                                  label={<Text type="secondary">数量：</Text>}
                                  // @ts-ignore
                                  fieldKey={[field.fieldKey, 'count']}
                                  rules={[{required: true, message: '数量'}]}
                                >
                                  <InputNumber
                                    onChange={() => calculate()}
                                    style={{marginLeft: '20px'}} placeholder="采购数量"
                                    min={conf?.is_required ? 1 : 0}/>
                                </Form.Item>
                              </Col>
                            </Row>
                          )
                        })}
                      </div>
                    );
                  }}
                </Form.List>
              </div>
            </div>
          </> : null
        }
        <Row gutter={[8, 8]} style={{marginTop: '10px'}}>
          <Col span={11}>
            <Form.Item
              name="count"
              label="产品数量"
              rules={[
                ({getFieldValue}) => ({
                  validator(rule, value) {
                    if (value && !getFieldValue('production')) {
                      return Promise.reject('请先选择产品!');
                    } else if (!value) {
                      return Promise.reject('输入数量');
                    }
                    return Promise.resolve();
                  },
                })
              ]}
            >
              <InputNumber onChange={() => calculate()} style={{width: 120}} placeholder="采购数量" min={1}/>
            </Form.Item>
          </Col>
          <Col span={13}>
              <span style={{color: '#FF6A00', fontSize: '18px'}}>
                <span style={{fontSize: '14px', color: 'grey'}}>总价：</span>
                {totalPrice || '0.00'}</span>
          </Col>
        </Row>
      </>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button style={{float: 'left'}} onClick={backward}>
            继续添加
          </Button>
          <Button onClick={() => {
            setFormVals({});
            handleUpdateModalVisible();
          }}>取消</Button>
          <Button type="primary" onClick={() => handleNext()} disabled={!_.head(dataSource)}>
            完成
          </Button>
        </>
      );
    }
    return (
      <>
        <Button onClick={() => {
          setFormVals({});
          handleUpdateModalVisible();
        }}>取消</Button>
        <Button type="primary" onClick={() => handleNext()}>
          下一步
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{padding: '32px 40px 48px'}}
      destroyOnClose
      title={<div>给<span style={{color: '#1857FF'}}>{project_name}</span>添加产品</div>}
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => {
        setFormVals({});
        handleUpdateModalVisible();
      }}
      afterClose={() => {
        setFormVals({});
        handleUpdateModalVisible();
      }}
      className={styles.createFormStyle}
    >
      <Steps style={{marginBottom: 28}} size="small" current={currentStep}>
        <Step title="添加产品"/>
        <Step title="产品清单"/>
      </Steps>
      <Form
        {...formLayout}
        form={form}
        ref={(ref) => setFormRef(ref)}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;
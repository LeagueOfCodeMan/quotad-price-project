import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Steps,
  Table,
  Typography
} from 'antd';
import {v4 as uuidv4} from 'uuid';
import _ from 'lodash';
import {queryProduct} from '../../product/service';
import {ProductBaseListItem} from '../../product/data';
import styles from '../style.less';
import {ColumnsType} from "antd/lib/table";
import {ProductList} from "../service";
import {CurrentUser} from "@/models/user";
import {actPrice, isNormalResponseBody, productType} from "@/utils/utils";
import {ProjectListItem} from "@/pages/project/data";
import {useToggle} from "react-use";


export interface FormValueType {
  genre?: number;
  production?: number;
  count?: number;
  conf_par?: { id: number; count: number; }[];
  company?: string;
  addr?: string;
  contact?: string;
  phone?: string;
  bill_id?: string;
  bill_addr?: string;
  bill_phone?: string;
  bill_bank?: string;
  bill_account?: string;
  contract_addr?: string;
  contract_contact?: string;
  contract_phone?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: CreateOrderParams) => void;
  updateModalVisible: boolean;
  currentUser: CurrentUser;
  current?: NotRequired<ProjectListItem>;
}

export interface CreateOrderParams {
  company: string;
  addr: string;
  contact: string;
  phone: string;
  bill_id: string;
  bill_addr: string;
  bill_phone: string;
  bill_bank: string;
  bill_account: string;
  contract_addr: string;
  contract_contact: string;
  contract_phone: string;
  product_list: ProductList;
}

const {Step} = Steps;

const {Text} = Typography;
const {Option, OptGroup} = Select;
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const CreateOrder: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  const [dataSource, setDataSource] = useState<ProductBaseListItem[]>([]);
  const [current, setCurrent] = useState<ProductBaseListItem>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalPrice, setPrice] = useState<string>("0.00");
  const [add, toggleAdd] = useToggle(false);

  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    currentUser: {identity},
    current: current2
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

  useEffect(() => {
    if (_.head(current2?.product_list)) {
      const data = current2?.product_list?.map(item => {
        return (
          {
            ...item, price:getPriceBasedIdentity(item?.production), ...item?.production, uuid: uuidv4(),
            conf_par: _.map(item?.conf_par, d => ({...d, price: getPriceBasedIdentity(d), uuid: uuidv4(),}))
          }
        )
      });
      setDataSource(data as ProductBaseListItem[]);
    }
  }, [current2]);

  const getPriceBasedIdentity = (item: ProductBaseListItem | undefined) => {
    let price;
    if (identity === 2) {
      price = item?.leader_quota || item?.leader_price;
    } else if (identity === 3) {
      if (item?.sell_quota) {
        price = item?.member_price;
      }
    } else if (identity === 4) {
      price = item?.second_price;
    }
    return price;
  };

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const addProductToList = async () => {
    const fieldsValue = await form.validateFields();

    setFormVals({...formVals, ...fieldsValue});
    const checkPar = fieldsValue?.conf_par?.filter((i: { count: number; }) => i?.count > 0);
    const conf_list: ProductBaseListItem[] = [];
    _.forEach(current?.conf_list, o => {
      const target = _.head(_.filter(checkPar, d => d?.id === o?.id));
      if (target) {
        conf_list.push({...o, price: getPriceBasedIdentity(o), count: target?.count, uuid: uuidv4(),});
      }
    });
    setDataSource([...dataSource, {
      ...current,
      price: getPriceBasedIdentity(current),
      count: fieldsValue?.count,
      conf_par: conf_list,
      uuid: uuidv4(),
    } as ProductBaseListItem]);
    toggleAdd();
  };

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();
    console.log(fieldsValue);
    setFormVals({...formVals, ...fieldsValue});

    if (currentStep < 2) {
      if (currentStep === 1) {

      }
      forward();
    } else {
      const {
        company, addr, contact, phone,
        bill_id, bill_addr, bill_phone, bill_bank, bill_account,
        contract_addr, contract_contact, contract_phone,
      } = fieldsValue;
      const product_list = _.map(dataSource, o => {
        return (
          {production: o?.id, count: o?.count, conf_par: _.map(o?.conf_par, d => ({id: d?.id, count: d?.count}))}
        )
      });
      const payload = {
        company, addr, contact, phone,
        bill_id, bill_addr, bill_phone, bill_bank, bill_account,
        contract_addr, contract_contact, contract_phone, product_list
      };
      handleUpdate(payload as CreateOrderParams);
    }
  };

  const fetchProduct = _.debounce(async (index: any) => {
    const payload = {pageSize: 9999,};
    if (index === 1) {
      payload['genre__lte'] = 2;
      payload['genre__gte'] = 1;
    } else {
      payload['genre__lte'] = 5;
      payload['genre__gte'] = 3;
    }
    const response = await queryProduct(payload);
    if (isNormalResponseBody(response)) {
      setData(response?.results || []);
    }
  }, 800);

  const handleChange = (value: any) => {
    const checkedCurrent = _.head(_.filter(data, o => o?.id === value?.value));
    calculate();
    setCurrent(checkedCurrent);
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
      width: 83,
      render: (text) => {
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
      width: 117,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '采购价格',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 117,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>{text || '尚未定价'}</Text>
          </div>
        )
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 60,
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
      width: 120,
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
        dataSource={record?.conf_par || []}
        pagination={false}
        scroll={{y: 78}}
      />
    );
  };

  const renderContent = () => {
    const {project_name, project_desc, user_name, user_addr, user_iphone, user_contact}
      = current2 as ProjectListItem;
    if (currentStep === 1) {
      return (
        <>
          {add ?
            <>
              <Alert message="产品选择" type="info" style={{marginBottom: '10px'}}/>
              <Row gutter={[8, 8]}>
                <Col span={11}>
                  <Form.Item
                    label="产品类别"
                    name="genre"
                    rules={[{required: true, message: '产品类型'}]}
                  >
                    <Select
                      placeholder="产品类别"
                      onChange={(val) => {
                        fetchProduct(val);
                      }}
                      style={{width: '120px'}}
                    >
                      <Option value={1}>硬件</Option>
                      <Option value={2}>软件</Option>
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
                      labelInValue
                      placeholder="必选配置"
                      notFoundContent="请先选择类别"
                      filterOption={false}
                      style={{width: '100%'}}
                      onChange={handleChange}
                      dropdownMatchSelectWidth={300}
                    >
                      {
                        (productType(form.getFieldValue("genre") === 1 ? -3 : -4) as { label: string; key: number; }[])?.map(d => {

                          return (
                            <OptGroup label={<span style={{color: '#FF6A00'}}>{d?.label}</span>} key={d?.key}>
                              {
                                _.filter(data, o => o?.genre === d?.key)?.map(d2 => {
                                  const priceText = actPrice(d2, identity);
                                  const priceTextFinal = priceText === '0.00' ? '尚未定价' : '价格：¥' + priceText;
                                  return (
                                    <Option key={d2?.id} value={d2?.id}>
                                      <>
                                        <span>{d2?.pro_type}</span>
                                        <Divider type="vertical"/>
                                        <span style={{color: '#FF6A00'}}>{priceTextFinal}</span>
                                      </>
                                    </Option>
                                  )
                                })
                              }
                            </OptGroup>
                          )
                        })
                      }
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {_.head(current?.conf_list) ?
                <>
                  <div className={styles.standardWrapper}>
                    <div className={styles.standardInner}>
                      <Form.List name="conf_par">
                        {fields => {
                          return (
                            <div>
                              {fields.map((field, index) => {
                                const conf: ProductBaseListItem = current?.conf_list?.[index] as ProductBaseListItem;
                                const priceText = actPrice(conf, identity);
                                const priceTextFinal = priceText === '0.00' ? '尚未定价' : '价格：¥' + priceText;
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
                                              <span style={{color: '#FF6A00'}}>{priceTextFinal}</span>
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
                <Col span={7}>
              <span style={{color: '#FF6A00', fontSize: '18px'}}>
                <span style={{fontSize: '14px', color: 'grey'}}>总价：</span>
                {totalPrice || '0.00'}</span>
                </Col>
                <Col span={6}>
                  <Button type="primary" size="small" onClick={() => addProductToList()}>
                    添加
                  </Button>
                </Col>
              </Row>
            </> : null}
          <Alert
            message="产品清单"
            type="info"
          />
          {add ? null :
            <Button type="primary" style={{margin: '10px 0'}} onClick={() => toggleAdd()}>添加产品</Button>}
          <Table
            rowKey={record => record?.uuid as string}
            columns={columns.concat(operation)}
            expandable={{expandedRowRender}}
            dataSource={dataSource}
            pagination={false}
            scroll={{y: 195}}
            summary={pageData => {
              const tPrice = _.reduce(pageData, (sum, n) => {
                const price = n?.price - 0;
                const priceItem = _.reduce(n?.conf_par, (sum2, n2) => {
                  const price2 = n2?.price - 0;
                  return sum2 + price2 * (n2?.count || 0);
                }, 0);
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
    if (currentStep === 2) {
      return (
        <>
          <div>
            <Row gutter={[8, 8]}>
              <Col span={24} style={{marginLeft: '-28px'}}>
                <Form.Item
                  label="甲方单位或公司"
                  name="company"
                  rules={[{required: true, message: '甲方单位或公司'}]}
                >
                  <Input placeholder="项目名称" style={{width: 425}}/>
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="收货信息"
              type="info"
            />
            <Row gutter={[8, 8]}>
              <Col span={24} style={{marginLeft: '-67px'}}>
                <Form.Item
                  label="交货地址"
                  name="addr"
                  rules={[{required: true, message: '交货地址'}]}
                >
                  <Input placeholder="交货地址" style={{width: 467}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="联系人"
                  name="contact"
                  rules={[{required: true, message: '联系人'}]}
                >
                  <Input placeholder="联系人" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="phone"
                  rules={[{required: true, message: '电话'}]}
                >
                  <Input placeholder="电话" style={{width: 200}}/>
                </Form.Item>
              </Col>
            </Row>
            <Alert
              message="开票信息"
              type="info"
            />
            <Row gutter={[8, 8]}>
              <Col span={24} style={{marginLeft: '-80px'}}>
                <Form.Item
                  label="税号"
                  name="bill_id"
                  rules={[{required: true, message: '税号'}]}
                >
                  <Input placeholder="税号" style={{width: 481}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="地址"
                  name="bill_addr"
                  rules={[{required: true, message: '地址'}]}
                >
                  <Input placeholder="地址" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="bill_phone"
                  rules={[{required: true, message: '电话'}]}
                >
                  <Input placeholder="电话" style={{width: 200}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="开户行"
                  name="bill_bank"
                  rules={[{required: true, message: '开户行'}]}
                >
                  <Input placeholder="开户行" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>

                <Form.Item
                  label="账号"
                  name="bill_account"
                  rules={[{required: true, message: '账号'}]}
                >
                  <Input placeholder="账号" style={{width: 200}}/>
                </Form.Item>
              </Col>
            </Row>
            <Alert
              message="开票、合同收货信息"
              type="info"
            />
            <Row gutter={[8, 8]}>
              <Col span={24} style={{marginLeft: '-80px'}}>
                <Form.Item
                  label="地址"
                  name="contract_addr"
                  rules={[{required: true, message: '地址'}]}
                >
                  <Input placeholder="地址" style={{width: 480}}/>
                </Form.Item>
              </Col>

            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="联系人"
                  name="contract_contact"
                  rules={[{required: true, message: '联系人'}]}
                >
                  <Input placeholder="联系人" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="contract_phone"
                  rules={[{required: true, message: '电话'}]}
                >
                  <Input placeholder="电话" style={{width: 200}}/>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
      );
    }
    return (
      <>
        <Alert message="项目信息" type="info" style={{marginBottom: '10px'}}/>
        <div className={styles.listContentWrapper}>
          <Descriptions column={4} layout="vertical">
            <Descriptions.Item label="项目名称" span={2}>
              <Text style={{color: '#181818'}}>{project_name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="项目描述" span={2}>
              {project_desc?.split("\n")?.map((o, i) => {
                return (
                  <div key={i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
                )
              })}
            </Descriptions.Item>
            <Descriptions.Item label="用户信息" span={4}>
              用户： <Text style={{color: '#181818'}}>{user_name || ''}</Text>
              <Divider type="vertical"/>
              地址：<Text style={{color: '#181818'}}>{user_addr || ''}</Text>
              <br/>
              电话：<Text style={{color: '#181818'}}>{user_iphone || ''}</Text>
              <Divider type="vertical"/>
              联系人：<Text style={{color: '#181818'}}>{user_contact || ''}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button style={{float: 'left'}} onClick={backward}>
            上一步
          </Button>
          <Button onClick={() => {
            setFormVals({});
            handleUpdateModalVisible();
          }}>取消</Button>
          <Button type="primary" onClick={() => handleNext()}>
            下一步
          </Button>
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <Button style={{float: 'left'}} onClick={backward}>
            上一步
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
      title="创建订单"
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
      className={styles.createOrderStyle}
      maskClosable={false}
    >
      <Steps style={{marginBottom: 28}} size="small" current={currentStep}>
        <Step title="项目信息确认"/>
        <Step title="产品清单确认"/>
        <Step title="销售详细信息"/>
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

export default CreateOrder;

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
import {CreateProjectParams} from "../service";
import {CurrentUser} from "@/models/user";
import {actPrice, currentPrice, isNormalResponseBody, productType} from "@/utils/utils";


export interface FormValueType {
  genre?: number;
  production?: number;
  count?: number;
  conf_par?: { id: number; count: number; }[];
  project_name?: string;
  project_desc?: string;
  user_name?: string;
  user_iphone?: string;
  user_contact?: string;
  user_addr?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: CreateProjectParams) => void;
  updateModalVisible: boolean;
  currentUser: CurrentUser;
}

const {Step} = Steps;

const {Text} = Typography;
const {TextArea} = Input;
const {Option, OptGroup} = Select;
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
    currentUser: {identity}
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

    if (currentStep < 2) {
      if (currentStep === 1) {
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
      const {project_name, project_desc, user_name, user_addr, user_iphone, user_contact} = formVals;
      const product_list = _.map(dataSource, o => {
        return (
          {production: o?.id, count: o?.count, conf_par: o?.conf_par}
        )
      });
      const payload = {
        project_name, project_desc, product_list
        , user_name, user_addr, user_iphone, user_contact
      };
      handleUpdate(payload as CreateProjectParams);
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
    const {project_name, project_desc, user_name, user_addr, user_iphone, user_contact} = formVals;
    if (currentStep === 1) {
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
                              return (
                                <Option key={d2?.id} value={d2?.id}>
                                  <>
                                    <span>{d2?.pro_type}</span>
                                    <Divider type="vertical"/>
                                    <span style={{color: '#FF6A00'}}>{currentPrice(d2, identity)}</span>
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
                                          <span style={{color: '#FF6A00'}}>{currentPrice(conf, identity)}</span>
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
                {totalPrice ? '部分未定价' : '¥ ' + totalPrice}</span>
            </Col>
          </Row>
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <Alert message="项目信息" type="info" closable style={{marginBottom: '10px'}}/>
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
                用户： <Text style={{color: '#181818'}}>{user_name}</Text>
                <Divider type="vertical"/>
                地址：<Text style={{color: '#181818'}}>{user_addr}</Text>
                <br/>
                电话：<Text style={{color: '#181818'}}>{user_iphone}</Text>
                <Divider type="vertical"/>
                联系人：<Text style={{color: '#181818'}}>{user_contact}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
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
        <div>
          <Form.Item
            label="项目名称"
            name="project_name"
            rules={[{required: true, message: '项目名称'}]}
          >
            <Input placeholder="项目名称" style={{width: 270}}/>
          </Form.Item>
          <Form.Item label="项目描述" name="project_desc" rules={[{required: true, message: '项目描述'}]}>
            <TextArea rows={2} placeholder="请输入至少五个字符" style={{width: 270}}/>
          </Form.Item>
        </div>
        <div style={{border: '1px dashed #dddddd'}}>
          <div style={{textAlign: "center", color: '#1890FF', fontWeight: 'bold', margin: '10px 0'}}>用户信息</div>
          <Form.Item
            label="用户"
            name="user_name"
            rules={[{required: true, message: '用户'}]}
          >
            <Input placeholder="用户" style={{width: 270}}/>
          </Form.Item>
          <Form.Item
            label="地址"
            name="user_addr"
          >
            <Input placeholder="地址" style={{width: 270}}/>
          </Form.Item>
          <Form.Item
            label="电话"
            name="user_iphone"
          >
            <Input placeholder="电话" style={{width: 270}}/>
          </Form.Item>
          <Form.Item
            label="联系人"
            name="user_contact"
          >
            <Input placeholder="联系人" style={{width: 270}}/>
          </Form.Item>
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
      title="创建项目"
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
        <Step title="填写项目信息"/>
        <Step title="添加产品"/>
        <Step title="创建信息确认"/>
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

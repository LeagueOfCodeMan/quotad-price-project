import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Form, Input, List, Modal, Row, Space, Steps, Table, Typography} from 'antd';
import _ from 'lodash';
import {ProductBaseListItem} from '../../product/data';
import styles from '../style.less';
import {ColumnsType} from 'antd/lib/table';
import {ProductList} from '../service';
import {CurrentUser} from '@/models/user';
import {
  calculateOtherList,
  currentPriceNumber,
  handleProductListInProjectFormData,
  handleProjectListItemData
} from '@/utils/utils';
import {ProjectListItem} from '@/pages/project/data';
import {useToggle} from 'react-use';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import Ellipsis from '@/components/Ellipsis';


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
  other_list?: { pro_type: string; price: string; count: number; }[];
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: CreateOrderParams) => void;
  updateModalVisible: boolean;
  currentUser: CurrentUser;
  current?: ProjectListItem;
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
  label?: 1 | 2; // 1订单  2 合同
  other_list: { name: string; price: string; count: number; }[];
}

const {Step} = Steps;

const {Text} = Typography;
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const CreateOrder: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [disabled, toggleDisabled] = useToggle(true);

  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    currentUser: {identity},
    current
  } = props;
  const {
     sell_total_quota,
    product_list, other_list, company
  } = current as ProjectListItem;
  useEffect(() => {
    if (current && formRef) {
      setTimeout(() => {
        form.setFieldsValue({
          ...current
        });
      }, 0);
    }
  }, [current]);

  const dataSource = handleProjectListItemData(product_list);
  console.log(dataSource);
  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();
    setFormVals({...formVals, ...fieldsValue});

    if (currentStep < 2) {

      if (currentStep === 0) {
        if (_.isEqual(company, fieldsValue?.company)) {
          toggleDisabled(true);
        } else {
          toggleDisabled(false);
        }
      }
      forward();
    } else {
      const {company} = formVals;
      const {
        addr, contact, phone,
        bill_id, bill_addr, bill_phone, bill_bank, bill_account,
        contract_addr, contract_contact, contract_phone,
      } = fieldsValue;

      const product_list = handleProductListInProjectFormData(dataSource);
      const label = disabled ? 1 : 2;
      const payload = {
        company, addr, contact, phone,
        bill_id, bill_addr, bill_phone, bill_bank, bill_account,
        contract_addr, contract_contact, contract_phone, product_list, other_list, label
      };
      handleUpdate(payload as CreateOrderParams);
    }
  };

  const columnsOtherList: ColumnsType<any> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 160,
      render: (text: string) => {
        return (
          <div>
            <Ellipsis tooltip lines={1}>
              {text}
            </Ellipsis>
          </div>
        );
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      width: 120,
      align: 'center',
      render: (text: string) => {
        return (
          <div>
            <Ellipsis tooltip lines={1}>
              {text}
            </Ellipsis>
          </div>
        );
      },
    },
    {
      title: '产品描述',
      dataIndex: 'desc',
      width: 190,
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
      width: 170,
      align: 'right',
      render: (text: any) => {
        const price = parseFloat(text || '');
        return (
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <StatisticWrapper value={price}/>
          </div>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 170,
      align: 'center',
      render: (value, row, index) => {
        const obj: {
          props: { rowSpan?: number; [propName: string]: any; };
          [propName: string]: any;
        } = {
          children: <div>
            <StatisticWrapper value={calculateOtherList(other_list)}/>
          </div>,
          props: {},
        };
        if (row?.production > 0) {
          obj.props.rowSpan = other_list?.length;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ];

  const renderContent = () => {
    const total_price = parseFloat(sell_total_quota || '');
    if (currentStep === 1) {
      return (
        <>
          <div style={{margin: '10px 0'}}>
            <Alert
              message="产品清单"
              type="info"
            />
          </div>
          <div style={{margin: '5px 30px 0 30px', display: 'flex', justifyContent: 'flex-end'}}>
            <Text strong style={{fontSize: '16px', color: 'grey'}}>总价：</Text>
            <Text style={{color: '#FF6A00', fontSize: '20px', marginTop: '-5px'}}>
              {!_.isNaN(total_price) ?
                <StatisticWrapper value={total_price} style={{fontSize: '20px'}}/>
                : '部分尚未定价'}
            </Text>
          </div>
          <List
            size="large"
            rowKey={(record: { uuid: any; }) => record?.uuid}
            pagination={false}
            dataSource={dataSource || []}
            renderItem={(item: { uuid: string; data: ProductBaseListItem[] }, index: number) => {
              const account = _.head(_.filter(item?.data, d => d?.production > 0))?.sell_quota;

              const columns: ColumnsType<any> = [
                {
                  title: '产品名称',
                  dataIndex: 'name',
                  key: 'name',
                  align: 'center',
                  width: 160,
                  render: (text: string) => {
                    return (
                      <div>
                        <Ellipsis tooltip lines={1}>
                          {text}
                        </Ellipsis>
                      </div>
                    );
                  },
                },
                {
                  title: '型号',
                  dataIndex: 'pro_type',
                  key: 'pro_type',
                  width: 120,
                  align: 'center',
                  render: (text: string) => {
                    return (
                      <div>
                        <Ellipsis tooltip lines={1}>
                          {text}
                        </Ellipsis>
                      </div>
                    );
                  },
                },
                {
                  title: '产品描述',
                  dataIndex: 'desc',
                  width: 190,
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
                  width: 170,
                  align: 'right',
                  render: (text: any, record) => {
                    const price = currentPriceNumber(record, identity);
                    return (
                      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Text style={{color: '#FF6A00', textAlign: 'right'}}>
                          {price ?
                            <StatisticWrapper value={price}/>
                            : '尚未定价'}
                        </Text>
                      </div>
                    );
                  },
                },
                {
                  title: '数量',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'center',
                  width: 100,
                },
                {
                  title: '金额',
                  dataIndex: 'total_price',
                  key: 'total_price',
                  width: 170,
                  align: 'center',
                  render: (value, row, index) => {
                    const obj: {
                      props: { rowSpan?: number; [propName: string]: any; };
                      [propName: string]: any;
                    } = {
                      children: <div>
                        <Text style={{color: '#FF6A00'}}>
                          {account ?
                            <StatisticWrapper value={account}/>
                            : '部分尚未定价'}
                        </Text>
                      </div>,
                      props: {},
                    };
                    if (row?.production > 0) {
                      obj.props.rowSpan = item?.data?.length;
                    } else {
                      obj.props.rowSpan = 0;
                    }
                    return obj;
                  },
                },
              ];
              return (
                <List.Item
                >
                  <div>
                    <Space style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Text strong>产品{index + 1}</Text>
                    </Space>
                    <Table
                      bordered
                      size="small"
                      rowKey={record => record?.id}
                      columns={columns}
                      pagination={false}
                      dataSource={item?.data || []}
                    />
                  </div>
                </List.Item>
              );
            }}
          >
          </List>
          {_.head(other_list) ?
            <div style={{padding: '16px 24px'}}>
              <Space style={{display: 'flex', justifyContent: 'space-between'}}>
                <Text strong>附加产品</Text>
              </Space>
              <Table
                bordered
                size="small"
                rowKey={record => record?.id}
                columns={columnsOtherList}
                pagination={false}
                dataSource={other_list || []}
              />
            </div> : null
          }
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <div>
            <Alert
              message="收货信息"
              type="info"
            />
            <Row gutter={[8, 8]}>
              <Col span={24} style={{marginLeft: '-67px'}}>
                <Form.Item
                  label="交货地址"
                  name="addr"
                  rules={[{required: false, message: '交货地址'}]}
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
                  rules={[{required: false, message: '联系人'}]}
                >
                  <Input placeholder="联系人" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="phone"
                  rules={[{required: false, message: '电话'}]}
                >
                  <Input placeholder="电话" style={{width: 200}}/>
                </Form.Item>
              </Col>
            </Row>
            <Alert
              style={{marginBottom: '10px'}}
              message="开票信息"
              type="info"
            />
            <Row gutter={[8, 8]} style={{marginLeft: '-128px'}}>
              <Col span={24}>
                <Form.Item
                  label="税号"
                  name="bill_id"
                  rules={[{required: false, message: '税号'}]}
                >
                  <Input placeholder="税号" style={{width: 500}} disabled={disabled}/>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{marginLeft: '-128px'}}>
              <Col span={24}>
                <Form.Item
                  label="开票地址"
                  name="bill_addr"
                  rules={[{required: false, message: '地址'}]}
                >
                  <Input placeholder="地址" style={{width: 500}} disabled={disabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]} style={{marginLeft: '-128px'}}>
              <Col span={24}>
                <Form.Item
                  label="开户行"
                  name="bill_bank"
                  rules={[{required: false, message: '开户行'}]}
                >
                  <Input placeholder="开户行" style={{width: 500}} disabled={disabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="bill_phone"
                  rules={[{required: false, message: '电话'}]}
                >
                  <Input placeholder="电话" style={{width: 200}} disabled={disabled}/>
                </Form.Item>
              </Col>
              <Col span={12}>

                <Form.Item
                  label="账号"
                  name="bill_account"
                  rules={[{required: false, message: '账号'}]}
                >
                  <Input placeholder="账号" style={{width: 200}} disabled={disabled}/>
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
                  rules={[{required: false, message: '地址'}]}
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
                  rules={[{required: false, message: '联系人'}]}
                >
                  <Input placeholder="联系人" style={{width: 200}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="电话"
                  name="contract_phone"
                  rules={[{required: false, message: '电话'}]}
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
        <>
          <div>
            <Alert
              message="项目基础信息(默认订单形式，修改公司名称将走合同形式)"
              type="info"
            />
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="项目ID"
                  name="project_id"
                  rules={[{required: true, message: '项目ID'}]}
                >
                  <Input placeholder="项目名称" disabled style={{width: '180px'}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="填报人"
                  name="real_name"
                  rules={[{required: true, message: '填报人'}]}
                >
                  <Input placeholder="项目名称" disabled style={{width: '180px'}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item
                  label="项目名称"
                  name="project_name"
                  rules={[{required: true, message: '项目名称'}]}
                >
                  <Input placeholder="项目名称" disabled style={{width: '180px'}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="公司名称"
                  name="company"
                  rules={[{required: true, message: '公司名称'}]}
                >
                  <Input placeholder="公司名称" style={{width: '180px'}}/>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
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
      maskClosable={false}
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
        initialValues={{...current}}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateOrder;

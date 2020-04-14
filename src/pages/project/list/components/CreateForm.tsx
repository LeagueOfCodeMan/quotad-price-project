import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Steps,
  Typography,
} from 'antd';

import {AddressInfo, AddressListItem} from '@/pages/usermanager/settings/data';
import moment from 'moment';
import {ProjectListItem} from '@/pages/project/data';
import {actPrice, isNormalResponseBody, ProductType, productType} from '@/utils/utils';
import _ from 'lodash';
import {queryStandardProduct} from '@/pages/dfdk/product/service';
import {ProductBaseListItem} from '@/pages/dfdk/product/data';
import {CurrentUser} from "@/models/user";
import styles from '../style.less';

const {Text} = Typography;

export interface FormValueType {
  genre?: number;
  production?: number;
  count?: number;
  conf_par?: { id: number; count: number; }[];
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  updateModalVisible: boolean;
  values: Partial<ProjectListItem>;
  addressList: AddressInfo;
  currentUser: CurrentUser;
}

const FormItem = Form.Item;
const {Step} = Steps;
const {TextArea} = Input;
const {Option} = Select;
const RadioGroup = Radio.Group;

export interface UpdateFormState {
  formVals: FormValueType;
  currentStep: number;
}

const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const CreateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  const [current, setCurrent] = useState<ProductBaseListItem>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalPrice, setPrice] = useState<string>("0.00");

  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,
    addressList, currentUser: {identity}
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
  }, [current])

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();

    setFormVals({...formVals, ...fieldsValue});

    if (currentStep < 2) {
      forward();
    } else {
      handleUpdate(formVals);
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
    const values = form.getFieldsValue();
    console.log(values, current);
    const {production, count, conf_par} = form.getFieldsValue();
    const price = parseFloat(actPrice(current, identity) || '0');
    const checkPar = conf_par?.filter((i: { count: number; }) => i?.count > 0);
    console.log(checkPar);
    const tPrice = _.reduce(checkPar, (sum, n) => {
      const item = _.head(_.filter(current?.conf_list, o => o?.id === n?.id));
      const priceItem = parseFloat(actPrice(item, identity) || '0') * n?.count;
      console.log(item, priceItem);
      return sum + priceItem;
    }, count * price) || 0;
    const fPrice: string = tPrice % 1 !== 0 ? tPrice.toString() : tPrice + '.00';
    console.log(fPrice);
    setPrice(fPrice);
  };

  const renderContent = () => {
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
            <Col span={23}>
              <span style={{color: '#FF6A00'}}>总价：¥{totalPrice}</span>
            </Col>
          </Row>
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <FormItem
            name="time"
            label="开始时间"
            rules={[{required: true, message: '请选择开始时间！'}]}
          >
            <DatePicker
              style={{width: '100%'}}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />
          </FormItem>
          <FormItem name="frequency" label="调度周期">
            <Select style={{width: '100%'}}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>
          </FormItem>
        </>
      );
    }
    return (
      <>
        <Alert
          message="购买须知"
          description="生成项目后，可在项目管理查看项目跟进状态"
          type="error"
          closable
        />
        <Form.Item
          name="project_name"
          rules={[{required: true, message: '项目名称'}]}
          style={{marginTop: '20px'}}
        >
          <Input placeholder="项目名称"/>
        </Form.Item>
        <Form.Item name="project_company" rules={[{required: true, message: '项目单位'}]}>
          <Input placeholder="项目单位"/>
        </Form.Item>
        <Form.Item name="project_addr" rules={[{required: true, message: '交货地址'}]}>
          <Select
            showSearch
            placeholder={!addressList?.results?.[0] ? '请前往个人设置填写地址' : '请选择地址'}
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
          >
            {addressList?.results?.map((d: AddressListItem, ii: number) => (
              <Option
                key={d.id + '-' + ii}
                value={d.id}
                label={d.recipients + '-' + d.tel + '-' + d.addr}
              >
                <div>
                  <span>{d.recipients}</span>
                  <Divider type="vertical"/>
                  <span>{d.tel}</span>
                  <Divider type="vertical"/>
                  <span>{d.addr}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="delivery_time" rules={[{required: true, message: '交货日期'}]}>
          <DatePicker
            disabledDate={current => {
              return current && current < moment().subtract(1, 'days');
            }}
            style={{width: '100%'}}
          />
        </Form.Item>
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
          <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
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
          <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
          <Button type="primary" onClick={() => handleNext()}>
            完成
          </Button>
        </>
      );
    }
    return (
      <>
        <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
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
      onCancel={() => handleUpdateModalVisible(false, values)}
      afterClose={() => handleUpdateModalVisible()}
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

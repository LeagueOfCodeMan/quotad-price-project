import React, {useState} from 'react';
import {Alert, Button, Divider, Form, Input, List, Modal, Space, Steps, Table, Typography} from 'antd';
import _ from 'lodash';
import {ProductBaseListItem} from '../../product/data';
import styles from '../style.less';
import {ColumnsType} from 'antd/lib/table';
import {CreateProjectParams} from '../service';
import {CurrentUser} from '@/models/user';
import {
  calculateAllProductList,
  calculateProductList,
  currentPriceNumber,
  handleProductListInProjectFormData,
  IdentityType
} from '@/utils/utils';
import AddProduct from '@/pages/project/components/AddProduct';
import Ellipsis from '@/components/Ellipsis';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import {DeleteTwoTone, EditTwoTone} from '@ant-design/icons/lib';
import {v4 as uuidv4} from 'uuid';


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
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};


const CreateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [dataSource, setDataSource] = useState<{ uuid: string; data: ProductBaseListItem[] }[]>([]);
  const [current, setCurrent] = useState<{ uuid: string; data: ProductBaseListItem[] }>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalPrice, setPrice] = useState<number>(0);
  const [addVisible, handleAddVisible] = useState<boolean>(false);

  const [form] = Form.useForm();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    currentUser
  } = props;
  const {identity} = currentUser;

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();

    setFormVals({...formVals, ...fieldsValue});

    if (currentStep < 1) {
      forward();
    } else {
      const {project_name, project_desc, user_name, user_addr, user_iphone, user_contact} = formVals;
      const product_list = handleProductListInProjectFormData(dataSource);
      const payload = {
        project_name, project_desc, product_list
        , user_name, user_addr, user_iphone, user_contact
      };
      handleUpdate(payload as CreateProjectParams);
    }
  };

  const remove = (record: { uuid: string; [propName: string]: any; }) => {
    const newData = [...dataSource];
    _.remove(newData, d => d?.uuid === record?.uuid);
    setDataSource(newData);
    setPrice(calculateAllProductList(newData, identity as IdentityType));
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <div style={{margin: '10px 0'}}>
            <Alert
              message="产品清单"
              type="info"
              closable
            />
          </div>
          <List
            size="large"
            rowKey={(record) => record?.uuid}
            pagination={false}
            dataSource={dataSource || []}
            loadMore={<div style={{textAlign: 'center', marginTop: '10px'}}>
              <Button type="primary" onClick={() => {
                handleAddVisible(true);
              }}>添加产品</Button>
            </div>}
            renderItem={(item: { uuid: string; data: ProductBaseListItem[] }, index: number) => {
              const account = calculateProductList(item?.data, identity as IdentityType);

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
                      <div>
                        <EditTwoTone
                          onClick={() => {
                            setCurrent(item);
                            handleAddVisible(true);
                          }}/>
                        <Divider type="vertical"/>
                        <DeleteTwoTone
                          twoToneColor="#eb2f96"
                          onClick={() => {
                            remove(item);
                          }}
                        />
                      </div>
                    </Space>
                    <Table
                      bordered
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
            <Input placeholder="项目名称" style={{width: 400}}/>
          </Form.Item>
          <Form.Item label="项目描述" name="project_desc" rules={[{required: true, message: '项目描述'}]}>
            <TextArea rows={2} placeholder="请输入至少五个字符" style={{width: 400}}/>
          </Form.Item>
        </div>
        <div style={{border: '1px dashed #dddddd'}}>
          <div style={{textAlign: 'center', color: '#1890FF', fontWeight: 'bold', margin: '10px 0'}}>用户信息</div>
          <Form.Item
            label="用户名称"
            name="user_name"
            rules={[{required: true, message: '用户'}]}
          >
            <Input placeholder="用户" style={{width: 400}}/>
          </Form.Item>
          <Form.Item
            label="地址"
            name="user_addr"
          >
            <Input placeholder="地址" style={{width: 400}}/>
          </Form.Item>
          <Form.Item
            label="电话"
            name="user_iphone"
          >
            <Input placeholder="电话" style={{width: 400}}/>
          </Form.Item>
          <Form.Item
            label="联系人"
            name="user_contact"
          >
            <Input placeholder="联系人" style={{width: 400}}/>
          </Form.Item>
        </div>
      </>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={backward}>
            上一步
          </Button>
          <div style={{display:'flex'}}>
            <div style={{margin:'5px 30px 0 30px', display: 'flex', }}>
              <Text style={{fontSize: '16px', color: 'grey'}}>总价：</Text>
              <Text style={{color: '#FF6A00', fontSize: '20px', marginTop: '-5px'}}>
                {!_.isNaN(totalPrice) ?
                  <StatisticWrapper value={totalPrice} style={{fontSize: '20px'}}/>
                  : '部分尚未定价'}
              </Text>
            </div>
            <Button onClick={() => {
              setFormVals({});
              handleUpdateModalVisible();
            }}>取消</Button>
            <Button type="primary" onClick={() => handleNext()} disabled={!_.head(dataSource)}>
              完成
            </Button>
          </div>
        </div>
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
      width={1000}
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
      maskClosable={false}
    >
      <AddProduct
        onSubmit={(value, uuid, callback) => {
          console.log(value);
          const index = _.findIndex(dataSource, o => o?.uuid === uuid);
          const dt = [value, ...value?.conf_par];
          const newDtSource = !!uuid ?
            _.fill([...dataSource], {uuid: uuidv4(), data: dt},
              index, index + 1) :
            [...dataSource, {uuid: uuidv4(), data: dt}];
          setDataSource(newDtSource);
          setPrice(calculateAllProductList(newDtSource, identity as IdentityType));

        }}
        onCancel={() => {
          handleAddVisible(false);
        }}
        updateModalVisible={addVisible}
        current={current}
        currentUser={currentUser}
      />
      <Steps style={{marginBottom: 28}} size="small" current={currentStep}>
        <Step title="填写项目信息"/>
        <Step title="添加产品"/>
      </Steps>
      <Form
        {...formLayout}
        form={form}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;

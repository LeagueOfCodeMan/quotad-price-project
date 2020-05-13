import React, {useEffect, useState} from 'react';
import {Alert, List, Button, Form, Input, Modal, Select, Steps, Table, Typography, Divider, Space} from 'antd';
import _ from 'lodash';
import {ProductBaseListItem} from '../../product/data';
import styles from '../style.less';
import {ColumnsType} from 'antd/lib/table';
import {CreateProjectParams} from '../service';
import {CurrentUser} from '@/models/user';
import {actPrice, calculateProductList, currentPrice, currentPriceNumber, IdentityType} from '@/utils/utils';
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
const {Option, OptGroup} = Select;
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};


const CreateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({});
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  const [dataSource, setDataSource] = useState<{ uuid: string; data: ProductBaseListItem[] }[]>([]);
  const [current, setCurrent] = useState<ProductBaseListItem[]>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalPrice, setPrice] = useState<number>(0);
  const [addVisible, handleAddVisible] = useState<boolean>(false);

  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
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

    if (currentStep < 2) {
      forward();
    } else {
      const {project_name, project_desc, user_name, user_addr, user_iphone, user_contact} = formVals;
      const product_list = _.map(dataSource, o => {
        return (
          {production: o?.id, count: o?.count, conf_par: o?.conf_par}
        );
      });
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
  };

  // const columns: ProColumns<ProductBaseListItem>[] =
  //   [
  //     {
  //       title: '产品名称',
  //       dataIndex: 'name',
  //       width: 100,
  //       ellipsis: true,
  //       render: (text) => {
  //         return (
  //           <div>
  //             <Text style={{color: '#181818'}}>{text}</Text>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       title: '型号',
  //       dataIndex: 'pro_type',
  //       width: 120,
  //       render: (text) => {
  //         return (
  //           <div>
  //             <Text style={{color: '#181818'}}>{text}</Text>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       title: '产品描述',
  //       dataIndex: 'desc',
  //       render: (text) => {
  //         return (
  //           <div style={{textAlign: 'left'}}>
  //             <Ellipsis tooltip lines={1}>
  //               <p style={{marginBottom: '0px'}}>
  //                 {(text as string)?.split("\n")?.map((o, i) => {
  //                   return (
  //                     <span key={i}>{o}<br/></span>
  //                   )
  //                 })}
  //               </p>
  //             </Ellipsis>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       title: '单价',
  //       dataIndex: 'price',
  //       width: 130,
  //       align:'right',
  //       render: (text:any,record) => {
  //         console.log(text,record);
  //         const price = currentPriceNumber(record,identity)
  //         return (
  //           <div>
  //             <Text style={{color: '#FF6A00'}}>
  //               {text ?
  //                 <StatisticWrapper value={price}/>
  //                 : '尚未定价'}
  //             </Text>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       title: '数量',
  //       dataIndex: 'count',
  //       key: 'count',
  //       width: 120,
  //     },
  //     {
  //       title: '金额',
  //       dataIndex: 'total_price',
  //       key: 'total_price',
  //       width: 130,
  //       render: (value:any, row, index) => {
  //         const obj: {
  //           props: { rowSpan?: number; [propName: string]: any; };
  //           [propName: string]: any;
  //         } = {
  //           children: <div>
  //             <Text style={{color: '#FF6A00'}}>
  //               {value ?
  //                 <StatisticWrapper value={value}/>
  //                 : '部分尚未定价'}
  //             </Text>
  //           </div>,
  //           props: {},
  //         };
  //         if (index === 0) {
  //           obj.props.rowSpan = row?.total;
  //         } else {
  //           obj.props.rowSpan = 0;
  //         }
  //         return obj;
  //       },
  //     },
  //   ];

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
              console.log(item);
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
                    <Space style={{display: 'flex'}}>
                      <span>产品{index + 1}</span>
                      <EditTwoTone
                        onClick={() => {
                          setCurrent(item);
                        }}/>
                      <Divider type="vertical"/>
                      <DeleteTwoTone
                        twoToneColor="#eb2f96"
                        onClick={() => {
                          remove(item);
                        }}
                      />
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
            <Input placeholder="项目名称" style={{width: 270}}/>
          </Form.Item>
          <Form.Item label="项目描述" name="project_desc" rules={[{required: true, message: '项目描述'}]}>
            <TextArea rows={2} placeholder="请输入至少五个字符" style={{width: 270}}/>
          </Form.Item>
        </div>
        <div style={{border: '1px dashed #dddddd'}}>
          <div style={{textAlign: 'center', color: '#1890FF', fontWeight: 'bold', margin: '10px 0'}}>用户信息</div>
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
        onSubmit={(value, callback) => {
          console.log(value);
          const dt = [value, ...value?.conf_par];
          setDataSource([...dataSource, {uuid: uuidv4(), data: dt}]);
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
        ref={(ref) => setFormRef(ref)}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;

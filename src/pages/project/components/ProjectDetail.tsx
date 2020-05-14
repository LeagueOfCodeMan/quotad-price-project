import React, {FC, useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  List,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography
} from 'antd';
import {CurrentUser} from '@/models/user';
import {
  currentPriceNumber,
  handleProductListInProjectFormData,
  handleProjectListItemData,
  projectType,
  ResultType,
  ValidatePwdResult
} from '@/utils/utils';
import styles from '../style.less';
import {ProductBaseListItem} from '@/pages/product/data';
import {ColumnsType} from 'antd/lib/table';
import {ProjectListItem} from '@/pages/project/data';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import Ellipsis from '@/components/Ellipsis';
import EditProject from '@/pages/project/components/EditProject';
import {createOrder, modifyProductList, modifyProject, terminateProject} from '@/pages/project/service';
import ValidatePassword from '@/components/ValidatePassword';
import {testPassword} from '@/services/user';
import {DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined} from '@ant-design/icons/lib';
import CreateOrder from '@/pages/project/components/CreateOrder';
import AddProduct from '@/pages/project/components/AddProduct';
import _ from 'lodash';
import {v4 as uuidv4} from 'uuid';

const {Text} = Typography;

interface BasicListProps {
  current: ProjectListItem;
  currentUser: CurrentUser;
  reload: () => void;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}

const Content = ({data, currentUser, reload}: {
  data: ProjectListItem; currentUser: CurrentUser; reload: () => void;
}) => {
  const {
    project_id, real_name, user_name, user_addr, user_iphone, user_contact,
    create_time, project_name, project_desc, sell_total_quota, pro_status,
    product_list, id, other_list, username,
  } = data;
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [orderVisible, setOrderVisible] = useState<boolean>(false);
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>('');
  const [addVisible, handleAddVisible] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<{ uuid: string; data: ProductBaseListItem[] }[]>([]);
  const [current, setCurrent] = useState<{ uuid: string; data: ProductBaseListItem[] }>();
  console.log(data);
  const total_price = parseFloat(sell_total_quota || '');
  useEffect(() => {
    const newDt = handleProjectListItemData(product_list);
    console.log(newDt);
    setDataSource(newDt);
  }, [product_list]);

  const {identity} = currentUser;

  const style = {display: 'flex', justifyContent: 'flex-end'};
  /**
   * 基础信息：状态、项目ID、填报人、项目名称、用户名称、项目描述
   * 项目产品信息(产品库中)
   * 项目其他附加购买产品信息
   */

  const editBase = (identity === 3 || identity === 4) && username === currentUser?.username ?
    <div style={style}>
      <Button
        type="primary"
        onClick={() => {
          setEditVisible(true);
        }}
      >
        编辑基础信息
      </Button>
    </div> : null;

  const remove = (identity === 3 || identity === 4) && username === currentUser?.username ?
    <div style={style}>
      <Button
        type="primary"
        danger
        onClick={() => {
          setValidateType(ValidateType.DELETE_CONFIG);
          setValidateVisible(true);
        }}
      >
        终止
      </Button>
    </div> : null;
  const place = identity === 2 ?
    <div style={style}>
      <Button
        type="primary"
        onClick={() => {
          setOrderVisible(true);
        }}
      >
        下单
      </Button>
    </div> : null;

  //  =========== 密码校验 ======================
  const onCreate = async (values: { password: string }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    if (validateType === ValidateType.DELETE_CONFIG) {
      const hide = () => {
        message.loading('正在终止');
      };
      Modal.confirm({
        title: '终止项目',
        icon: <ExclamationCircleOutlined/>,
        content: (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>
              项目名称：<span>{project_name}</span>
            </span>
            <span>
              项目状态：<span>{projectType(pro_status)}</span>
            </span>
            <span>
              项目描述：
              {project_desc?.split('\n')?.map((o, i) => {
                return (
                  <div key={id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
                );
              })}
            </span>
          </div>
        ),
        okText: '确认',
        // @ts-ignore
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await terminateProject({id});
          const success: boolean = new ValidatePwdResult(result).validate('终止成功', null, hide);
          // 刷新数据
          if (success) {
            reload();
          }
        },
        onCancel() {
        },
      });
    }
  };

  /**
   * todo 对产品清单的CURD
   * @param item
   */
  const editProductList = async (payload: { uuid: string; data: ProductBaseListItem[]; }[]) => {
    const pyload = handleProductListInProjectFormData(payload);
    const response =
      await modifyProductList({id, data: {product_list: pyload}});
    const success = new ValidatePwdResult(response).validate('操作成功', null, undefined);
    if (success) {
      reload();
    }
  };

  return (
    <div className={styles.listContentWrapper}>
      <EditProject
        onSubmit={async value => {
          const response = await modifyProject({id, data: value});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            setEditVisible(false);
            reload();
          }
        }}
        onCancel={() => {
          setEditVisible(false);
        }}
        updateModalVisible={editVisible}
        current={data}
      />
      <AddProduct
        onSubmit={(value, uuid, callback) => {
          console.log(value);
          const index = _.findIndex(dataSource, o => o?.uuid === uuid);
          const dt = [value, ...value?.conf_par];
          const newDtSource = !!uuid ?
            _.fill([...dataSource], {uuid: uuidv4(), data: dt},
              index, index + 1) :
            [...dataSource, {uuid: uuidv4(), data: dt}];
          editProductList(newDtSource);
        }}
        onCancel={() => {
          handleAddVisible(false);
        }}
        updateModalVisible={addVisible}
        current={current}
        currentUser={currentUser}
      />
      {orderVisible ? (
        <CreateOrder
          onSubmit={async value => {
            const response = await createOrder({id, data: value});
            const success = new ValidatePwdResult(response).validate('创建成功', null, undefined);
            if (success) {
              setOrderVisible(false);
            }
            reload();
          }}
          onCancel={() => {
            setOrderVisible(false);
          }}
          updateModalVisible={orderVisible}
          current={data}
          currentUser={currentUser}
        />
      ) : null}
      <ValidatePassword
        visible={validateVisible}
        onCreate={async values => {
          const success = await onCreate(values);
          if (success) {
            setValidateVisible(false);
            // TODO something
            validatePasswordSuccessToDo();
          }
        }}
        onCancel={() => {
          setValidateVisible(false);
        }}
      />
      <div style={{margin: '10px 0'}}>
        <Alert
          message="基本信息"
          type="success"
          closable
          style={{margin: '10px 0'}}
        />
        {pro_status === 1 ? editBase : null}
      </div>

      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="项目基础信息" span={1}>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目ID：</Text>
          <Text strong style={{color: '#FF6A00'}}>{project_id}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目名称：</Text>
          <Text strong style={{color: '#181818'}}>{project_name}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>填报人：</Text>
          <Text strong style={{color: '#181818'}}>{real_name}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目创建时间：</Text>
          <Text strong style={{color: '#1890FF'}}>{create_time}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="项目描述" span={2}>
          {project_desc?.split('\n')?.map((o, i) => {
            return (
              <div key={project_id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            );
          })}
        </Descriptions.Item>
        <Descriptions.Item label="用户信息" span={1}>
          <Descriptions.Item label={<span style={{color: '#FFFFFF'}}>用户详细信息：</span>} span={4}>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>用户名称：</Text>
            <Text strong style={{color: '#FF6A00'}}>{user_name}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>地址：</Text>
            <Text strong style={{color: '#181818'}}>{user_addr}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>电话：</Text>
            <Text strong style={{color: '#181818'}}>{user_iphone}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>联系人：</Text>
            <Text strong style={{color: '#1890FF'}}>{user_contact}</Text>
          </Descriptions.Item>
        </Descriptions.Item>
      </Descriptions>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="产品清单"
          type="info"
          closable
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
        rowKey={(record) => record?.uuid}
        pagination={false}
        dataSource={dataSource || []}
        loadMore={<div style={{textAlign: 'center', marginTop: '10px'}}>
          {pro_status === 1 ?
            <Button type="primary" onClick={() => {
              handleAddVisible(true);
            }}>添加产品</Button> : null
          }
        </div>}
        renderItem={(item: { uuid: string; data: ProductBaseListItem[] }, index: number) => {
          const account = _.head(_.filter(data, d => d?.production > 0))?.sell_quota;
          console.log(dataSource);
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
                  {
                    pro_status === 1 ?
                      <div>
                        <EditTwoTone
                          onClick={() => {
                            setCurrent(item);
                            handleAddVisible(true);
                          }}/>
                        <Divider type="vertical"/>
                        <Popconfirm
                          placement="topRight"
                          title="将此产品移除？"
                          onConfirm={() => {
                            const newData = [...dataSource];
                            _.remove(newData, d => d?.uuid === item?.uuid);
                            editProductList(newData);
                          }}
                          okText="确定"
                          cancelText="取消"
                        >
                          <DeleteTwoTone
                            twoToneColor="#eb2f96"
                          />
                        </Popconfirm>

                      </div> : null
                  }
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
      {pro_status === 1 ?
        <>
          <div style={{margin: '10px 0'}}>
            <Alert
              message="更多操作"
              type="info"
              closable
            />
          </div>
          <>
            {remove}
            {place}
          </>
        </> : null

      }

    </div>
  );
};

const ProjectDetail: FC<BasicListProps> = props => {
  const {
    current,
    currentUser,
    reload
  } = props;

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
        >
          <Content data={current} currentUser={currentUser} reload={reload}/>
        </Card>
      </div>

    </div>
  );
};

export default ProjectDetail;

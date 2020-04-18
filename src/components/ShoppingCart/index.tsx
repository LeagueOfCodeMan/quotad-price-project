import React, {FC, ReactText, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Result,
  Select,
  Table,
  Tooltip,
  Typography
} from 'antd';
import {ProductDetailListItem} from "@/pages/product/product-base/data";
import {ProductBaseListItem} from "@/pages/product/product-config/data";
import {CurrentUser, UserModelState} from "@/models/user";
import {LocalStorageShopType, ShoppingCartItem} from "@/models/data";
import {connect} from "react-redux";
import ProTable, {ActionType, ColumnsState, ProColumns} from "@ant-design/pro-table";
import {
  CheckOutlined,
  DeleteTwoTone,
  PlusSquareOutlined,
  ProjectOutlined,
  RollbackOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons/lib";
import styles from './index.less';
import {useLocalStorage, useToggle} from "react-use";
import _ from "lodash";
import {AddressInfo, AddressListItem} from "@/pages/usermanager/settings/data";
import {Dispatch} from "redux";
import moment, {Moment} from "moment";
import {createProject, queryMyProject, updateProject} from "@/services/user";
import {isNormalResponseBody, ValidatePwdResult} from "@/utils/utils";
import {Link} from "umi";

const {Paragraph, Text} = Typography;
const {Option} = Select;

interface ShoppingCartProps {
  visible: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  currentUser: CurrentUser;
  dispatch: Dispatch<any>;
  addressList: AddressInfo;
}

export type ProductListType = {
  production: number;
  count: number;
  conf_par: { id: number; count: number; }[]
}[];

interface FormType {
  project_name: string;
  project_company: string;
  project_addr: number;
  delivery_time: Moment;
}

export interface CreateProjectParams {
  project_name: string;
  project_company: string;
  project_addr: number;
  delivery_time: string;
  product_list: ProductListType;
}

export type ProjectNameType = { id: number; project_name: string; };

const ShoppingCart: FC<ShoppingCartProps> = props => {
  const {visible, onSubmit, addressList, onCancel, currentUser, dispatch} = props;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [columnsStateMap, setColumnsStateMap] = useState<{
    [key: string]: ColumnsState;
  }>({
    mark: {
      show: false,
    },
    desc: {
      show: false,
    },
  });
  const [searchValue, setSearchValue] = useState("");
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [cartList, setCartList] = useLocalStorage<LocalStorageShopType>('shopping-cart', []);
  const [rowsSelectKeys, setRowsSelectKeys] = useState<ReactText[]>([]);
  const [rowsSelect, setRowsSelect] = useState<ShoppingCartItem[]>([]);
  const [childrenDrawerVisible, setChildrenDrawerVisible] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  const [on, toggle] = useToggle(true);
  const [projectNames, setProjectNames] = useState<ProjectNameType[]>([]);
  const [current, setCurrent] = useState<ProjectNameType | {}>({});

  useEffect(() => {
    if (visible) {
      const {current} = actionRef;
      if (current) {
        current.reload();
      }
    }
  }, [visible, searchValue, cartList]);

  const findShopCartByCurrentUserFromLocalStorage = () => {
    return _.find(cartList, d => d.user === currentUser?.username)?.shop || [];
  };

  /**
   * 根据权限对输入item，进行价格string
   * @param item
   */
  const actPrice = (item: any): string => {
    const {identity} = currentUser;
    const val = item as ProductDetailListItem | ProductBaseListItem;
    let result = '0.00';
    switch (identity) {
      case 1:
      case 2:
        result = (val?.leader_price || '0.00').toString();
        break;
      case 3:
        result = (val?.member_price || '0.00').toString();
        break;
      case 4:
        result = (val?.second_price || '0.00').toString();
        break;
      default:
        result = '0.00';
        break;
    }
    return result;
  };

  const columns: ProColumns<ShoppingCartItem>[] = [
    {
      title: '产品名',
      dataIndex: 'pro_type',
      width: 100,
      ellipsis: true,
    },
    {
      title: '标注',
      dataIndex: 'mark',
      width: 100,
      ellipsis: true,
    },
    {
      title: '参数描述',
      dataIndex: 'desc',
      width: 100,
      render: (text) => {
        return (
          <div className={styles.configListStyle}>
            <Paragraph>
              <Tooltip placement="top" title={text}>
                <ul>
                  {(text as string || '')?.split(/[\s\n]/).map((d, index) => {
                    return (
                      <li key={index + '-' + d}>
                        <CheckOutlined style={{color: 'rgb(255, 20, 80)', marginRight: '5px'}}/>
                        <Text ellipsis style={{color: '#181818', width: '90px'}}>{d}</Text>
                      </li>
                    )
                  })}
                </ul>
              </Tooltip>
            </Paragraph>
          </div>
        )
      }
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 150,
      render: (text, record) => {
        return (
          <div className={styles.textCenter}>
            ¥ <Text type="danger"> {actPrice(record)}</Text> /件
          </div>
        )
      }
    },
    {
      title: '配件',
      dataIndex: 'conf_list',
      width: 200,
      render: (text, record) => {
        return (
          <div className={styles.configListStyle}>
            <Paragraph>
              <ul>
                {text?.[0] ? (text as ProductBaseListItem[])?.map((d, index) => {
                  return (
                    <li key={index + '-' + record?.uuid}>
                      <div>
                        <Text ellipsis style={{color: '#181818', width: '90px'}}>{d?.conf_name}</Text>
                      </div>
                      <ul>
                        <li>
                          <span>单价：</span>
                          <Text type="danger">¥ {actPrice(d)}</Text>
                        </li>
                        <li>
                          <span>数量：</span>
                          <Text style={{color: '#181818'}}>{d?.count}</Text>
                        </li>
                      </ul>
                    </li>
                  )
                }) : <div className={styles.textCenter}>标配版</div>}
              </ul>
            </Paragraph>
          </div>
        )
      }
    },
    {
      title: '购买数量',
      dataIndex: 'count',
      width: 80,
      render: (text) => {
        return (
          <div className={styles.textCenter}>
            <Text type="danger"> {text}</Text>
          </div>
        )
      }
    },
    {
      title: '产品总价',
      dataIndex: 'total_price',
      width: 100,
      render: (text) => {
        return (
          <div className={styles.textCenter}>
            ¥ <Text type="danger"> {text}</Text>
          </div>
        )
      }
    },
    {
      title: '操作',
      key: 'option',
      width: 60,
      valueType: 'option',
      render: (text, record) => [
        <DeleteTwoTone
          twoToneColor="#eb2f96"
          style={{fontSize: '16px'}}
          onClick={() => {
            record?.uuid && deleteColumn(record?.uuid);
          }}
        />
      ],
    },
  ];

  /**
   * 删除单个并更新localStorage和当前表格数据及选项，和重新统计金额
   */
  const deleteColumn = (uuid: string) => {
    const {username} = currentUser;
    const copyCartList = [...cartList];
    const target = _.remove(copyCartList, d => d.user === username) || [];
    const lost = _.filter(_.head(target)?.shop || [], d => d.uuid !== uuid);
    const result: LocalStorageShopType = [...copyCartList, {
      user: username as string,
      shop: lost
    }];
    const rowsCheck = rowsSelect?.filter(i => i.uuid !== uuid);
    const rowsCheckKeys = rowsSelectKeys?.filter(i => i !== uuid);
    setCartList(result);
    calculate(lost);
    setRowsSelectKeys(rowsCheckKeys);
    setRowsSelect(rowsCheck);
  };
  /**
   * 成功处理后删除多个
   */
  const deleteHadSelect = () => {
    const {username} = currentUser;
    const copyCartList = [...cartList];
    const target = _.remove(copyCartList, d => d.user === username) || [];
    const lost = _.filter(_.head(target)?.shop || [], d => _.indexOf(rowsSelectKeys, d?.uuid) < 0);
    const result: LocalStorageShopType = [...copyCartList, {
      user: username as string,
      shop: lost
    }];
    setCartList(result);
    setRowsSelectKeys([]);
    setRowsSelect([]);
    setTotalPrice("0.00");
  };
  /**
   * 表格搜索操作
   * @param value
   */
  const handleSearch = (value: string): void => {
    setSearchValue(value);
  };
  /**
   * 计算价格
   * @param selectedRowKeys
   * @param selectedRows
   */
  const calculate = (selectedRows: ShoppingCartItem[]) => {
    const tPrice = _.reduce(selectedRows, (sum, n) => {
      return sum + parseFloat(n?.total_price || '0');
    }, 0) || 0;
    const fPrice: string = tPrice % 1 !== 0 ? tPrice.toString() : tPrice + '.00';
    setTotalPrice(fPrice);
  };

  /**
   * 选项操作
   * @param selectedRowKeys
   * @param selectedRows
   */
  const rowSelectChange = (selectedRowKeys: ReactText[], selectedRows: ShoppingCartItem[]) => {
    calculate(selectedRows);
    setRowsSelectKeys(selectedRowKeys);
    setRowsSelect(selectedRows);
  };

  /**
   * 处理选中条目提交信息
   */

  const handleSelectToSubmit = () => {
    const productList = _.map(rowsSelect, (d) => {
      const conf_par = _.map(d?.conf_list, dd => ({id: dd?.id, count: dd?.count}));
      if (conf_par?.[0]) {
        return {
          production: d?.id,
          count: d?.count,
          conf_par
        }
      } else {
        return {
          production: d?.id,
          count: d?.count,
        }
      }
    });
    return productList;
  };

  /**
   * 提交表单请求创建项目
   */
  const onFinish = (fieldsValue: FormType) => {
    const productList = handleSelectToSubmit();

    const values = {
      ...fieldsValue, delivery_time: fieldsValue['delivery_time'].format('YYYY-MM-DD'),
      product_list: productList as ProductListType
    };

    const success = dispatchCreateProject(values);
    if (success) {
      deleteHadSelect();
      setDone(true);
      if (_.head(findShopCartByCurrentUserFromLocalStorage())) {
        onSubmit();
      }
    }
  };

  /**
   * 询问用户是否跳转至项目管理
   * 成功后清理当前已提交数据和重新设置localStorage
   */
  const dispatchCreateProject = async (params: CreateProjectParams) => {
    const response = await createProject(params);
    return new ValidatePwdResult(response).validate("创建成功", null, undefined);
  };
  /**
   * 点击添加至项目
   */
  const addToProject = async () => {
    dispatch({
      type: 'user/fetchAddress',
    });
    const result = await queryMyProject();
    if (isNormalResponseBody(result)) {
      setProjectNames(result?.results);
      setCurrent(result?.results?.[0] || {});
    }
    setChildrenDrawerVisible(true);
  };

  /**
   * 项目列表及操作
   */
  const columns2 = [
    {
      title: '项目名',
      dataIndex: 'project_name',
      width: 150,
      render: (text: string) => {
        return (<div>
          <ProjectOutlined style={{marginRight: '9px', fontSize: '16px', color: '#CCCCCC'}}/>
          <span style={{color: '#333'}}>{text}</span>
        </div>)
      }
    }
  ];

  /**
   * 表格行点击
   * @param record
   */
  const onRowClickManager = (record: ProjectNameType) => {
    setCurrent(record);
  };

  const setClassNameManager = (record: ProjectNameType) => {
    return record.id === _.result(current, 'id') ? 'l-table-row-active' : '';
  };

  const addProductListToProject = async () => {
    const productList = handleSelectToSubmit();
    const response = await updateProject({
      id: _.result(current, 'id'),
      type: 1,
      product_list: productList as ProductListType
    });
    const success = new ValidatePwdResult(response).validate(null, null, undefined);
    if (success) {
      deleteHadSelect();
      setDone(true);
    }
  }

  return (
    <Drawer
      title={<ShoppingCartOutlined style={{color: '#eb3323', fontSize: '40px'}}/>}
      width={1024}
      onClose={onCancel}
      visible={visible}
      getContainer={() => document.body}
      bodyStyle={{paddingBottom: 80}}
      className={styles.drawerContainer}
      footer={
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', fontSize: '12px'
          }}
        >
          <div style={{marginRight: '20px'}}>
            <span>总费用：</span>
            <span style={{color: '#FF8A00'}}> ¥</span>
            <span style={{fontSize: '24px', color: '#FF8A00', marginLeft: '5px'}}>{totalPrice}</span>
          </div>
          {
            _.head(rowsSelect) ?
              <Button
                style={{
                  backgroundColor: '#FF6A00',
                  color: '#fff',
                  borderColor: '#fff',
                  marginRight: '80px',
                  height: '36px'
                }}
                onClick={addToProject}

              >
                添加至项目
              </Button> :
              <Button
                style={{
                  marginRight: '80px',
                  height: '36px'
                }}
                disabled={true}
              >
                添加至项目
              </Button>

          }
        </div>
      }
      zIndex={1000}
    >
      <div>
        <Drawer
          title={on ?
            <div className={styles.titleStyle}>加入项目<PlusSquareOutlined
              onClick={() => toggle(false)}/>
            </div> :
            <div className={styles.titleStyle}>加入新项目<RollbackOutlined
              onClick={() => toggle(true)}
            />
            </div>
          }
          width={320}
          closable={false}
          onClose={() => setChildrenDrawerVisible(false)}
          visible={childrenDrawerVisible}
          className={styles.drawerContainerInner}
        >
          {!done ? on ?
            <div className={styles.projectNameStyle}>
              <Table
                rowKey={row => row?.id as number}
                loading={!_.head(projectNames)}
                columns={columns2}
                dataSource={projectNames || []}
                scroll={{y: 400}}
                showHeader={false}
                pagination={false}
                onRow={(record, index) => ({
                  onClick: (event) => {
                    onRowClickManager(record);
                  },
                })}
                rowClassName={setClassNameManager}
              />
              <div className={styles.buttonWrapper}>
                <Button type="primary"
                        disabled={!_.has(current, 'id')}
                        onClick={addProductListToProject}
                >确定</Button>
                <Button
                  type="danger"
                  onClick={() => {
                    toggle(true);
                    setChildrenDrawerVisible(false);
                  }}
                >取消</Button>
              </div>
            </div> :
            <Form
              form={form} className={styles.productCustomConfigForm} onFinish={(values) => {
              onFinish(values as FormType)
            }}>
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
              <Form.Item
                name="project_company"
                rules={[{required: true, message: '项目单位'}]}
              >
                <Input placeholder="项目单位"/>
              </Form.Item>
              <Form.Item
                name="project_addr"
                rules={[{required: true, message: '交货地址'}]}
              >
                <Select
                  showSearch
                  placeholder={!addressList?.results?.[0] ? '请前往个人设置填写地址' : '请选择地址'}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }}
                >
                  {addressList?.results?.map((d: AddressListItem, ii: number) => (
                    <Option key={d.id + '-' + ii} value={d.id}
                            label={d.recipients + '-' + d.tel + '-' + d.addr}>
                      <div>
                        <span>{d.recipients}</span>
                        <Divider type="vertical"/>
                        <span>{d.tel}</span>
                        <Divider type="vertical"/>
                        <span>{d.addr}</span>
                      </div>
                    </Option>))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                name="delivery_time"
                rules={[{required: true, message: '交货日期'}]}
              >
                <DatePicker
                  disabledDate={current => {
                    return current && current < moment().subtract(1, "days");
                  }}
                  style={{width: '100%'}}
                />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  xs: {span: 24, offset: 0},
                  sm: {span: 16, offset: 8},
                }}
              >
                <Button
                  htmlType="submit"
                  style={{
                    backgroundColor: '#FF6A00',
                    color: '#fff',
                    borderColor: '#fff',
                    marginRight: '80px',
                    height: '36px'
                  }}
                >
                  生成项目
                </Button>
              </Form.Item>
            </Form> :
            <Result
              status="success"
              title="操作成功"
              extra={[
                <Link to="/project/list" key="console">
                  <Button type="primary" onClick={()=>{
                    onSubmit();
                  }}>
                    查看已创建项目
                  </Button>
                </Link>,
                <Button key="buy" onClick={() => setChildrenDrawerVisible(false)}>继续购买</Button>,
              ]}
            />
          }
        </Drawer>
        <ProTable<ShoppingCartItem>
          columns={columns}
          actionRef={actionRef}
          options={{
            reload: false, fullScreen: true, setting: true, density: false
          }}
          size="small"
          request={() => {
            const dataSourceAtCurrent = findShopCartByCurrentUserFromLocalStorage();
            const dataSource = searchValue ? dataSourceAtCurrent?.filter(
              d => d.pro_type.toLowerCase().includes(searchValue.toLowerCase())) : dataSourceAtCurrent;
            return Promise.resolve({
              data: dataSource,
              success: true,
            })
          }}
          scroll={{y: 300}}
          rowSelection={{onChange: rowSelectChange, selectedRowKeys: rowsSelectKeys}}
          rowKey={record => record?.uuid as string}
          pagination={false}
          columnsStateMap={columnsStateMap}
          onColumnsStateChange={map => setColumnsStateMap(map)}
          search={false}
          dateFormatter="string"
          // headerTitle="简单搜索"
          toolBarRender={() => [<Input.Search key="search" onSearch={handleSearch}
                                              placeholder="请输入产品名"/>,
          ]}
          tableAlertRender={(selectedRowKeys, selectedRows) => (
            <div>
              已选择 <a style={{fontWeight: 600}}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
            </div>
          )}
          tableAlertOptionRender={props => {
            const {onCleanSelected} = props;
            return [
              <a
                key="clear"
                onClick={() => {
                  onCleanSelected();
                  setTotalPrice("0.00");
                }}
              >清空</a>,
            ];
          }}
        />
      </div>
    </ Drawer>
  );
};

export default connect(
  ({
     loading, user,
   }: {
    loading: {
      models: { [key: string]: boolean };
      effects: {
        [key: string]: boolean;
      };
    };
    user: UserModelState;
  }) => ({
    currentUser: user.currentUser,
    addressList: user.addressList,
  }),
)(ShoppingCart);


import React, {FC, useEffect, useRef, useState} from 'react';
import {Button, Drawer, Dropdown, Input, Menu, Tooltip, Typography} from 'antd';
import {ProductDetailListItem} from "@/pages/dfdk/product-purchased/data";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import {CurrentUser, UserModelState} from "@/models/user";
import {LocalStorageShopType, ShoppingCartItem} from "@/models/data";
import {connect} from "react-redux";
import ProTable, {ActionType, ColumnsState, ProColumns} from "@ant-design/pro-table";
import {CheckOutlined, DeleteTwoTone, DownOutlined} from "@ant-design/icons/lib";
import styles from './index.less';
import {useLocalStorage} from "react-use";

const {Paragraph, Text} = Typography;

interface ShoppingCartProps {
  visible: boolean;
  onSubmit: (fieldsValue: ShoppingCartItem) => void;
  onCancel: () => void;
  currentUser: CurrentUser;

}

const ShoppingCart: FC<ShoppingCartProps> = props => {
  const {visible, onSubmit: handleAdd, onCancel, currentUser} = props;
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


  useEffect(() => {
    if (visible) {
      const {current} = actionRef;
      if (current) {
        current.reload();
      }
    }
  }, [visible, searchValue]);

  /**
   * 根据权限对输入item，进行价格string
   * @param item
   */
  const actPrice = (item: any): string => {
    const {identity} = currentUser;
    const val = item as ProductDetailListItem | ProductConfigListItem;
    console.log(val);
    let result = '0.00';
    switch (identity) {
      case 1 || 2:
        result = (val?.leader_price || '0.00').toString();
        debugger
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
  }

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
      render: (text) => {
        return (
          <div className={styles.configListStyle}>
            <Paragraph>
              <ul>
                {text?.[0] ? (text as ProductConfigListItem[])?.map((d, index) => {
                  return (
                    <li key={index + '-' + d}>
                      <div>
                        <Text ellipsis style={{color: '#181818', width: '90px'}}>{d?.conf_name}</Text>
                      </div>
                      <ul>
                        <li>
                          <span>单价：</span>
                          <Text type="danger">¥ {actPrice(text)}</Text>
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
      render: () => [
        <DeleteTwoTone
          twoToneColor="#eb2f96"
          style={{fontSize: '16px'}}
          onClick={() => {
          }}
        />
      ],
    },
  ];

  const handleSearch = (value: string): void => {
    console.log(value)
    setSearchValue(value);
  };

  return (
    <Drawer
      title="购物车"
      width={1024}
      onClose={onCancel}
      visible={visible}
      getContainer={false}
      bodyStyle={{paddingBottom: 80}}
      className={styles.drawerContainer}
      destroyOnClose
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
          <Button style={{
            backgroundColor: '#FF6A00', color: '#fff', borderColor: '#fff',
            margin: ' 18px 80px -4px 0px', height: '36px'
          }}
          >
            创建项目
          </Button>
        </div>
      }
      zIndex={1000}
    >
      <div>
        <>
          <ProTable<ShoppingCartItem>
            columns={columns}
            actionRef={actionRef}
            options={{
              reload: true, fullScreen: true, setting: true, density: false
            }}
            size="small"
            request={() => {
              console.log(cartList);
              const cartListByCurrentUser = _.find(cartList, d => d.user === currentUser?.username)?.shop || [];
              const dataSource = searchValue ? cartListByCurrentUser?.filter(d => d.pro_type.toLowerCase().includes(searchValue.toLowerCase())) : cartListByCurrentUser;
              return Promise.resolve({
                data: dataSource,
                success: true,
              })
            }}
            scroll={{y: 300}}
            rowSelection={{}}
            rowKey={record => record?.uuid || record?.id}
            pagination={false}
            columnsStateMap={columnsStateMap}
            onColumnsStateChange={map => setColumnsStateMap(map)}
            search={false}
            dateFormatter="string"
            headerTitle="简单搜索"
            toolBarRender={(action, {selectedRows}) => [<Input.Search onSearch={handleSearch}
                                                                      placeholder="请输入产品名"/>,
              selectedRows && selectedRows.length > 0 && (
                <Dropdown
                  overlay={
                    <Menu
                      onClick={async e => {
                        if (e.key === 'remove') {
                          // await handleRemove(selectedRows);
                          action.reload();
                        }
                      }}
                      selectedKeys={[]}
                    >
                      <Menu.Item key="remove">批量删除</Menu.Item>
                      <Menu.Item key="approval">批量审批</Menu.Item>
                    </Menu>
                  }
                >
                  <Button>
                    批量操作 <DownOutlined/>
                  </Button>
                </Dropdown>
              ),]}
            tableAlertRender={(selectedRowKeys, selectedRows) => (
              <div>
                已选择 <a style={{fontWeight: 600}}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
              </div>
            )}
            tableAlertOptionRender={false}
          />
        </>
      </div>
    </Drawer>
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
  }),
)(ShoppingCart);


import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Dropdown,
  Input,
  List,
  Menu,
  message,
  Modal,
  Table,
  Typography,
} from 'antd';

import {findDOMNode} from 'react-dom';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import OperationModal, {OperationModalSubmitType} from './components/OperationModal';
import {ProductBaseStateType} from '../model';
import styles from '@/pages/dfdk/product/style.less';
import {CurrentUser, UserModelState} from "@/models/user";

import {productType, ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined, MinusSquareTwoTone, PlusSquareTwoTone} from "@ant-design/icons/lib";
import {PaginationConfig} from "antd/lib/pagination";
import _ from 'lodash';
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {deleteStandardProduct, updateConfigListByProductId} from "@/pages/dfdk/product/service";
import EditableTable from "@/pages/dfdk/product/product-base/components/EditableTable";
import {useToggle} from "react-use";

const {Search} = Input;
const {confirm} = Modal;
const {Text} = Typography;

interface BasicListProps {
  productBase: ProductBaseStateType;
  dispatch: Dispatch<any>;
  loading: boolean;
  currentUser: CurrentUser;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}


const ListContent = ({data, currentUser: {identity}, reload, on}: {
  data: ProductBaseListItem; currentUser: CurrentUser;
  reload: () => void; on: boolean;
}) => {
  const {
    desc, leader_price, second_price, member_price,
    genre, conf_list,
  } = data;
  let price;
  if (identity === (1 || 2)) {
    price = leader_price;
  } else if (identity === 3) {
    price = member_price;
  } else if (identity === 4) {
    price = second_price;
  }
  const dataSource = _.sortBy(conf_list, o => !o.is_required) || [];
  const dataFinal = _.concat({..._.omit(data, 'conf_list'), is_required: 0} as ProductBaseListItem, dataSource);

  const columns = [
    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
      width: 100,
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
      title: '采购价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (text: string, record: ProductBaseListItem) => {
        let price;
        if (identity === (1 || 2)) {
          price = record?.leader_price;
        } else if (identity === 3) {
          price = record?.member_price;
        } else {
          price = record?.second_price;
        }
        return (
          <div>
            <Text style={{color: '#1890FF'}}>单价：</Text>
            <Text style={{color: '#FF6A00'}}>{price ? '¥ ' + price : '尚未定价'}</Text>
          </div>
        );
      },
    },
    {
      title: '描述',
      key: 'desc',
      dataIndex: 'desc',
      render: (text: string) => (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          {text?.split("\n")?.map((o, i) => {
            return (
              <div><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </div>
      ),
    },
    {
      title: '配置类型',
      dataIndex: 'is_required',
      key: 'is_required',
      width: 50,
      render: (text: boolean) => {
        return (
          <div>
            {text ?
              <Text style={{color: '#181818'}}>附加</Text> :
              <Text type="danger">选配</Text>
            }
          </div>
        )
      },
    },
  ];

  return (
    <div className={styles.listContentWrapper}>
      {
        on ? null :
          <>
            <div style={{margin: '10px 0'}}>
              <Alert
                message="组员价格发布"
                type="error"
                closable
              />
            </div>
            <EditableTable
              dataSource={dataFinal || []}
              reload={() => reload()}
            />
          </>
      }
      <div style={{margin: '10px 0'}}>
        <Alert
          message="基本信息"
          type="success"
          closable
        />
      </div>
      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="类型" span={2}>
          <Text style={{color: '#181818'}}>{productType(genre)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="产品采购价" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>单价：</Text>
            <Text style={{color: '#FF6A00'}}>{price ? '¥ ' + price : '尚未定价'}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={4}>
          {desc?.split("\n")?.map((o, i) => {
            return (
              <div key={i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </Descriptions.Item>
      </Descriptions>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="服务或配件"
          type="info"
          closable
        />
      </div>

      <Table
        showHeader={false}
        bordered size="small"
        rowKey={record => record?.id}
        columns={columns}
        pagination={false}
        scroll={{y: 300}}
        dataSource={dataSource || []}
      />
    </div>
  )
};

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  mem_state?: 1 | 2;
  conf_name?: string;

  [propName: string]: any;
}

const ProductBaseList: FC<BasicListProps> = props => {
  const addBtn = useRef(null);
  const {
    loading,
    dispatch,
    productBase: {products},
    currentUser,
  } = props;
  const [done, setDone] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [on, toggle] = useToggle(true);
  const [current, setCurrent] = useState<NotRequired<ProductBaseListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>("");
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 1
  });

  const {results = [], count = 0} = products;

  useEffect(() => {
    reloadList();
  }, [listParams])

  const reloadList = () => {
    dispatch({
      type: 'productBase/fetchStandardProduct',
      payload: {
        ...listParams
      },
    });
  };

  const paginationProps = {
    showQuickJumper: true,
    pageSize: 1,
    total: count,
    size: 'small',
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    }
  };

  // TODO 只要组长才需要发布
  const extraContent = (
    <div className={styles.extraContent}>
      <Search
        className={styles.extraContentSearch} placeholder="请输入搜索内容"
        onSearch={(value) => setListParams({...listParams, search: value})}/>
    </div>
  );

  // =========== 对操作弹出处理后 ==============
  const setAddBtnblur = () => {
    if (addBtn.current) {
      // eslint-disable-next-line react/no-find-dom-node
      const addBtnDom = findDOMNode(addBtn.current) as HTMLButtonElement;
      setTimeout(() => addBtnDom.blur(), 0);
    }
  };

  const handleDone = () => {
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  useEffect(() => {
    setAddBtnblur();
    if (visible) {
    } else {
      setTimeout(() => {
        setCurrent({});
      }, 1000)
    }
  }, [visible])
  // --------------------------------------------

  // ========= 添加和编辑产品请求 ============
  const handleSubmit = async (values: OperationModalSubmitType, callback: Function) => {
    const id = current ? current.id : '';
    let promise;
    promise = await updateConfigListByProductId({
      id: id ? id : values?.id,
      data: {conf_list: values?.conf_list}
    });
    // 成功则回调
    if (promise?.id) {
      setAddBtnblur();
      setDone(true);
      callback(promise);
      reloadList();
    } else {
      new ValidatePwdResult(promise).validate('成功处理', null, undefined);
    }
  };

  //  =========== 密码校验 ======================
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id, pro_type, desc, mark} = current as ProductBaseListItem;
    if (validateType === ValidateType.DELETE_CONFIG) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除标准库',
        icon: <ExclamationCircleOutlined/>,
        content: (<div style={{display: 'flex', flexDirection: 'column'}}>
          <span>产品名：<span>{pro_type}</span></span>
          <span>备注：<span>{mark}</span></span>
          <span>描述：<span>{desc}</span></span>
        </div>),
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteStandardProduct({id});
          const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
          // 刷新数据
          if (success) {
            setListParams({...listParams, current: 1})
            setCurrent({});
          }
        },
        onCancel() {
          setCurrent({});
        },
      });
    }
  }

  /* ================= 列表操作 ================
    管理员的添加编辑和删除
    组长的发布价格：包括一级组员和二级组员
   */
  const actions = (item: ProductBaseListItem): any[] => {
    switch (currentUser?.identity) {
      case 1:
        return [
          <a
            onClick={e => {
              e.preventDefault();
              showConfigModal(item);
            }}
          >
            编辑
          </a>,
          <MoreBtn key="more" item={item}/>,
        ];
      case 2:
        return [
          <a onClick={e => {
            e.preventDefault();
            toggle();
          }}>
            {on ?
              <>
                <PlusSquareTwoTone className={styles.elementAnimation}/>
                <span style={{marginLeft: '5px'}}>查看组员价格</span>
              </> :
              <>
                <MinusSquareTwoTone className={styles.elementAnimation2}/>
                <span style={{marginLeft: '5px'}}>查看组员价格</span>
              </>
            }
          </a>
        ];

    }
    return [];
  };


  const showModal = () => {
    setCurrent({});
    setVisible(true);
  };

  const showConfigModal = (item: ProductBaseListItem) => {
    setCurrent(item);
    setVisible(true);
  };

  const MoreBtn: React.FC<{
    item: ProductBaseListItem;
  }> = ({item}) => (
    <Dropdown
      overlay={
        <Menu onClick={({key}) => editAndDelete(key, item)}>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined/>
      </a>
    </Dropdown>
  );

  const editAndDelete = (key: string, currentItem: ProductBaseListItem) => {
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
      setValidateVisible(true);
    }
    setCurrent(currentItem);
  };
  // ==========================================

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
          extra={extraContent}
        >
          {currentUser?.identity === 1 ?
            <Button
              type="dashed"
              style={{width: '100%', marginBottom: 8}}
              onClick={showModal}
              ref={addBtn}
            >
              <PlusOutlined/>
              添加
            </Button> : null
          }

          <List
            size="large"
            rowKey={record => record?.id + '-' + record?.avatar}
            loading={loading}
            pagination={paginationProps as PaginationConfig}
            dataSource={results}
            renderItem={item => (
              <List.Item
                actions={actions(item)}
              >
                <div style={{flexDirection: 'column'}}>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={item.avatar} shape="square" size="large"/>

                    }
                    title={<div>{item.pro_type}</div>}
                    description={item.mark}
                  />
                  <ListContent
                    data={item} currentUser={currentUser}
                    reload={() => reloadList()}
                    on={on}
                  />
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
          const success = await onCreate(values)
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
      <OperationModal
        done={done}
        current={current}
        visible={visible}
        onDone={handleDone}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default connect(
  ({
     productBase,
     loading, user,
   }: {
    productBase: ProductBaseStateType;
    loading: {
      models: { [key: string]: boolean };
    };
    user: UserModelState;
  }) => ({
    productBase,
    currentUser: user.currentUser,
    users: user.users,
    loading: loading.models.productBase,
  }),
)(ProductBaseList);

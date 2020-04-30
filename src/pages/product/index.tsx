import React, {FC, useEffect, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Col, Descriptions, Input, List, message, Modal, Row, Typography,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import OperationModal from './components/OperationModal';
import styles from './style.less';
import {
  addProduct,
  deleteProduct,
  modifyProductSecondPrice,
  queryProductList,
  queryUsersByProduct,
  updateProduct
} from "./service";
import ValidatePassword from "../../components/ValidatePassword/index";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
import {PaginationConfig} from "antd/lib/pagination";
import {ProductBaseListItem} from "src/pages/product/data";
import {ProductBaseStateType} from "src/pages/product/model";
import _ from "lodash";
import {CurrentUser, UserModelState} from "@/models/user";
import {isNormalResponseBody, productType, ResultType, ValidatePwdResult} from "@/utils/utils";
import {testPassword} from "@/services/user";
import PublishModal, {PublishType} from "@/pages/product/components/PublishModal";

const {Search} = Input;
const {confirm} = Modal;
const {Text} = Typography;

export type UsersByProductType = {
  id: number;
  product_id: number;
  username: string;
  second_price: string | null;
  leader_price: string | null;
}

interface BasicListProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  currentUser: CurrentUser;
  productBase: ProductBaseStateType;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}


const Info: FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  bordered?: boolean;
  reloadList: (value: number) => void;
  active: number;
  id: number;
}> = ({title, value, bordered, reloadList, active, id}) => {
  return (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p style={{color: active === id ? "#f7ba42" : "#1890FF",cursor:'pointer'}} onClick={() => reloadList(id)}>{value}</p>
      {bordered && <em/>}
    </div>
  );
}

const ListContent = ({
                       data: {
                         desc, leader_price, second_price, member_price,
                         genre, id
                       },
                     }: {
  data: ProductBaseListItem; currentUser: CurrentUser;
}) => {
  return (
    <div className={styles.listContentWrapper}>
      <Descriptions column={4}>
        <Descriptions.Item label="类型" span={2}>
          <Text style={{color: '#181818'}}>{productType(genre)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="产品采购总价" span={2}>
          <>
            <Text style={{color: '#1890FF'}}>组长：</Text>
            <Text style={{color: '#FF6A00'}}>¥ {leader_price}</Text>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={4}>
          {desc?.split("\n")?.map((o, i) => {
            return (
              <div key={id + '-x-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            )
          })}
        </Descriptions.Item>

      </Descriptions>
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

export const Product: FC<BasicListProps> = props => {
  const {
    loading,
    dispatch,
    productBase: {productList, countStatistics},
    currentUser
  } = props;
  const [done, setDone] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProductBaseListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>("");
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 5
  });
  const [list, setList] = useState<UsersByProductType[]>([]);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [active, changeActive] = useState<number>(0);

  const {results = [], count = 0} = productList;
  const {identity} = currentUser;

  useEffect(() => {
    reloadList();
  }, [listParams])

  const reloadList = () => {
    dispatch({
      type: 'productBase/fetch',
      payload: {
        ...listParams
      },
    });
    dispatch({
      type: 'productBase/countStatistics',
    });
  };

  const paginationProps = {
    showQuickJumper: true,
    pageSize: 5,
    total: count,
    current: listParams?.current,
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    }
  };

  const showModal = () => {
    setVisible(true);
    setCurrent({});
  };

  const showEditModal = async (item: ProductBaseListItem) => {
    const response = await queryProductList({id: item?.id});
    if (Array.isArray(response)) {
      setCurrent({...item, conf_list: response});
    }
    setVisible(true);
  };

  // TODO 只要组长才需要发布
  const extraContent = (
    <div className={styles.extraContent}>
      <Search
        className={styles.extraContentSearch} placeholder="请输入搜索内容"
        onSearch={(value) => setListParams({...listParams, search: value})}/>
    </div>
  );

  const handleDone = () => {
    setDone(false);
    setVisible(false);
    setCurrent({});
  };

  const handleCancel = () => {
    setVisible(false);
    setCurrent({});
  };

  const handleSubmit = async (values: ProductBaseListItem, callback: Function) => {
    const id = current ? current.id : '';

    let promise;
    if (id) {
      promise = await updateProduct({id, data: values})
    } else {
      promise = await addProduct(values);
    }
    // 成功则回调
    if (promise?.id) {
      setDone(true);
      callback(promise);
      reloadList();
    } else {
      new ValidatePwdResult(promise).validate('成功处理', null, undefined);
    }
  };

  // 密码校验
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
        title: '删除产品',
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
          const result: ResultType | string = await deleteProduct({id});
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
  };

  const handleSecondPrice = async (record: ProductBaseListItem) => {
    const {id, leader_price} = record;
    const response = await queryUsersByProduct({id});
    if (isNormalResponseBody(response)) {
      setList(_.map(response?.results, o => ({...o, leader_price})) || []);
    }
    setCurrent(record);
    handleUpdateModalVisible(true);
  };

  const actions = (item: ProductBaseListItem): any[] => {
    switch (identity) {
      case 1:
        return [
          <a
            key="edit"
            onClick={e => {
              e.preventDefault();
              showEditModal(item);
            }}
          >
            编辑
          </a>,
          <a
            key="delete"
            style={{color: 'red'}}
            onClick={e => {
              e.preventDefault();
              setValidateType(ValidateType.DELETE_CONFIG);
              setCurrent(item);
              setValidateVisible(true);
            }}
          >
            删除
          </a>,
        ];
      case 2:
        return [
          <a
            key="define"
            onClick={e => {
              e.preventDefault();
              handleSecondPrice(item);
            }}
          >
            编辑组员价格
          </a>
        ];

    }
    return [];
  };

  const product = [
    {label: '全部', key: 0},
    {label: '一体机', key: 1},
    {label: '云桶', key: 2},
    {label: '公有云部署', key: 3},
    {label: '私有云部署', key: 4},
    {label: '传统环境部署', key: 5},
    {label: '一体机配件', key: 6},
    {label: '服务', key: 7},
    {label: '其他', key: 8},
  ];

  return (
    <div>
      <div className={styles.standardList}>
        <Card bordered={false}>
          <Row>
            {product.map(d => {
              return (
                <Col flex={80} key={d.key}>
                  <Info
                    id={d.key}
                    active={active}
                    reloadList={(index: number) => {
                      changeActive(index);
                      if (index === 0) {
                        setListParams({..._.omit(listParams, 'genre__icontains'),})
                      } else {
                        setListParams({...listParams, genre__icontains: index})
                      }
                    }}
                    title={d.label}
                    value={countStatistics?.[d.key] || 0} bordered/>
                </Col>
              )
            })}
          </Row>
        </Card>

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
            >
              <PlusOutlined/>
              添加
            </Button> : null
          }

          <List
            size="large"
            rowKey={record => record.id.toString()}
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
                  <ListContent data={item} currentUser={currentUser}/>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await modifyProductSecondPrice({id: current?.id as number, data: value as PublishType});
          const success = new ValidatePwdResult(response).validate('修改成功', null, undefined);
          if (success) {
            callback();
            handleUpdateModalVisible(false);
            setCurrent({});
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrent({});
        }}
        updateModalVisible={updateModalVisible}
        list={list}
      />
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
    loading: loading.models.productBase,
  }),
)(Product);

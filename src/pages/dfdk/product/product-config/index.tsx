import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Input,
  List,
  Menu,
  message,
  Modal,
  Row,
  Typography,
} from 'antd';

import {findDOMNode} from 'react-dom';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import OperationModal from './components/OperationModal';
import styles from '@/pages/dfdk/product/style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import {addProduct, deleteProduct, updateProduct} from "@/pages/dfdk/product/service";
import {ProductType, productType, ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
import {PaginationConfig} from "antd/lib/pagination";
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {ProductBaseStateType} from "@/pages/dfdk/product/model";

const {Search} = Input;
const {confirm} = Modal;
const {Text} = Typography;

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
}> = ({title, value, bordered}) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em/>}
  </div>
);

const ListContent = ({
                       data: {
                         desc, leader_price, second_price, member_price,
                         genre
                       }, currentUser: {identity}
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
              <div><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
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

export const ProductConfigList: FC<BasicListProps> = props => {
  const addBtn = useRef(null);
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

  const {results = [], count = 0} = productList;

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
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    }
  };

  const showModal = () => {
    setVisible(true);
    setCurrent({});
  };

  const showEditModal = (item: ProductBaseListItem) => {
    console.log(item, '编辑');
    setCurrent(item);
    setVisible(true);
  };

  const editAndDelete = (key: string, currentItem: ProductBaseListItem) => {
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
    }
    setCurrent(currentItem);
    setValidateVisible(true);
  };

  // TODO 只要组长才需要发布
  const extraContent = (
    <div className={styles.extraContent}>
      <Search
        className={styles.extraContentSearch} placeholder="请输入搜索内容"
        onSearch={(value) => setListParams({...listParams, search: value})}/>
    </div>
  );

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

  const setAddBtnblur = () => {
    if (addBtn.current) {
      // eslint-disable-next-line react/no-find-dom-node
      const addBtnDom = findDOMNode(addBtn.current) as HTMLButtonElement;
      setTimeout(() => addBtnDom.blur(), 0);
    }
  };

  const handleDone = () => {
    setAddBtnblur();
    setDone(false);
    setVisible(false);
    setCurrent({});
  };

  const handleCancel = () => {
    setAddBtnblur();
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
      setAddBtnblur();
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
          console.log('Cancel');
          setCurrent({});
        },
      });
    }
  }

  const actions = (item: ProductBaseListItem): any[] => {
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
      <MoreBtn key="more" item={item}/>,
    ];
  }
  console.log(countStatistics);
  return (
    <div>
      <div className={styles.standardList}>
        <Card bordered={false}>

          <Row>
            {(productType(0) as ProductType[]).map(d => {
              return (
                <Col flex={80} key={d.key}>
                  <Info title={d.label} value={countStatistics?.[d.key] || 0} bordered/>
                </Col>
              )
            })}

          </Row>

        </Card>

        <Card
          className={styles.listCard}
          bordered={false}
          title="产品库"
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
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
          const success = await onCreate(values)
          console.log(success);
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
)(ProductConfigList);

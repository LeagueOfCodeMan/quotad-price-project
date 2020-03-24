import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Col, Dropdown, Input, List, Menu, message, Modal, Radio, Row,} from 'antd';

import {findDOMNode} from 'react-dom';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import OperationModal from './components/OperationModal';
import {ProductBaseStateType} from './model';
import styles from './style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import Tag from "antd/lib/tag";

import {ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
import {PaginationConfig} from "antd/lib/pagination";
import PublishModal from "@/pages/dfdk/product/product-config/components/PublishModal";
import _ from 'lodash';
import {ProductBaseListItem} from "@/pages/dfdk/product/product-base/data";
import {
  addProduct,
  deleteProduct,
  ModifyProductMemberPrice, queryConfigListByProductId, updateConfigListByProductId,
  updateProduct
} from "@/pages/dfdk/product/product-base/service";
import ProductCustomConfig from "@/pages/dfdk/product/product-base/components/ProductCustomConfig";
import {LabelList} from "@/pages/dfdk/label/data";
import {ProductConfigList} from "@/pages/dfdk/product/product-config/data";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Search} = Input;
const {confirm} = Modal;

interface BasicListProps {
  productBase: ProductBaseStateType;
  dispatch: Dispatch<any>;
  loading: boolean;
  currentUser: CurrentUser;
  labelList: LabelList;
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
                         mem_state, label_name
                       }, currentUser: {identity}
                     }: {
  data: ProductBaseListItem; currentUser: CurrentUser;
}) =>
  (
    <div className={styles.listContent}>
      <div className={styles.listContentItem} style={{textAlign: 'center'}}>
        <span>系列</span>
        <p><Tag color="blue">{label_name || '未定义标签'}</Tag></p>
      </div>
      <div className={styles.listContentItem}>
        <span>参数描述</span>
        <p>{desc}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>是否发布</span>
        <p>{mem_state === 1 ? <Tag color="red">未发布</Tag> : <Tag color="geekblue">已发布</Tag>}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>组长价格</span>
        <p>{leader_price}</p>
      </div>
      /*
        一级组员价格
       */
      {identity === (2 || 3) ?
        <div className={styles.listContentItem}>
          <span>{identity === 2 ? '一级组员价格' : '价格'}</span>
          <p>{member_price || <Tag color="red">未定义</Tag>}</p>
        </div> : null
      }
      /*
        二级组员价格
       */
      {identity === (1 || 4) ?
        <div className={styles.listContentItem}>
          <span>{identity === 1 ? '二级组员价格' : '价格'}</span>
          <p>{second_price}</p>
        </div> : null}
    </div>
  );

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  mem_state?: 1 | 2;
  conf_name?: string;

  [propName: string]: any;
}

export const ProductBaseList: FC<BasicListProps> = props => {
  const addBtn = useRef(null);
  const {
    loading,
    dispatch,
    productBase: {productList, countStatistics},
    currentUser, labelList
  } = props;
  const [done, setDone] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [configVisible, setConfigVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProductBaseListItem>>({});
  const [confList, setConfList] = useState<NotRequired<ProductConfigList>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>("");
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 5
  });

  const {results = [], count = 0} = productList;
  // TODO 分类label
  const productLabel = _.head(labelList.results) && labelList.results.filter(i => i.label_type === 1);
  const configLabel = _.head(labelList.results) && labelList.results.filter(i => i.label_type === 2);

  useEffect(() => {
    dispatch({
      type: 'user/fetchLabels',
      payload: {pageSize: 99999}
    })
  }, [1])

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
    setCurrent({});
    setVisible(true);
  };

  const showConfigModal = async (item: ProductBaseListItem) => {
    setCurrent(item);
    setConfigVisible(true);
    const result = await queryConfigListByProductId({id: item?.id});
    if (Array.isArray(result?.results)) {
      setConfList(result);
    }
  };

  const editAndDelete = (key: string, currentItem: ProductBaseListItem) => {
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
      setValidateVisible(true);
    } else if (key === 'edit') {
      setVisible(true);
    }
    setCurrent(currentItem);
  };

  //        TODO 只要组长才需要发布
  const extraContent = (
    <div className={styles.extraContent}>
      {currentUser?.identity === 2 ?
        <RadioGroup defaultValue="all" onChange={e => {
          if (e.target.value !== 'all') {
            setListParams({...listParams, mem_state: e.target.value - 0 as (1 | 2)});
          } else {
            setListParams({..._.omit(listParams, ['mem_state'])});
          }

        }}>
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="2">已发布</RadioButton>
          <RadioButton value="1">未发布</RadioButton>
        </RadioGroup>
        : null}
      <Search
        className={styles.extraContentSearch} placeholder="请输入产品名称"
        onSearch={(value) => setListParams({...listParams, pro_type: value})}/>
    </div>
  );

  const MoreBtn: React.FC<{
    item: ProductBaseListItem;
  }> = ({item}) => (
    <Dropdown
      overlay={
        <Menu onClick={({key}) => editAndDelete(key, item)}>
          <Menu.Item key="edit">编辑</Menu.Item>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined/>
      </a>
    </Dropdown>
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
    setAddBtnblur();
    setCurrent({});
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setAddBtnblur();
    setCurrent({});
    setVisible(false);
  };
  // --------------------------------------------

  // ========= 添加和编辑产品请求 ============
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

  // ======= 给产品增删自定义配置 ================

  const handleSubmitCustomConfig = async (values: number[], callback: Function) => {
    const id = current ? current.id : '';

    let promise;
    if (id) {
      promise = await updateConfigListByProductId({id, data: {conf_list: values}})
    }
    const success = new ValidatePwdResult(promise).validate('成功处理', null, undefined);

    // 成功则回调
    if (success) {
      setConfList({});
      setCurrent({});
      callback(success);
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

  // ================= 列表操作 ================
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
            配置
          </a>,
          <MoreBtn key="more" item={item}/>,
        ];
      case 2:
        return [
          <a
            onClick={e => {
              e.preventDefault();
              setCurrent(item);
              handleUpdateModalVisible(true);
            }}
          >
            {item?.mem_state === 1 ? '发布' : '编辑'}
          </a>
        ];

    }
    return [];
  }

  return (
    <div>
      <div className={styles.standardList}>
        <Card bordered={false}>
          <Row>
            <Col sm={8} xs={24}>
              <Info title="产品总数" value={countStatistics?.total_count} bordered/>
            </Col>
            <Col sm={8} xs={24}>
              <Info title="未发布数" value={<span style={{color: 'gold'}}>{countStatistics?.unpublished}</span>} bordered/>
            </Col>
            <Col sm={8} xs={24}>
              <Info title="已发布数" value={<span style={{color: 'blue'}}>{countStatistics?.published_count}</span>}/>
            </Col>
          </Row>
        </Card>

        <Card
          className={styles.listCard}
          bordered={false}
          title="产品列表"
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
                <List.Item.Meta
                  avatar={
                    <Avatar src={item.avatar} shape="square" size="large"/>

                  }
                  title={<div>{item.pro_type}</div>}
                  description={item.mark}
                />
                <ListContent data={item} currentUser={currentUser}/>
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
        labelArr={productLabel || []}
      />
      <ProductCustomConfig
        confList={confList}
        labelArr={configLabel || []}
        visible={configVisible}
        onCancel={() => {
          setConfList({});
          setCurrent({});
          console.log(111)
          setConfigVisible(false);
        }}
        onSubmit={handleSubmitCustomConfig}
      />
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await ModifyProductMemberPrice({id: current?.id as number, data: value});
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
        current={current}
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
    labelList: user.labelList,
    loading: loading.models.productBase,
  }),
)(ProductBaseList);

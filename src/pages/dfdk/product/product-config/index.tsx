import React, {FC, useEffect, useRef, useState} from 'react';
import {DownOutlined, PlusOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Col, Dropdown, Input, List, Menu, message, Modal, Radio, Row,} from 'antd';

import {findDOMNode} from 'react-dom';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import OperationModal from './components/OperationModal';
import {ProductConfigStateType} from './model';
import styles from './style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import Tag from "antd/lib/tag";
import {
  addConfInfo,
  deleteConfInfo,
  ModifyMemberPrice,
  updateConfInfo
} from "@/pages/dfdk/product/product-config/service";
import {ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
import {PaginationConfig} from "antd/lib/pagination";
import PublishModal from "@/pages/dfdk/product/product-config/components/PublishModal";
import _ from 'lodash';
import {LabelList} from "@/pages/dfdk/label/data";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Search} = Input;
const {confirm} = Modal;

interface BasicListProps {
  productConfig: ProductConfigStateType;
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
                         con_desc, leader_price, second_price, member_price,
                         mem_state, label_name
                       }, currentUser: {identity}
                     }: {
  data: ProductConfigListItem; currentUser: CurrentUser;
}) =>
  (
    <div className={styles.listContent}>
      <div className={styles.listContentItem} style={{textAlign: 'center'}}>
        <span>产品系列</span>
        <p><Tag color="blue">{label_name || '未定义标签'}</Tag></p>
      </div>
      <div className={styles.listContentItem}>
        <span>参数描述</span>
        <p>{con_desc}</p>
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

export const ProductConfigList: FC<BasicListProps> = props => {
  const addBtn = useRef(null);
  const {
    loading,
    dispatch,
    productConfig: {configList, countStatistics},
    currentUser,labelList
  } = props;
  const [done, setDone] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<NotRequired<ProductConfigListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>("");
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 5
  });

  const {results = [], count = 0} = configList;
  // TODO 分类label
  const configLabel = _.head(labelList.results) && labelList.results.filter(i=>i.label_type === 2);

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
      type: 'productConfig/fetch',
      payload: {
        ...listParams
      },
    });
    dispatch({
      type: 'productConfig/countStatistics',
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

  const showEditModal = (item: ProductConfigListItem) => {
    console.log(item,'编辑');
    setCurrent(item);
    setVisible(true);
  };

  const editAndDelete = (key: string, currentItem: ProductConfigListItem) => {
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
    }
    setCurrent(currentItem);
    setValidateVisible(true);
  };

  // TODO 只要组长才需要发布
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
        className={styles.extraContentSearch} placeholder="请输入配件名称"
        onSearch={(value) => setListParams({...listParams, conf_name: value})}/>
    </div>
  );

  const MoreBtn: React.FC<{
    item: ProductConfigListItem;
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
    setCurrent({});
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setAddBtnblur();
    setCurrent({});
    setVisible(false);
  };

  const handleSubmit = async (values: ProductConfigListItem, callback: Function) => {
    const id = current ? current.id : '';

    let promise;
    if (id) {
      promise = await updateConfInfo({id, data: values})
    } else {
      promise = await addConfInfo(values);
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
    const {id, conf_mark, con_desc, conf_name} = current as ProductConfigListItem;
    if (validateType === ValidateType.DELETE_CONFIG) {
      const hide = () => {
        message.loading('正在删除')
      };
      confirm({
        title: '删除配件',
        icon: <ExclamationCircleOutlined/>,
        content: (<div style={{display: 'flex', flexDirection: 'column'}}>
          <span>配件名：<span>{conf_name}</span></span>
          <span>备注：<span>{conf_mark}</span></span>
          <span>描述：<span>{con_desc}</span></span>
        </div>),
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const result: ResultType | string = await deleteConfInfo({id});
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

  const actions = (item: ProductConfigListItem): any[] => {
    switch (currentUser?.identity) {
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
              <Info title="配件总数" value={countStatistics?.total_count} bordered/>
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
          title="配件列表"
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
                  avatar={<Avatar src={item.avatar} shape="square" size="large"/>}
                  title={<div>{item.conf_name}</div>}
                  description={item.conf_mark}
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
        labelArr={configLabel || []}
      />
      <PublishModal
        onSubmit={async (value, callback) => {
          const response = await ModifyMemberPrice({id: current?.id as number, data: value});
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
     productConfig,
     loading, user,
   }: {
    productConfig: ProductConfigStateType;
    loading: {
      models: { [key: string]: boolean };
    };
    user: UserModelState;
  }) => ({
    productConfig,
    currentUser: user.currentUser,
    labelList: user.labelList,
    loading: loading.models.productConfig,
  }),
)(ProductConfigList);

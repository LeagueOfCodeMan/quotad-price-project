import React, {FC, useEffect, useState} from 'react';
import {DownOutlined} from '@ant-design/icons';
import {
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Input,
  List,
  Menu,
  message,
  Modal,
  Radio,
  Skeleton,
  TreeSelect,
  Typography,
} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from '../model';
import styles from './style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import Tag from "antd/lib/tag";
import router from 'umi/router';

import {ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
import _ from 'lodash';
import {deleteProduct} from "@/pages/dfdk/product/product-base/service";
import {ProjectListItem} from "@/pages/project/data";
import {PaginationConfig} from "antd/lib/pagination";
import {useEffectOnce} from "react-use";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Search} = Input;
const {confirm} = Modal;
const {Text} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
}

enum ValidateType {
  DELETE_CONFIG = 'DELETE_CONFIG',
}


const ListContent = ({
                       data: {
                         project_name, project_company,
                         create_time, delivery_time, pro_status, username,
                         leader_total_quota, second_total_quota, member_total_quota,
                         leader_total_price, second_total_price, member_total_price,
                         project_addr: {recipients, addr, tel}
                       }, currentUser: {identity}
                     }: { data: ProjectListItem; currentUser: CurrentUser; }) => (
  <div className={styles.listContentWrapper}>
    <Descriptions column={4} title={project_name} layout="vertical">
      <Descriptions.Item label="公司名称">
        <Text style={{color: '#181818'}}>{project_company}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="所属用户">
        <Text style={{color: '#181818'}}>{username}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        <Text style={{color: '#181818'}}>{create_time}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        {
          <p>{pro_status === 1 ?
            <Tag color="red">未下单</Tag> :
            pro_status === 2 ?
              <Tag color="geekblue">已下单</Tag> :
              <Tag>已完成</Tag>
          }
          </p>
        }
      </Descriptions.Item>
      <Descriptions.Item label="项目采购总价" span={2}>
        {identity === 2 ? <><Text style={{color: '#1890FF'}}>组长：</Text><Text
          style={{color: '#FF6A00'}}>¥ {leader_total_quota}</Text><Divider
          type="vertical"/></> : null}
        {identity === (2 || 3) && !member_total_quota ?
          <><Text style={{color: '#61C37A'}}>{identity === 2 ? '组员：' : ''}</Text><Text
            style={{color: '#FF6A00'}}>¥ {member_total_quota}</Text></> : null}
        {identity === 4 ? <><Text style={{color: '#FF6A00'}}> ¥ {second_total_quota}</Text></> : null}
      </Descriptions.Item>
      <Descriptions.Item label="交货时间" span={2}>
        <Text style={{color: '#181818'}}>{delivery_time}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="发货信息" span={4}>
        收件人： <Text style={{color: '#181818'}}>{recipients}</Text>
        <Divider type="vertical"/>
        手机号码：<Text style={{color: '#181818'}}>{tel}</Text>
        <br/>
        收货地址：<Text style={{color: '#181818'}}>{addr}</Text>
      </Descriptions.Item>
    </Descriptions>
  </div>
);

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  pro_status?: 1 | 2 | 3;
  search?: string;
  username?: string;

  [propName: string]: any;
}

const ProjectList: FC<BasicListProps> = props => {
  const {
    fetch,
    dispatch,
    project: {projectList, userlist},
    currentUser, queryProjectOneDetail,
  } = props;
  const [current, setCurrent] = useState<NotRequired<ProjectListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);
  const [validateType, setValidateType] = useState<string>("");
  const [listParams, setListParams] = useState<ListSearchParams>({
    current: 1, pageSize: 3
  });

  const {results = [], count = 0} = projectList;

  useEffectOnce(() => {
    dispatch({
      type: 'project/fetchUsers',
      payload: {
        pageSize: 99999
      },
    });
  });

  useEffect(() => {
    reloadList();
    console.log(111)
  }, [listParams]);

  const reloadList = () => {
    dispatch({
      type: 'project/fetch',
      payload: {
        ...listParams
      },
    });
  };

  const paginationProps = {
    showQuickJumper: true,
    pageSize: 3,
    total: count,
    onChange: (page: number, pageSize: number) => {
      setListParams({...listParams, current: page, pageSize});
    }
  };


  const editAndDelete = (key: string, currentItem: ProjectListItem) => {
    if (key === 'delete') {
      setValidateType(ValidateType.DELETE_CONFIG);
      setValidateVisible(true);
    } else if (key === 'edit') {
    }
    setCurrent(currentItem);
  };

  const treeData = () => {
    const children = userlist?.results?.map((d: { username: string }) => {
      return {
        title: <b style={{color: '#08c'}}>{d?.username}</b>,
        value: d?.username
      }
    });
    return [{title: '一级组员', value: 'all', children}];
  };
  //        TODO 只要组长才需要发布
  const extraContent = (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      {
        currentUser?.identity === 2 ?
          <TreeSelect
            showSearch
            style={{width: 150, marginRight: '25px'}}
            value={listParams?.username}
            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
            placeholder="请选择用户"
            allowClear
            treeData={treeData()}
            treeDefaultExpandAll
            onChange={(value) => {
              if (value !== 'all') {
                setListParams({...listParams, username: value});
              } else {
                setListParams({..._.omit(listParams, ['username'])});
              }
            }}
          /> : null
      }
      <div className={styles.extraContent}>
        <RadioGroup defaultValue="all" onChange={e => {
          if (e.target.value !== 'all') {
            setListParams({...listParams, pro_status: e.target.value - 0 as (1 | 2 | 3)});
          } else {
            setListParams({..._.omit(listParams, ['pro_status'])});
          }

        }}>
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="1">未下单</RadioButton>
          <RadioButton value="2">已下单</RadioButton>
          <RadioButton value="3">已完成</RadioButton>
        </RadioGroup>
        <Search
          className={styles.extraContentSearch} placeholder="请输入搜索内容"
          onSearch={(value) => setListParams({...listParams, search: value})}/>
      </div>
    </div>
  );

  //  =========== 密码校验 ======================
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id, pro_type, desc, mark} = current as ProjectListItem;
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
  const MoreBtn: React.FC<{
    item: ProjectListItem;
  }> = ({item}) => (
    <Dropdown
      overlay={
        <Menu onClick={({key}) => editAndDelete(key, item)}>
          <Menu.Item key="edit">编辑</Menu.Item>
          <Menu.Item key="delete">撤销</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined/>
      </a>
    </Dropdown>
  );

  const actions = (item: ProjectListItem): any[] => {
    const {id} = item;
    const template = [
      <a
        key="detail"
        onClick={e => {
          e.preventDefault();
          dispatch({
            type: 'user/queryProjectOneDetail',
            payload: {project: item, id},
            callback: (res: any) => {
              if (Array.isArray(res)) {
                router.push('/project/detail')
              }
            }
          })
        }}
      >
        商品详情
      </a>
    ];
    switch (currentUser?.identity) {
      case 2:
        return template.concat([
          <a
            key="order"
            onClick={e => {
              e.preventDefault();
            }}
          >
            下单
          </a>,
          <MoreBtn key="more" item={item}/>,
        ]);
      case 3:
        return template.concat([
          <a
            key="order"
            onClick={e => {
              e.preventDefault();
            }}
          >
            提交最终修改
          </a>,
          <MoreBtn key="more" item={item}/>,
        ]);
    }
    return template;
  };

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
          extra={extraContent}
          loading={queryProjectOneDetail}
        >
          <List
            itemLayout="vertical"
            size="large"
            rowKey={record => record.id.toString()}
            loading={fetch}
            pagination={paginationProps as PaginationConfig}
            dataSource={results}
            renderItem={item => (
              <List.Item
                key={item?.id}
                actions={actions(item)}
              >
                <Skeleton avatar title={false} loading={fetch} active>
                  <ListContent data={item} currentUser={currentUser}/>
                </Skeleton>
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
    </div>
  );
};

export default connect(
  ({
     project,
     loading, user,
   }: {
    project: ProjectStateType;
    loading: {
      models: { [key: string]: boolean };
      effects: {
        [key: string]: boolean;
      };
    };
    user: UserModelState;
  }) => ({
    project,
    currentUser: user.currentUser,
    fetch: loading.effects['project/fetch'],
    queryProjectOneDetail: loading.effects['user/queryProjectOneDetail'],
  }),
)(ProjectList);

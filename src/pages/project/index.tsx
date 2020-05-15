import React, {FC, useEffect, useRef, useState} from 'react';
import {Button, Descriptions, Tag, Tooltip, TreeSelect, Typography,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {ProjectStateType} from './model';
import styles from './style.less';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons/lib';
import _ from 'lodash';
import ProTable, {ActionType, ProColumns} from '@ant-design/pro-table';
import {ColumnsState, RequestData} from '@ant-design/pro-table/es';
import {CurrentChildren, CurrentChildrenResults} from '@/models/data';
import {ProjectListItem} from '@/pages/project/data';
import {createProject, queryProject} from '@/pages/project/service';
import CreateForm from '@/pages/project/components/CreateForm';
import {CurrentUser, UserModelState} from '@/models/user';
import {addKeyToEachArray, ValidatePwdResult} from '@/utils/utils';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import {PaneDetail, TabsList} from '@/pages/order/components/TabsList';
import ProjectDetail from '@/pages/project/components/ProjectDetail';

const {Text} = Typography;

interface BasicListProps {
  project: ProjectStateType;
  dispatch: Dispatch<any>;
  fetch: boolean;
  queryProjectOneDetail: boolean;
  currentUser: CurrentUser;
  users: NotRequired<CurrentChildren>;
}


type TreeDataItem = { title: JSX.Element; value: string; children?: TreeDataItem }[];

export const handleUsersProjectToTreeData = (array: CurrentChildrenResults) => {
  const template = _.map(array, v => {
    const child = _.map(v?.users, v2 => {
      // 组长项目
      const children2: TreeDataItem = [];
      v2?.project_list?.forEach((d: { project_name: React.ReactNode; id: any }) => {
        children2.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.project_name}</b>
            </span>
          ),
          value: 'project_name' + '-' + d?.project_name + '-' + d?.id,
        });
      });
      // 一级组员
      const children3: TreeDataItem = [];
      v2?.one_level?.forEach(d => {
        const project: TreeDataItem = [];
        d?.project_list?.forEach(d2 => {
          project.push({
            title: (
              <span>
                <b style={{color: '#FF6A00'}}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children3.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.real_name}</b>
            </span>
          ),
          value: 'real_name' + '-' + d?.real_name,
          children: project,
        });
      });
      // 二级组员
      const children4: TreeDataItem = [];
      v2?.two_level?.forEach(d => {
        const project: TreeDataItem = [];
        d?.project_list?.forEach(d2 => {
          project.push({
            title: (
              <span>
                <b style={{color: '#FF6A00'}}>{d2?.project_name}</b>
              </span>
            ),
            value: 'project_name' + '-' + d2?.project_name + '-' + d2?.id,
          });
        });
        children4.push({
          title: (
            <span>
              <b style={{color: '#FF6A00'}}>{d?.real_name}</b>
            </span>
          ),
          value: 'real_name' + '-' + d?.real_name,
          children: project,
        });
      });
      const children = [];
      if (children2?.length > 0) {
        children.push({
          title: <span>组长项目</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key,
          children: children2,
          disabled: true,
        });
      }
      if (children3?.length > 0) {
        children.push({
          title: <span>一级组员</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key + 1,
          children: children3,
          disabled: true,
        });
      }
      if (children4?.length > 0) {
        children.push({
          title: <span>二级组员</span>,
          value: 'real_name' + '-' + v2?.real_name + '-' + v2?.key + 2,
          children: children4,
          disabled: true,
        });
      }

      return {
        title: (
          <span>
            组长：<b style={{color: '#08c'}}>{v2?.real_name}</b>
          </span>
        ),
        value: 'real_name' + '-' + v2?.real_name,
        children,
      };
    });
    return {
      title: <b style={{color: '#FF6A00'}}>{v?.area}</b>,
      value: v?.area,
      disabled: true,
      children: child,
    };
  });
  return template;
};

interface ListSearchParams {
  current?: number;
  pageSize?: number;
  pro_status?: 1 | 2 | 3;
  search?: string;
  real_name?: string;
  project_name?: string;

  [propName: string]: any;
}

const ProjectList: FC<BasicListProps> = props => {
  const {
    dispatch,
    users,
    currentUser,
  } = props;
  const {identity} = currentUser;
  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState }>({});
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [listParams, setListParams] = useState<ListSearchParams>({});
  const [details, setDetails] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    dispatch({
      type: 'user/fetchCurrent',
      callback: (res: CurrentUser) => {
        if (res?.identity === 1 || res?.identity === 2) {
          dispatch({
            type: 'user/queryCurrentUsers',
          });
        }
      }
    });

  }, [currentUser?.id]);

  const showModal = () => {
    setVisible(true);
  };

  const treeData = () => {
    const initArr: CurrentChildrenResults = addKeyToEachArray(users?.results as any[]);
    return handleUsersProjectToTreeData(initArr);
  };


  // ================= 列表操作 ================

  const action = () => {
    const buttons = [];
    const treeButton = (
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <TreeSelect
          showSearch
          style={{width: 150, marginRight: '25px'}}
          dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
          placeholder="请选择用户或项目"
          allowClear
          treeData={treeData()}
          dropdownMatchSelectWidth={500}
          treeDefaultExpandAll
          onChange={(value: string) => {
            const splitSearch = value?.split('-');
            const searchKey = splitSearch?.[0];
            const searchValue = splitSearch?.[1];
            setListParams({
              ..._.omit(listParams, ['project_name', 'real_name']),
              [searchKey]: searchValue,
            });
          }}
        />
      </div>
    );
    if (currentUser?.identity === 1 || currentUser?.identity === 2) {
      buttons.push(treeButton);
    }
    const add = (
      <Button icon={<PlusOutlined/>} type="primary" onClick={showModal}>
        新建
      </Button>
    );
    if (currentUser?.identity === 3 || currentUser?.identity === 4) {
      buttons.push(add);
    }
    return buttons;
  };

  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<ProjectListItem>> => {
    const result = await queryProject({...params});
    // 刷新当前current
    result?.results && refreshData(result?.results);
    return Promise.resolve({
      data: result?.results || [],
      success: true,
      total: result?.count || 0,
    });
  };

  const refreshData = (data: ProjectListItem[]) => {
    const newArr: ProjectListItem[] = [];
    details?.forEach(item => {
      const item2 = _.find(data, d => d?.id === item?.id);
      if (item2?.id) {
        newArr.push(item2 as ProjectListItem);
      }
    });
    setDetails(newArr);
  };

  const columns: ProColumns<ProjectListItem>[] = [
    {
      title: '状态',
      dataIndex: 'pro_status',
      width: 100,
      valueEnum: {
        1: {text: '进行中', status: 'Processing'},
        2: {text: '已终止', status: 'Error'},
        3: {text: '审核中', status: 'Warning'},
        4: {text: '交付中', status: 'Processing'},
        5: {text: '已完成', status: 'Success'},
      },
    },
    {
      title: '项目ID',
      dataIndex: 'project_id',
      width: 120,
    },
    {
      title: '填报人',
      dataIndex: 'real_name',
      width: 100,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
      width: 160,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '用户名称(公司名称)',
      dataIndex: 'user_name',
      hideInSearch: true,
      width: 160,
      render: (text, record) => {
        const {user_name, user_addr, user_iphone, user_contact} = record;
        return (
          <div style={{wordBreak: 'keep-all'}}>
            <Tooltip
              placement="top"
              title={
                <div className={styles.listContentWrapper}>
                  <Descriptions column={4} layout="vertical">
                    <Descriptions.Item label={<span style={{color: '#FFFFFF'}}>用户详细信息：</span>} span={4}>
                      <span style={{color: '#FFFFFF'}}>用户名称： </span><Text style={{color: '#FFFFFF'}}>{user_name}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>地址：</span><Text style={{color: '#FFFFFF'}}>{user_addr}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>电话：</span><Text style={{color: '#FFFFFF'}}>{user_iphone}</Text>
                      <br/>
                      <span style={{color: '#FFFFFF'}}>联系人：</span><Text style={{color: '#FFFFFF'}}>{user_contact}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              }>
              <span>{text}...</span>
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: '项目描述',
      dataIndex: 'project_desc',
      ellipsis: true,
      hideInSearch: true,
    },
    // {
    //   title: '销售产品',
    //   dataIndex: 'production',
    //   hideInSearch: true,
    //   width: 100,
    //   render: (text, record) => {
    //     const {product_list, identity} = record;
    //     return (
    //       <div>
    //         <Button style={{padding: '0px'}} type="link" onClick={() => {
    //           Modal.success({
    //             maskClosable: true,
    //             title: (<div style={{display: 'flex', justifyContent: 'space-between'}}><span>产品清单</span><span
    //               style={{marginLeft: '10px'}}>合计：
    //                         <Text style={{color: '#FF6A00'}}>
    //           {record?.sell_total_price ?
    //             <StatisticWrapper value={record?.sell_total_price}/>
    //             : '部分尚未定价'}
    //         </Text>
    //             </span></div>),
    //             width: product_list?.length === 1 ? 500 : 1000,
    //             icon: null,
    //             content: (
    //               <List
    //                 size="small"
    //                 rowKey={record => record.id?.toString()}
    //                 pagination={false}
    //                 dataSource={product_list || []}
    //                 className={styles.productListDetail}
    //                 renderItem={(item: ProjectProductionInfoItem, index) => (
    //                   <List.Item
    //                   >
    //                     <div>
    //                       <ListContentWrapper item={item} identity={identity as IdentityType} index={index}/>
    //                     </div>
    //                   </List.Item>
    //                 )}
    //               >
    //               </List>
    //             ),
    //           });
    //         }}>查看详情</Button>
    //       </div>
    //     );
    //   },
    // },
    {
      title: '销售总价',
      dataIndex: 'price',
      hideInSearch: true,
      width: 130,
      align: 'right',
      render: (text, record) => {
        const {
          sell_total_quota
        } = record;
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>
              {sell_total_quota ?
                <StatisticWrapper value={sell_total_quota}/>
                : '部分尚未定价'}
            </Text>
          </div>
        );
      },
    },
    {
      title: '项目创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      align: 'center',
      render: (_, record) => {
        const template: JSX.Element[] = [
          <Button type="link" onClick={() => showMoreDetail(record)}>
            详情
          </Button>
        ];
        return template;
      },
    },
  ];

  /**
   * tab操作
   */
  const showMoreDetail = (record: ProjectListItem) => {
    const newDetails = [...details];
    _.remove(newDetails, d => d?.id?.toString() === record?.id?.toString());
    setDetails([...newDetails, record]);
  };

  const removeItem = (target: string) => {
    const newDetails = [...details];
    _.remove(newDetails, d => d?.id?.toString() === target);
    setDetails(newDetails);
  };

  const panesGenerate = () => {
    const panes: PaneDetail[] = [
      {
        title: '项目列表',
        content: (
          <ProTable<ProjectListItem>
            options={{reload: true, fullScreen: true, setting: true, density: false}}
            size="small"
            actionRef={actionRef}
            rowKey={record => record.id}
            toolBarRender={() => {
              return action();
            }}
            request={request}
            search={{
              collapsed: true,
              resetText: undefined,
            }}
            params={{...listParams}}
            columns={columns}
            columnsStateMap={columnsStateMap}
            onColumnsStateChange={map => setColumnsStateMap(map)}
            pagination={{pageSize: 10, showQuickJumper: true}}
          />
        ),
        key: 'project',
        closable: false,
      },
    ];

    details?.forEach(d => {
      let state: JSX.Element;
      switch (d?.pro_status) {
        case 1:
          state = <Tag icon={<SyncOutlined spin/>} color="processing">
            进行中
          </Tag>;
          break;
        case 2:
          state = <Tag icon={<CloseCircleOutlined/>} color="error">
            终止
          </Tag>;
          break;
        case 3:
          state = <Tag icon={<ExclamationCircleOutlined/>} color="warning">
            审核中</Tag>;
          break;
        case 4:
          state = <Tag icon={<SyncOutlined spin/>} color="processing">
            交付中
          </Tag>;
          break;
        default:
          state = <Tag icon={<CheckCircleOutlined/>} color="success">
            已完成
          </Tag>;
          break;
      }

      panes.push({
        title: <span>{state}
          <span>{d?.real_name + '-' + d?.project_id}</span></span>,
        content: <ProjectDetail current={d} currentUser={currentUser} reload={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}/>,
        key: d?.id?.toString(),
        closable: true,
      });
    });

    return panes;
  };

  return (
    <div>
      <div className={styles.standardList}>
        <TabsList
          panes={panesGenerate()}
          removeItem={removeItem}
        />
      </div>
      {visible ? (
        <CreateForm
          onSubmit={async value => {
            const response = await createProject(value);
            const success = new ValidatePwdResult(response).validate('创建成功', null, undefined);
            if (success) {
              setVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            setVisible(false);
          }}
          updateModalVisible={visible}
          currentUser={currentUser}
        />
      ) : null}

    </div>
  );
};

export default connect(
  ({
     project,
     loading,
     user,
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
    users: user.users,
    fetch: loading.effects['project/fetch'],
    queryProjectOneDetail: loading.effects['user/queryProjectOneDetail'],
  }),
)(ProjectList);

import {Button, Card, Table, Tabs, Typography} from 'antd';
import * as React from "react";
import {Component, FC, useRef, useState} from "react";
import {ProjectDetailListItem, ProjectListItem, ProjectProductionInfoItem} from "@/pages/project/data";
import _ from "lodash";
import ProTable, {ActionType, ProColumns} from "@ant-design/pro-table";
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {addIcontains, productType, ValidatePwdResult} from "@/utils/utils";
import {ColumnsState, RequestData} from "@ant-design/pro-table/es";
import {modifyProductList, queryProjectOneDetail} from "@/pages/project/service";
import {ColumnsType} from "antd/lib/table";
import {PlusOutlined} from "@ant-design/icons/lib";
import CreateForm from "@/pages/project/detail/components/CreateForm";
import {CurrentUser} from "@/models/user";
import styles from '../style.less';

const {TabPane} = Tabs;
const {Text} = Typography;

function displayIdentityPrice(item: ProductBaseListItem, identity: number) {
  const {leader_price, member_price, second_price} = item;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      {identity === 1 || identity === 2 ? (
        <div>
          <Text style={{color: '#1890FF', marginLeft: '2em'}}>组长：</Text>
          <Text style={{color: '#FF6A00'}}>¥ {leader_price}</Text>
        </div>
      ) : null}
      {(identity === 2 || identity === 3) ? (
        <div>
          <Text style={{color: '#61C37A'}}>{identity === 2 ? '一级组员：' : ''}</Text>
          <Text
            style={{color: '#FF6A00'}}>{member_price ? '¥ ' + (member_price) : '尚未定价'}</Text>
        </div>
      ) : null}
      {(identity === 2 || identity === 4) ? (
        <div>
          <Text style={{color: '#61C37A'}}>{identity === 2 ? '二级组员：' : ''}</Text>
          <Text
            style={{color: '#FF6A00'}}>{second_price ? '¥ ' + (second_price) : '尚未定价'}</Text>
        </div>
      ) : null}
    </div>
  )
}

interface CustomTabsProps {
  projectDetailList: ProjectDetailListItem[];
  currentUser: CurrentUser;

  [propName: string]: any;
}

type PaneItem = {
  title: JSX.Element | string;
  content: JSX.Element | string;
  key: string;
}

interface CustomTabsState {
  activeKey: string;
  panes: PaneItem[];
}

const TabItemContent: FC<ProjectListItem> = props => {
  const actionRef = useRef<ActionType>();
  const {currentUser, id,} = props;
  const {identity} = currentUser;
  const [visible, setVisible] = useState<boolean>(false);

  const [columnsStateMap, setColumnsStateMap] = useState<{ [key: string]: ColumnsState; }>({});
  const columns: ProColumns<ProjectProductionInfoItem>[] = [
    {
      title: '类型',
      dataIndex: 'production',
      key: 'production',
      align: 'center',
      width: 70,
      valueEnum: productType(-2),
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{productType((text as ProductBaseListItem)?.genre)}</Text>
          </div>
        )
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      align: 'center',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{(record?.production as ProductBaseListItem)?.pro_type}</Text>
          </div>
        )
      },
    },
    {
      title: '采购价格',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (text, record) => {
        return (
          <div>
            {displayIdentityPrice(record?.production, identity)}
          </div>
        )
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 70,
      hideInSearch: true,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      width: 60,
      hideInSearch: true,
      render: () => {
        return (
          <div style={{textAlign: 'center'}}>
            <a
              onClick={e => {
                e.preventDefault();
              }}
              style={{color: '#FF4D4F'}}
            >
              删除
            </a>
          </div>
        )
      },
    },
  ];

  const columns2: ColumnsType<ProductBaseListItem> = [
    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
      align: 'center',
      width: 70,
      render: (text) => (
        <div>
          <Text style={{color: '#181818'}}>{productType(text)}</Text>
        </div>
      ),
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      align: 'center',
      width: 100,
      render: (text) => {
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
      align: 'center',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            {displayIdentityPrice(record, identity)}
          </div>
        )
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 70,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
  ];


  const expandedRowRender = (record: ProjectProductionInfoItem) => {
    return (
      <Table
        showHeader={false}
        size="small"
        rowKey={record => record?.id + '-key'}
        columns={columns2}
        dataSource={record?.conf_par || []}
        pagination={false}
      />
    );
  };
  // 表格请求数据
  const request = async (params?: {
    pageSize?: number;
    current?: number;
    [key: string]: any;
  }): Promise<RequestData<ProjectProductionInfoItem>> => {
    const searchParamsType = addIcontains(params);
    const result = await queryProjectOneDetail({id, params: {...searchParamsType}});
    return Promise.resolve({
      data: result || [],
      success: true,
      total: result?.length || 0,
    })
  };
  return (
    <div>
      {
        visible ?
          <CreateForm
            onSubmit={async (value) => {
              const response = await modifyProductList({id, data: {product_list: value, product_type: 1}});
              const success = new ValidatePwdResult(response).validate('添加成功', null, undefined);
              if (success) {
                setVisible(false);
              }
            }}
            onCancel={() => {
              setVisible(false);
            }}
            updateModalVisible={visible}
            currentUser={currentUser}
            {...props}
          />
          : null
      }
      <ProTable<ProjectProductionInfoItem>
        headerTitle="产品列表"
        options={{reload: true, fullScreen: true, setting: true, density: false}}
        actionRef={actionRef}
        rowKey={record => record?.id + '-key'}
        toolBarRender={() => {
          return [
            <Button icon={<PlusOutlined/>} type="primary" onClick={() => setVisible(true)}>
              添加
            </Button>,
          ];
        }}
        request={request}
        columns={columns}
        expandable={{expandedRowRender}}
        columnsStateMap={columnsStateMap}
        onColumnsStateChange={map => setColumnsStateMap(map)}
        pagination={{pageSize: 5, showQuickJumper: true}}
      />
    </div>
  )
};

class CustomTabs extends Component<CustomTabsProps, CustomTabsState> {

  constructor(props: CustomTabsProps) {
    super(props);
    this.state = {
      activeKey: '',
      panes: [],
    };
  }

  componentDidMount() {
    const {projectDetailList, currentUser, handleModalVisible} = this.props;
    if (_.head(projectDetailList)) {
      const paneArr: PaneItem[] = [];
      projectDetailList.forEach((v: ProjectDetailListItem) => {
        paneArr.push({
          title: v.project_name + '-' + v.username,
          content: <TabItemContent key={v?.id} {...v} currentUser={currentUser}
                                   handleModalVisible={handleModalVisible}/>,
          key: v?.id + '',
        })
      });
      this.setState({activeKey: _.result(_.nth(projectDetailList, -1), 'id') + ''})
      this.setState({panes: paneArr})
    }
  }

  onChange = (activeKey: string) => {
    this.setState({activeKey});
  };

  onEdit = (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove') => {
    this[action](targetKey as string);
  };

  remove = (targetKey: string) => {
    let {activeKey} = this.state;
    let lastIndex = 0;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    console.log(panes, 2);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({panes, activeKey});
    this.props.removeItem(activeKey);
  };

  render() {
    const {panes} = this.state;
    return (
      <Card className={styles.customTabStyle}>
        {_.head(panes) ?
          <Tabs
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onEdit}
            hideAdd={true}
          >
            {panes.map(pane => (
              <TabPane tab={pane.title} key={pane.key} closable={true}>
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
          : '暂未选择项目'}
      </Card>
    );
  }
}

export default CustomTabs;

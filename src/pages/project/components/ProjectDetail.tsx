import React, {FC} from 'react';
import {Alert, Card, Descriptions, List, Table, Typography} from 'antd';
import {CurrentUser} from '@/models/user';
import {currentPriceNumber, handleProjectListItemData, IdentityType} from '@/utils/utils';
import styles from '../style.less';
import {ProductBaseListItem} from '@/pages/product/data';
import {ColumnsType} from 'antd/lib/table';
import {ProjectListItem} from '@/pages/project/data';
import {StatisticWrapper} from '@/components/StatisticWrapper';

const {Paragraph} = Typography;
const {Text} = Typography;

interface BasicListProps {
  current: ProjectListItem;
  currentUser: CurrentUser;
  reload: () => void;
}

const Content = ({data, currentUser, reload}: {
  data: ProjectListItem; currentUser: CurrentUser; reload: () => void;
}) => {
  const {
    project_id, real_name, user_name, user_addr, user_iphone, user_contact,
    create_time, project_name, project_desc, sell_total_quota, pro_status,
    product_list, id, other_list,
  } = data;
  const {identity} = currentUser;

  /**
   * 基础信息：状态、项目ID、填报人、项目名称、用户名称、项目描述
   * 项目产品信息(产品库中)
   * 项目其他附加购买产品信息
   */
  const columns: ColumnsType<any> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      align: 'center',
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        );
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      width: 120,
      align: 'center',
      render: (text: string) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        );
      },
    },
    {
      title: '产品描述',
      dataIndex: 'desc',
      key: 'desc',
      align: 'center',
      render: (text: string) => {
        return (
          <div style={{textAlign: 'left'}}>
            {text?.split('\n')?.map((o, i) => {
              return (
                <div key={id + '-x-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 130,
      render: (text) => {
        return (
          <div>
            <Text style={{color: '#FF6A00'}}>
              {text ?
                <StatisticWrapper value={text}/>
                : '尚未定价'}
            </Text>
          </div>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      width: 120,
    },
    {
      title: '金额',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 130,
      align: 'center',
      render: (value, row, index) => {
        const obj: {
          props: { rowSpan?: number; [propName: string]: any; };
          [propName: string]: any;
        } = {
          children: <div>
            <Text style={{color: '#FF6A00'}}>
              {value ?
                <StatisticWrapper value={value}/>
                : '部分尚未定价'}
            </Text>
          </div>,
          props: {},
        };
        if (index === 0) {
          obj.props.rowSpan = row?.total;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ];

  return (
    <div className={styles.listContentWrapper}>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="基本信息"
          type="success"
          closable
        />
      </div>
      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="项目基础信息" span={1}>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目ID：</Text>
          <Text strong style={{color: '#FF6A00'}}>{project_id}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目名称：</Text>
          <Text strong style={{color: '#181818'}}>{project_name}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>填报人：</Text>
          <Text strong style={{color: '#181818'}}>{real_name}</Text>
          <br/>
          <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>项目创建时间：</Text>
          <Text strong style={{color: '#1890FF'}}>{create_time}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="项目描述" span={2}>
          {project_desc?.split('\n')?.map((o, i) => {
            return (
              <div key={project_id + '-' + i}><Text style={{color: '#181818'}} key={i}>{o}</Text><br/></div>
            );
          })}
        </Descriptions.Item>
        <Descriptions.Item label="用户信息" span={1}>
          <Descriptions.Item label={<span style={{color: '#FFFFFF'}}>用户详细信息：</span>} span={4}>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>用户名称：</Text>
            <Text strong style={{color: '#FF6A00'}}>{user_name}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>地址：</Text>
            <Text strong style={{color: '#181818'}}>{user_addr}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>电话：</Text>
            <Text strong style={{color: '#181818'}}>{user_iphone}</Text>
            <br/>
            <Text style={{color: '#181818', width: '100px', display: 'inline-block'}}>联系人：</Text>
            <Text strong style={{color: '#1890FF'}}>{user_contact}</Text>
          </Descriptions.Item>
        </Descriptions.Item>
      </Descriptions>
      <div style={{margin: '10px 0'}}>
        <Alert
          message="产品清单"
          type="info"
          closable
        />
      </div>
      <List
        size="large"
        rowKey={record => record.id?.toString()}
        pagination={false}
        dataSource={handleProjectListItemData(product_list, identity as IdentityType, other_list, sell_total_quota) || []}
        renderItem={(item: any[], index) => {
          console.log(item);
          // console.log(handleProjectListItemData(product_list, identity as IdentityType, other_list));
          return (
            <List.Item
            >
              <div>
                <div>
                  产品{index + 1}
                </div>
                <Table
                  bordered
                  rowKey={record => record?.id}
                  columns={columns}
                  pagination={false}
                  dataSource={item || []}
                />
              </div>
            </List.Item>
          );
        }}
      >
      </List>
    </div>
  );
};

const ProjectDetail: FC<BasicListProps> = props => {
  const {
    current,
    currentUser,
    reload
  } = props;

  return (
    <div>
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{marginTop: 24}}
          bodyStyle={{padding: '0 32px 40px 32px'}}
        >
          <Content data={current} currentUser={currentUser} reload={reload}/>
        </Card>
      </div>

    </div>
  );
};

export default ProjectDetail;

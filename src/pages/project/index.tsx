import React, {Component} from 'react';

import {Alert} from 'antd';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {connect} from 'dva';
import router from 'umi/router';

interface ProductProps {
  match: {
    url: string;
    path: string;
  };
  location: {
    pathname: string;
  };
}

class Product extends Component<ProductProps> {
  handleTabChange = (key: string) => {
    const {match} = this.props;
    const url = match.url === '/' ? '' : match.url;
    switch (key) {
      case 'list':
        router.push(`${url}/list`);
        break;
      case 'detail':
        router.push(`${url}/detail`);
        break;
      default:
        break;
    }
  };


  getTabKey = () => {
    const {match, location} = this.props;
    const url = match.path === '/' ? '' : match.path;
    const tabKey = location.pathname.replace(`${url}/`, '');
    if (tabKey && tabKey !== '/') {
      return tabKey;
    }
    return 'list';
  };

  render() {
    const tabList = [
      {
        key: 'list',
        tab: '项目列表',
      },
      {
        key: 'detail',
        tab: '项目详情',
      },
    ];

    const {children} = this.props;

    return (
      <PageHeaderWrapper
        content={<Alert
          message="项目若是下单状态，则不可撤销。若需要请及时联系代理处，避免带来不必要的损失。"
          type="error"
          closable
        />}
        tabList={tabList}
        tabActiveKey={this.getTabKey()}
        onTabChange={this.handleTabChange}
        breadcrumb={undefined}
        title={false}
      >
        {children}
      </PageHeaderWrapper>
    );
  }
}

export default connect()(Product);

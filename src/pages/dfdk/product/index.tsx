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
      case 'product-base':
        router.push(`${url}/product-base`);
        break;
      case 'product-config':
        router.push(`${url}/product-config`);
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
    return 'product-base';
  };

  render() {
    const tabList = [
      {
        key: 'product-base',
        tab: '标准配置',
      },
      {
        key: 'product-config',
        tab: '配件配置',
      },
    ];

    const {children} = this.props;

    const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      console.log(e, 'I was closed.');
    };

    return (
      <PageHeaderWrapper
        content={<Alert
          message="产品配置分为两部分：标准配置和扩展配置，若需要增加产品配置，请定义配件后在标准配置中添加"
          type="info"
          closable
          onClose={onClose}
        />}
        tabList={tabList}
        tabActiveKey={this.getTabKey()}
        onTabChange={this.handleTabChange}
      >
        {children}
      </PageHeaderWrapper>
    );
  }
}

export default connect()(Product);

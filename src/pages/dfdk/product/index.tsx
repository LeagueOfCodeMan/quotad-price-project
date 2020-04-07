import React, {Component} from 'react';

import {Alert} from 'antd';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {connect} from 'dva';
import router from 'umi/router';
import {CurrentUser, UserModelState} from "@/models/user";

interface ProductProps {
  match: {
    url: string;
    path: string;
  };
  location: {
    pathname: string;
  };
  currentUser: CurrentUser;
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
    const {currentUser: {identity}} = this.props;
    const tabList = identity === 1 ? [
      {
        key: 'product-config',
        tab: '产品库',
      },
      {
        key: 'product-base',
        tab: '标准产品',
      },
    ] : [
      {
        key: 'product-base',
        tab: '标准产品',
      },
    ];

    const {children} = this.props;

    const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      console.log(e, 'I was closed.');
    };

    return (
      <PageHeaderWrapper
        content={identity === 1 ? <Alert
          message="产品配置流程：在产品库中定义产品、配件、服务等，然后通过组装生成标准产品"
          type="info"
          closable
          onClose={onClose}
        /> : null}
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

export default connect(
  ({
     user,
   }: {
    user: UserModelState;
  }) => ({
    currentUser: user.currentUser,
  }),
)(Product);

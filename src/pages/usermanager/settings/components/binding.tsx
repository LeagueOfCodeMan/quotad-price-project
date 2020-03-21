import {formatMessage, FormattedMessage} from 'umi-plugin-react/locale';
import {AlipayOutlined, DingdingOutlined, TaobaoOutlined} from '@ant-design/icons';
import {List} from 'antd';
import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {CurrentUser} from "@/models/user";

class BindingView extends Component {
  getData = () => [
    {
      title: formatMessage({id: 'accountandsettings.binding.taobao'}, {}),
      description: formatMessage({id: 'accountandsettings.binding.taobao-description'}, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="accountandsettings.binding.bind" defaultMessage="Bind"/>
        </a>,
      ],
      avatar: <TaobaoOutlined className="taobao"/>,
    },
    {
      title: formatMessage({id: 'accountandsettings.binding.alipay'}, {}),
      description: formatMessage({id: 'accountandsettings.binding.alipay-description'}, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="accountandsettings.binding.bind" defaultMessage="Bind"/>
        </a>,
      ],
      avatar: <AlipayOutlined className="alipay"/>,
    },
    {
      title: formatMessage({id: 'accountandsettings.binding.dingding'}, {}),
      description: formatMessage({id: 'accountandsettings.binding.dingding-description'}, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="accountandsettings.binding.bind" defaultMessage="Bind"/>
        </a>,
      ],
      avatar: <DingdingOutlined className="dingding"/>,
    },
  ];

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={[]}
          // renderItem={item => (
          //   <List.Item actions={item.actions}>
          //     <List.Item.Meta
          //       avatar={item.avatar}
          //       title={item.title}
          //       description={item.description}
          //     />
          //   </List.Item>
          // )}
        />
      </Fragment>
    );
  }
}

export default connect(
  ({user}: { user: { currentUser: CurrentUser } }) => ({
    currentUser: user.currentUser,
  }),
)(BindingView);

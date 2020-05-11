import {FormattedMessage, formatMessage} from 'umi-plugin-react/locale';
import React, {Component} from 'react';

import {List} from 'antd';
import {connect} from "react-redux";
import {CurrentUser} from "@/models/user";

type Unpacked<T> = T extends (infer U)[] ? U : T;


interface SecurityViewProps {
  currentUser?: CurrentUser;
  handleSecurityUpdate: (target: string) => void;
}

class SecurityView extends Component<SecurityViewProps> {
  getData = () => {
    const {currentUser, handleSecurityUpdate} = this.props;
    return [
      {
        title: formatMessage({id: 'accountandsettings.security.password'}, {}),
        actions: [
          <a key="Modify" onClick={() => {
            handleSecurityUpdate('password')
          }}>
            <FormattedMessage id="accountandsettings.security.modify" defaultMessage="Modify"/>
          </a>,
        ],
      },
      {
        title: formatMessage({id: 'accountandsettings.security.phone'}, {}),
        description: `${formatMessage(
          {id: 'accountandsettings.security.phone-description'},
          {},
        )}${currentUser?.tel || '请先绑定'}`,
        actions: [
          <a key="Modify" onClick={() => {
            handleSecurityUpdate('tel')
          }}>
            <FormattedMessage id="accountandsettings.security.modify" defaultMessage="Modify"/>
          </a>,
        ],
      },
      {
        title: formatMessage({id: 'accountandsettings.security.email'}, {}),
        description: `${formatMessage(
          {id: 'accountandsettings.security.email-description'},
          {},
        )}${currentUser?.email || '请先绑定'}`,
        actions: [
          <a key="Modify" onClick={() => {
            handleSecurityUpdate('email')
          }}>
            <FormattedMessage id="accountandsettings.security.modify" defaultMessage="Modify"/>
          </a>,
        ],
      }
    ]
  };

  render() {
    const data = this.getData();
    return (
      <div style={{margin:'40px 0 0 100px'}}>
        <List<Unpacked<typeof data>>
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description}/>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default connect(
  ({user}: { user: { currentUser: CurrentUser } }) => ({
    currentUser: user.currentUser,
  }),
)(SecurityView);

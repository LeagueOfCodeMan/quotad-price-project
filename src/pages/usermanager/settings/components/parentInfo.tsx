import {formatMessage} from 'umi-plugin-react/locale';
import React, {Component} from 'react';

const CopyToClipboard = require('react-copy-to-clipboard');

import {List, message} from 'antd';
import {connect} from "react-redux";
import {CurrentUser} from "@/models/user";
import {CopyTwoTone, QqCircleFilled} from "@ant-design/icons/lib";
import styles from './BaseView.less';

type Unpacked<T> = T extends (infer U)[] ? U : T;


interface SecurityViewProps {
  currentUser?: CurrentUser;
}

class ParentInfo extends Component<SecurityViewProps> {
  getData = () => {
    const {currentUser} = this.props;
    const parent = currentUser?.parent;
    return [
      {
        title: formatMessage({id: 'yuntai.usermanager.settings.parent.username'}, {}),
        description: (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span>{parent?.real_name || '暂无'}</span>
          </div>
        ),
      },
      {
        title: formatMessage({id: 'yuntai.usermanager.settings.parent.tel'}, {}),
        description: (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span>{parent?.tel || '暂无'}</span>
            {parent?.tel ?
              <div className={styles.copyToClipboard}>
                <CopyToClipboard text={parent?.tel}
                                 onCopy={() => message.success('已复制至剪切板!')}>
                  <CopyTwoTone/>
                </CopyToClipboard>
              </div>
              : null}
          </div>
        ),
        actions: [
          <a key="Modify" onClick={() => {
            message.info('功能开发中');
          }}>
            <QqCircleFilled style={{color: '#3F91F7', fontSize: '25px'}}/>
          </a>,
        ],
      },
      {
        title: formatMessage({id: 'yuntai.usermanager.settings.parent.addr'}, {}),
        description: (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span>{parent?.addr || '暂无'}</span>
            {parent?.addr ?
              <div className={styles.copyToClipboard}>
                <CopyToClipboard text={parent?.addr}
                                 onCopy={() => message.success('已复制至剪切板!')}>
                  <CopyTwoTone/>
                </CopyToClipboard>
              </div>
              : null}
          </div>
        ),
      },
      {
        title: formatMessage({id: 'yuntai.usermanager.settings.parent.email'}, {}),
        description: (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span>{parent?.email || '暂无'}</span>
            {parent?.email ?
              <div className={styles.copyToClipboard}>
                <CopyToClipboard text={parent?.email}
                                 onCopy={() => message.success('已复制至剪切板!')}>
                  <CopyTwoTone/>
                </CopyToClipboard>
              </div>
              : null}
          </div>
        ),
      }
    ]
  };

  render() {
    const data = this.getData();
    return (
      <>
        <List<Unpacked<typeof data>>
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description}/>
            </List.Item>
          )}
        />
      </>
    );
  }
}

export default connect(
  ({user}: { user: { currentUser: CurrentUser } }) => ({
    currentUser: user.currentUser,
  }),
)(ParentInfo);

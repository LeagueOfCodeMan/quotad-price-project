import {LogoutOutlined, SettingOutlined} from '@ant-design/icons';
import {Menu, Spin} from 'antd';
import {ClickParam} from 'antd/es/menu';
import React from 'react';
import {connect} from 'dva';
import {router} from 'umi';
import {ConnectProps, ConnectState} from '@/models/connect';
import {CurrentUser} from '@/models/user';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import Avatar from "antd/lib/avatar";

export interface GlobalHeaderRightProps extends ConnectProps {
  currentUser?: CurrentUser;
  menu?: boolean;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: ClickParam) => {
    const {key} = event;

    if (key === 'logout') {
      const {dispatch} = this.props;

      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }

      return;
    }
    router.push(`/usermanager/${key}`);
  };

  render(): React.ReactNode {
    const {
      currentUser = {
        avatar: '',
        username: '',
      },
      menu,
    } = this.props;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {menu && (
          <Menu.Item key="settings">
            <SettingOutlined/>
            个人设置
          </Menu.Item>
        )}
        {menu && <Menu.Divider/>}

        <Menu.Item key="logout">
          <LogoutOutlined/>
          退出登录
        </Menu.Item>
      </Menu>
    );
    return currentUser && currentUser.username ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar"/>
          <span className={styles.name}><span style={{color: '#ec384f'}}>{currentUser.username}</span></span>
        </span>
      </HeaderDropdown>
    ) : (
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    );
  }
}

export default connect(({user}: ConnectState) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);

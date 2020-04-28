import React, {Component} from 'react';

import {Dispatch} from 'redux';
import {FormattedMessage} from 'umi-plugin-react/locale';
import {GridContent} from '@ant-design/pro-layout';
import {Menu, message} from 'antd';
import {connect} from 'dva';
import BaseView from './components/base';
import BindingView from './components/binding';
import ParentInfo from './components/parentInfo';
import SecurityView from './components/security';
import AddressInfo from './components/address';
import styles from './style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import {ModifyType, ResultType, ValidatePwdResult} from "@/utils/utils";
import UpdatePassword from "@/components/UpdatePassword";
import {modifyPassword, updateUser} from "@/pages/usermanager/settings/service";
import ModifyUserInfo from "@/pages/usermanager/settings/components/modifyUser";
import {UserListItem} from "@/models/data";
import {CreateUser} from "@/pages/usermanager/userlist/data";

const {Item} = Menu;

interface SettingsProps {
  dispatch: Dispatch<any>;
  currentUser: CurrentUser;
  user: UserModelState;
}

type SettingsStateKeys = 'base' | 'security' | 'binding' | 'notification' | 'parent' | 'address';


interface SettingsState {
  mode: 'inline' | 'horizontal';
  menuMap: {
    [key: string]: React.ReactNode;
  };
  selectKey: SettingsStateKeys;
  updateVisible: boolean;
  modifyUserInfoVisible: boolean;
  modifyType: ModifyType;
}

class Settings extends Component<SettingsProps, SettingsState> {
  main: HTMLDivElement | undefined = undefined;

  constructor(props: SettingsProps) {
    super(props);
    const menuMap = {
      base: (
        <FormattedMessage id="accountandsettings.menuMap.basic" defaultMessage="Basic Settings"/>
      ),
      security: (
        <FormattedMessage
          id="accountandsettings.menuMap.security"
          defaultMessage="Security Settings"
        />
      ),
      // binding: (
      //   <FormattedMessage
      //     id="accountandsettings.menuMap.binding"
      //     defaultMessage="Account Binding"
      //   />
      // ),
      // address: (
      //   <FormattedMessage
      //     id="accountandsettings.menuMap.address"
      //     defaultMessage="Address"
      //   />
      // ),
      // notification: (
      //   <FormattedMessage
      //     id="accountandsettings.menuMap.notification"
      //     defaultMessage="New Message Notification"
      //   />
      // ),
      parent: (
        <FormattedMessage
          id="accountandsettings.menuMap.parent"
          defaultMessage="Contact Administrator"
        />
      ),
    };
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: 'base',
      updateVisible: false,
      modifyUserInfoVisible: false,
      modifyType: null,

    };
  }

  resetDispatch = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
  }

  resetAddress = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'user/fetchAddress',
    });
  }

  componentDidMount() {
    this.resetDispatch();
    this.resetAddress();
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  getMenu = () => {
    const {menuMap} = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}>{menuMap[item]}</Item>);
  };

  getRightTitle = () => {
    const {selectKey, menuMap} = this.state;
    return menuMap[selectKey];
  };

  selectKey = (key: SettingsStateKeys) => {
    this.setState({
      selectKey: key,
    });
  };

  resize = () => {
    if (!this.main) {
      return;
    }
    requestAnimationFrame(() => {
      if (!this.main) {
        return;
      }
      let mode: 'inline' | 'horizontal' = 'inline';
      const {offsetWidth} = this.main;
      if (this.main.offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      this.setState({
        mode,
      });
    });
  };

  updateBase = async (values: CreateUser) => {
    const {user: {currentUser}} = this.props;
    const hide = message.loading('正在修改');
    const result: ResultType | string =
      await updateUser({
        id: (currentUser as UserListItem)?.id, data: values
      });
    const success = new ValidatePwdResult(result).validate('修改成功', null, hide);
    if (success) {
      this.resetDispatch();
    }
  };

  handleSecurityUpdate = (target: string) => {
    if (target === 'password') {
      this.setState({updateVisible: true})
    } else {
      this.setState({modifyType: target as ModifyType, modifyUserInfoVisible: true})
    }
  };

  handleAddressUpdate = () => {
    this.resetAddress();
  }

  renderChildren = () => {
    const {selectKey} = this.state;
    switch (selectKey) {
      case 'base':
        return <BaseView onSubmit={this.updateBase} hadUploadImage={() => {
          this.resetDispatch();
        }}/>;
      case 'security':
        return <SecurityView handleSecurityUpdate={this.handleSecurityUpdate}/>;
      case 'binding':
        return <BindingView/>;
      // case 'notification':
      //   return <NotificationView/>;
      case 'parent':
        return <ParentInfo/>;
      case 'address':
        return <AddressInfo handleAddressUpdate={this.handleAddressUpdate}/>;
      default:
        break;
    }
    return null;
  };

  render() {
    const {user: {currentUser}} = this.props;
    if (!currentUser.username) {
      return '';
    }
    const {mode, selectKey, updateVisible, modifyUserInfoVisible, modifyType} = this.state;
    const hide = () => {
      message.loading('正在修改');
    };
    return (
      <GridContent>
        <UpdatePassword
          visible={updateVisible}
          onCreate={async (values) => {
            const result = await modifyPassword({
              id: currentUser?.id as number, data: values
            });
            const success = new ValidatePwdResult(result).validate('修改成功，请重新登录！', '修改失败', hide);
            if (success) {
              this.setState({updateVisible: false});
              // TODO something
              this.resetDispatch();
            }
          }}

          onCancel={() => {
            this.setState({updateVisible: false});
          }}
        />
        <ModifyUserInfo
          visible={modifyUserInfoVisible}
          onCreate={async (values) => {
            const result = await updateUser({
              id: currentUser?.id as number, data: values
            });
            const success = new ValidatePwdResult(result).validate('修改成功！', '修改失败', hide);
            if (success) {
              this.setState({modifyUserInfoVisible: false});
              // TODO something
              this.resetDispatch();
            }
          }}
          modifyType={modifyType}
          onCancel={() => {
            this.setState({modifyUserInfoVisible: false});
          }}
        />
        <div
          className={styles.main}
          ref={ref => {
            if (ref) {
              this.main = ref;
            }
          }}
        >
          <div className={styles.leftMenu}>
            <Menu
              mode={mode}
              selectedKeys={[selectKey]}
              onClick={({key}) => this.selectKey(key as SettingsStateKeys)}
            >
              {this.getMenu()}
            </Menu>
          </div>
          <div className={styles.right}>
            <div className={styles.title}>{this.getRightTitle()}</div>
            {this.renderChildren()}
          </div>
        </div>
      </GridContent>
    );
  }
}

export default connect(
  ({user}: { user: UserModelState; }) => ({user}),
)(Settings);

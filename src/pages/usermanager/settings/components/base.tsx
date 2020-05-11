import {UploadOutlined} from '@ant-design/icons';
import {Button, message, Upload} from 'antd';
import {FormattedMessage} from 'umi-plugin-react/locale';
import React, {Component} from 'react';

import {connect} from 'dva';
import styles from './BaseView.less';
import {CurrentUser} from '@/models/user';
import {identifyUser, IdentityType} from '@/utils/utils';

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({avatar, url, hadUploadImage}: {
  avatar: string; url: string; hadUploadImage?: () => void;
}) => {
  const props = {
    action: url,
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        hadUploadImage && hadUploadImage();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败!`);
      }
    },
  };

  return (
    <div>
      <div className={styles.avatar_title}>
        <FormattedMessage id="accountandsettings.basic.avatar" defaultMessage="Avatar"/>
      </div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar"/>
      </div>
      <Upload showUploadList={false} {...props}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined/>
            <FormattedMessage
              id="accountandsettings.basic.change-avatar"
              defaultMessage="Change avatar"
            />
          </Button>
        </div>
      </Upload>
    </div>
  );
};

interface BaseViewProps {
  currentUser?: CurrentUser;
  onSubmit?: (values: any) => void;
  hadUploadImage?: () => void;
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  getAvatarURL() {
    const {currentUser} = this.props;
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  }

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  handleFinish = (values: any) => {
    const {onSubmit} = this.props;
    onSubmit && onSubmit(values);
  };

  render() {
    const {currentUser} = this.props;

    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.right} style={{display: 'flex'}}>
          <AvatarView avatar={this.getAvatarURL()} url={'/api/user/' + currentUser?.id + '/modify_headimg'}
                      hadUploadImage={this.props.hadUploadImage}/>
          <div style={{marginTop: '45px', marginLeft: '50px'}}>
            <div>地区编码：<span style={{color: 'red', marginLeft: '14px'}}>{currentUser?.code}</span></div>
            <div>公司名称：<span style={{color: 'red', marginLeft: '14px'}}>{currentUser?.company}</span></div>
            <div>真实姓名：<span style={{color: 'red', marginLeft: '14px'}}>{currentUser?.real_name}</span></div>
            <div>联系地址：<span style={{color: 'red', marginLeft: '14px'}}>{currentUser?.addr}</span></div>
            <div>当前权限级别：<span
              style={{color: 'red', marginLeft: '14px'}}>{identifyUser(currentUser?.identity as IdentityType)}</span>
            </div>
            <div>上一次登录时间：<span style={{color: 'red'}}>{currentUser?.last_login || ''}</span></div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({user}: { user: { currentUser: CurrentUser } }) => ({
    currentUser: user.currentUser,
  }),
)(BaseView);

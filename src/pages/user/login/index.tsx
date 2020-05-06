// import { AlipayCircleOutlined, TaobaoCircleOutlined, WeiboCircleOutlined } from '@ant-design/icons';
import {Alert, Checkbox} from 'antd';
import React, {useState} from 'react';
import {AnyAction, Dispatch} from 'redux';
// import { Link } from 'umi';
import {connect} from 'dva';
import styles from './style.less';
import {LoginParamsType} from './service';
import LoginFrom from './components/Login';
import {UserModelState} from "@/models/user";

const {
  Tab, UserName, Password,
  // Mobile, Captcha,
  Submit
} = LoginFrom;

interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  user: UserModelState;
  submitting?: boolean;
}

const LoginMessage: React.FC<{
  content: string;
}> = ({content}) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = props => {
  const {user, submitting} = props;
  const {status, type: loginType} = user;
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: LoginParamsType) => {
    const {dispatch} = props;
    dispatch({
      type: 'user/login',
      payload: {
        ...values,
        type,
      },
    });
  };
  return (
    <div className={styles.main}>
      <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab key="account" tab="账户密码登录">
          {status === 'error' && loginType === 'account' && !submitting && (
            <LoginMessage content="账户或密码错误"/>
          )}

          <UserName
            name="username"
            placeholder="用户名: username"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码: password"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
        <Submit loading={submitting}>登录</Submit>
        {/*<div className={styles.other}>*/}
        {/*其他登录方式*/}
        {/*<AlipayCircleOutlined className={styles.icon} />*/}
        {/*<TaobaoCircleOutlined className={styles.icon} />*/}
        {/*<WeiboCircleOutlined className={styles.icon} />*/}
        {/*<Link className={styles.register} to="/user/register">*/}
        {/*注册账户*/}
        {/*</Link>*/}
        {/*</div>*/}
      </LoginFrom>
    </div>
  );
};

export default connect(
  ({
     user,
     loading,
   }: {
    user: UserModelState;
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
  }) => ({
    user,
    submitting: loading.effects['user/login'],
  }),
)(Login);

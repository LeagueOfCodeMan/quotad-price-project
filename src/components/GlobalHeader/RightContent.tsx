import {Badge, Tag} from 'antd';
import React, {useState} from 'react';
import {connect} from 'dva';
import {ConnectProps, ConnectState} from '@/models/connect';
import Avatar from './AvatarDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';
import {ShoppingCartOutlined} from "@ant-design/icons/lib";
import ShoppingCart from '@/components/ShoppingCart';

export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  const {theme, layout} = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <ShoppingCart
        onSubmit={() => {
        }}
        onCancel={() => {
          setShowDrawer(false);
        }}
        visible={showDrawer}
      />
      <span className={styles.shopping} onClick={() => {
        setShowDrawer(true);
      }}>
        <Badge count={5} offset={[-20, 0]}>
        <ShoppingCartOutlined className={styles.shoppingIcon}/>
        </Badge>
                购物车
      </span>
      {/*<HeaderSearch*/}
      {/*className={`${styles.action} ${styles.search}`}*/}
      {/*placeholder="站内搜索"*/}
      {/*defaultValue="umi ui"*/}
      {/*options={[*/}
      {/*{*/}
      {/*label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>,*/}
      {/*value: 'umi ui',*/}
      {/*},*/}
      {/*{*/}
      {/*label: <a href="next.ant.design">Ant Design</a>,*/}
      {/*value: 'Ant Design',*/}
      {/*},*/}
      {/*{*/}
      {/*label: <a href="https://protable.ant.design/">Pro Table</a>,*/}
      {/*value: 'Pro Table',*/}
      {/*},*/}
      {/*{*/}
      {/*label: <a href="https://prolayout.ant.design/">Pro Layout</a>,*/}
      {/*value: 'Pro Layout',*/}
      {/*},*/}
      {/*]} */}
      {/*onSearch={value => {*/}
      {/*//console.log('input', value);*/}
      {/*}}*/}
      {/*/>*/}
      {/*<Tooltip title="使用文档">*/}
      {/*<a*/}
      {/*target="_blank"*/}
      {/*href="https://pro.ant.design/docs/getting-started"*/}
      {/*rel="noopener noreferrer"*/}
      {/*className={styles.action}*/}
      {/*>*/}
      {/*<QuestionCircleOutlined/>*/}
      {/*</a>*/}
      {/*</Tooltip>*/}
      {/*<NoticeIconView />*/}
      <Avatar menu/>
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      <SelectLang className={styles.action}/>
    </div>
  );
};

export default connect(({settings}: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);

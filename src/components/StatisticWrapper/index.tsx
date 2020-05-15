import {Statistic} from 'antd';
import React, {CSSProperties} from 'react';
import styles from './index.less';
import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons/lib';

export const StatisticWrapper: React.FC<{ value: string | number; style?: CSSProperties; }> = ({value, style}) => {
  return (
    <>
      <Statistic className={styles.statisticWrapper} title="" prefix="¥" suffix="元"
                 valueStyle={{fontSize: style?.fontSize || '14px', color: style?.color || 'red', minWidth: '135px', textAlign: 'right'}}
                 value={typeof value === 'number' ? value : parseFloat(value)} precision={2}/>
    </>
  );
};

export const StatisticArrow: React.FC<{ value: string | number; style?: CSSProperties; }> = ({value, style}) => {
  const int = typeof value === 'number' ? value : parseFloat(value);
  return (
    <>
      <Statistic className={styles.statisticWrapper} title=""
                 prefix={int > 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>} suffix="元"
                 valueStyle={{fontSize: '14px', color: int > 0 ? '#3f8600' : '#cf1322'}}
                 value={int} precision={2}/>
    </>
  );
};

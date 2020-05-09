import {Statistic} from 'antd';
import React from 'react';
import styles from './index.less';

export const StatisticWrapper: React.FC<{ value: string | number }> = ({value}) => {
  return (
    <>
      <Statistic className={styles.statisticWrapper} title="" prefix="¥" suffix="元"
                 valueStyle={{color: 'red', fontSize: '14px'}}
                 value={typeof value === 'number' ? value : parseFloat(value)} precision={2}/>
    </>
  );
};

import {Statistic} from 'antd';
import React, {CSSProperties} from 'react';
import styles from './index.less';

export const StatisticWrapper: React.FC<{ value: string | number; style?: CSSProperties; }> = ({value, style}) => {
  return (
    <>
      <Statistic className={styles.statisticWrapper} title="" prefix="¥" suffix="元"
                 valueStyle={{fontSize: '14px', color: style?.color || 'red'}}
                 value={typeof value === 'number' ? value : parseFloat(value)} precision={2}/>
    </>
  );
};

import React from 'react';
import styles from './index.less';
import {Tooltip} from "antd";

interface ScrollListProps {
  title:string;
}


const ScrollList: React.FC<ScrollListProps> =
  (props) => {
    return (
      <Tooltip
        placement="top"
        className={styles.listContainer}
        title={
          <div className={styles.listWrapper}>
            <div className={styles.listInner}>
              <div className={styles.listContent}>
                {props.children}
              </div>
            </div>
          </div>
        }>
        <span style={{color:'#1890FF'}}>{props.title}</span>
      </Tooltip>

    );
  };

export default ScrollList;

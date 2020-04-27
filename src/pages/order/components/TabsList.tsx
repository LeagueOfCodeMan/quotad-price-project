import React from 'react';
import {Tabs} from 'antd';

const {TabPane} = Tabs;

export type PaneDetail = { title: React.ReactNode | string; content: React.ReactNode | string; key: string; closable: boolean | undefined; };

interface TabsListProps {
  removeItem: (target: string) => void;
  panes: PaneDetail[];
}

interface TabsListStates {
  activeKey: string;
  panes: PaneDetail[];
  prevPanes: PaneDetail[];
}

export class TabsList extends React.Component<TabsListProps, TabsListStates> {
  newTabIndex: number;

  constructor(props: TabsListProps) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      activeKey: '',
      panes: [],
      prevPanes: [],
    };
  }

  static getDerivedStateFromProps(props: TabsListProps, state: TabsListStates) {
    if (!_.isEqual(_.map(props.panes, d => (d?.key)), _.map(state.prevPanes, d => (d?.key)))) {
      return {
        activeKey: _.nth(props?.panes, -1)?.key,
        panes: props?.panes,
        prevPanes: props?.panes
      }
    } else {
      return {
        panes: props?.panes,
        prevPanes: props?.panes
      };
    }
  }

  onChange = (activeKey: string) => {
    this.setState({activeKey});
  };

  onEdit = (targetKey: any, action: string | number) => {
    this[action](targetKey);
  };

  // add = () => {
  //   const {panes} = this.state;
  //   const activeKey = `newTab${this.newTabIndex++}`;
  //   panes.push({title: 'New Tab', content: 'Content of new Tab', key: activeKey, closable: undefined});
  //   this.setState({panes, activeKey});
  // };

  remove = (targetKey: string) => {
    let {activeKey} = this.state;
    let lastIndex;
    this.state.panes.forEach((pane: { key: string; }, i: number) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter((pane: { key: string; }) => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex && lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.props.removeItem(targetKey);
    this.setState({panes, activeKey});
  };

  render() {
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
        hideAdd={true}
      >
        {this.state.panes.map((pane: { title: React.ReactNode; key: string; closable: boolean | undefined; content: React.ReactNode; }) => (
          <TabPane tab={pane.title} key={pane.key} closable={!!pane.closable}>
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}

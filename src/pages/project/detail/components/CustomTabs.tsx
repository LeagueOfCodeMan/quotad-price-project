import {Card, Tabs} from 'antd';
import * as React from "react";
import {Component, FC} from "react";
import {ProjectDetailListItem, ProjectListItem} from "@/pages/project/data";
import _ from "lodash";

const {TabPane} = Tabs;

interface CustomTabsProps {
  projectDetailList: ProjectDetailListItem[];

  [propName: string]: any;
}

type PaneItem = {
  title: JSX.Element | string;
  content: JSX.Element | string;
  key: string;
}

interface CustomTabsState {
  activeKey: string;
  panes: PaneItem[];
}

const TabItemContent: FC<ProjectListItem> = props => {
  return (
    <div>
      <span>商品详细内容</span>
    </div>
  )
};

class CustomTabs extends Component<CustomTabsProps, CustomTabsState> {

  constructor(props: CustomTabsProps) {
    super(props);
    this.state = {
      activeKey: '',
      panes: [],
    };
  }

  componentDidMount() {
    const {projectDetailList} = this.props;
    if (_.head(projectDetailList)) {
      const paneArr: PaneItem[] = [];
      projectDetailList.forEach((v: ProjectDetailListItem) => {
        paneArr.push({
          title: v.project_name + '-' + v.username,
          content: <TabItemContent {...v}/>,
          key: v?.id + '',
        })
      });
      this.setState({activeKey: _.result(_.head(projectDetailList), 'id') + ''})
      this.setState({panes: paneArr})
    }
  }

  onChange = (activeKey: string) => {
    this.setState({activeKey});
  };

  onEdit = (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove') => {
    this[action](targetKey as string);
  };

  remove = (targetKey: string) => {
    let {activeKey} = this.state;
    let lastIndex = 0;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    console.log(panes, 2);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({panes, activeKey});
    this.props.removeItem(activeKey);
  };

  render() {
    const {panes} = this.state;
    return (
      <Card>
        {_.head(panes) ?
          <Tabs
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onEdit}
            hideAdd={true}
          >
            {panes.map(pane => (
              <TabPane tab={pane.title} key={pane.key} closable={true}>
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
          : '暂未选择项目'}
      </Card>
    );
  }
}

export default CustomTabs;

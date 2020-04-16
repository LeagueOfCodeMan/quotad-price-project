import React, {FC, useState} from 'react';
import {message,} from 'antd';
import {Dispatch} from 'redux';
import {connect} from 'dva';
import {CurrentUser, UserModelState} from "@/models/user";
import {ResultType, ValidatePwdResult} from "@/utils/utils";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ProjectDetailListItem} from "@/pages/project/data";
import CustomTabs from "@/pages/project/detail/components/CustomTabs";
import {createProject} from "@/pages/project/service";
import CreateForm from "@/pages/project/detail/components/CreateForm";


interface BasicListProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  currentUser: CurrentUser;
  projectDetailList: ProjectDetailListItem[];
}


export const ProjectDetail: FC<BasicListProps> = props => {
  const [validateVisible, setValidateVisible] = useState(false);
  // const [validateType, setValidateType] = useState<string>("");

  const {projectDetailList = [], dispatch, currentUser} = props;
  const {identity} = currentUser;

  // 密码校验
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const removeItem = (key: string) => {
    dispatch({
      type: 'user/deleteProjectItem',
      payload: parseInt(key)
    })
  };

  return (
    <div>
      <CustomTabs
        projectDetailList={projectDetailList} currentUser={currentUser}
        removeItem={removeItem}
      />
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
          const success = await onCreate(values)
          if (success) {
            setValidateVisible(false);
            // TODO something
          }
        }}

        onCancel={() => {
          setValidateVisible(false);
        }}
      />

    </div>
  );
};

export default connect(
  ({
     loading, user,
   }: {
    loading: {
      models: { [key: string]: boolean };
    };
    user: UserModelState;
  }) => ({
    currentUser: user.currentUser,
    projectDetailList: user.projectDetailList,
  }),
)(ProjectDetail);

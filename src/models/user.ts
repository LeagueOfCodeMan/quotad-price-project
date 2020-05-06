import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';
import {message} from 'antd';

import {queryCurrent, queryCurrentUsers} from '@/services/user';
import {CurrentChildren, LoginResultType, UserListItem} from "@/models/data";
import {isNormalResponseBody} from "@/utils/utils";
import {ProjectDetailListItem, ProjectListItem} from "@/pages/project/data";
import {ConnectState} from "@/models/connect";
import ld from 'lodash';
import {fakeAccountLogin} from "@/pages/user/login/service";
import {routerRedux} from "dva/router";
import {setAuthority} from "@/pages/user/login/utils/utils";
import {StateType} from "@/pages/user/login/model";

export interface LoginPayload {
  username: string;
  password: string;
  type?: string;
}

type statusType = 'ok' | 'error';
type currentAuthorityType = 'guest' | 'user_lv1' | 'user_lv2' | 'user_lv3' | 'user_lv4' | string;


// 鉴别登录用户权限
const identityUser = (result: LoginResultType, payload: LoginPayload): StateType => {
  let currentAuthority: currentAuthorityType = 'guest';
  let status: statusType = 'error';
  let errorMessage: string = '';
  const type = payload?.type;
  if (result?.id > 0) {
    status = 'ok'
    currentAuthority = `user_lv${result.identity}`
  } else {
    errorMessage = result + '';
  }

  return {type, status, currentAuthority, errorMessage};
};

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser: CurrentUser;
  shopCount: number;
  projectDetailList: ProjectDetailListItem[];
  users: NotRequired<CurrentChildren>;

  status?: statusType;
  type?: string;
  currentAuthority?: currentAuthorityType;
  errorMessage?: string;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    login: Effect;
    fetchCurrent: Effect;
    saveProjectListItem: Effect;
    queryCurrentUsers: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
    saveCurrentUser: Reducer<CurrentUser>;
    saveShopCount: Reducer<{ shopCount: number }>;
    saveProjectInfo: Reducer<any>;
    deleteProjectItem: Reducer<any>;
    saveUsers: Reducer<NotRequired<CurrentChildren>>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
    shopCount: 0,
    projectDetailList: [],
    users: {
      results: [],
      count: 0
    },
    status: undefined,
  },

  effects: {
    * login({payload}, {call, put}) {
      const response = yield call(fakeAccountLogin, payload);
      const authority = identityUser(response, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: authority,
      });
      // Login successfully
      if (response.id > 0) {
        message.success('登录成功！');
        yield put(routerRedux.replace('/project'));
      }
    },
    * fetchCurrent({_, callback}, {call, put}) {
      const response = yield call(queryCurrent);
      if (response?.id) {
        yield put({
          type: 'saveCurrentUser',
          payload: response,
        });
      } else {
        message.info('当前登录已失效，请重新登录!')
        router.push("/user/login")
      }
      if (callback && typeof callback === 'function') {
        callback(response)
      }
    },
    * queryCurrentUsers({payload}, {call, put}) {
      const response = yield call(queryCurrentUsers, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'saveUsers',
          payload: response,
        });
      }
    },
    * saveProjectListItem({payload}, {put, select}) {
      const projectInfo = payload?.project as ProjectListItem;
      const projectDetailList: ProjectListItem[] = yield select((state: ConnectState) => state.user.projectDetailList);
      const current: ProjectListItem = {...projectInfo};
      ld.remove(projectDetailList, d => d?.id === current?.id);
      projectDetailList.push(current)
      yield put({
        type: 'saveProjectInfo',
        payload: projectDetailList
      });
    },
  },

  reducers: {
    changeLoginStatus(state, {payload}) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        errorMessage: payload.errorMessage,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    saveShopCount(state, action) {
      return {
        ...state,
        shopCount: action.payload || 0,
      }
    },
    saveUsers(state, action) {
      return {
        ...state,
        users: action.payload || [],
      };
    },
    saveProjectInfo(state, action) {
      return {
        ...state,
        projectDetailList: action.payload || [],
      }
    },
    deleteProjectItem(state, action) {
      const list = state.projectDetailList?.filter((d: { id: number; }) => d.id !== action.payload);
      return {
        ...state,
        projectDetailList: list || [],
      }
    }
  },
};

export default UserModel;

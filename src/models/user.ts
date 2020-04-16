import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';
import {message} from 'antd';

import {queryAddress, queryCurrent, queryCurrentUsers} from '@/services/user';
import {CurrentChildren, UserListItem} from "@/models/data";
import {isNormalResponseBody} from "@/utils/utils";
import {AddressInfo} from "@/pages/usermanager/settings/data";
import {ProjectDetailListItem, ProjectListItem} from "@/pages/project/data";
import {ConnectState} from "@/models/connect";
import ld from 'lodash';

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser: CurrentUser;
  addressList: AddressInfo;
  shopCount: number;
  projectDetailList: ProjectDetailListItem[];
  users: NotRequired<CurrentChildren>;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
    fetchAddress: Effect;
    saveProjectListItem: Effect;
    queryCurrentUsers: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<CurrentUser>;
    saveAddressList: Reducer<NotRequired<AddressInfo>>;
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
    addressList: {
      results: [],
      count: 0
    },
    shopCount: 0,
    projectDetailList: [],
    users: {
      results: [],
      count: 0
    },
  },

  effects: {
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
    * fetchAddress({payload}, {call, put}) {
      const response = yield call(queryAddress, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'saveAddressList',
          payload: response,
        });
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
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    saveAddressList(state, action) {
      return {
        ...state,
        addressList: action.payload || {},
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

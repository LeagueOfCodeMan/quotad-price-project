import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';
import {message} from 'antd';

import {queryCurrent} from '@/services/user';
import {UserListItem} from "@/models/data";

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    * fetchCurrent(_, {call, put}) {
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

    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },

  },
};

export default UserModel;

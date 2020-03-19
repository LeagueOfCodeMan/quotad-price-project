import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';

import {queryCurrent} from '@/services/user';
import {UserListItem} from "@/pages/usermanager/userlist/data";

export type NotRequired<T> = {
  [P in keyof T]+?: T[P];
};

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser?: CurrentUser;
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

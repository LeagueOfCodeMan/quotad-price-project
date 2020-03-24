import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';
import {message} from 'antd';

import {queryCurrent, queryLabels} from '@/services/user';
import {UserListItem} from "@/models/data";
import {isNormalResponseBody} from "@/utils/utils";
import {LabelList} from "@/pages/dfdk/label/data";

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser: CurrentUser;
  labelList: LabelList;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
    fetchLabels: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<CurrentUser>;
    saveLabels: Reducer<NotRequired<LabelList>>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
    labelList: {
      results: [],
      count: undefined
    },
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

    * fetchLabels({payload}, {call, put}) {
      const response = yield call(queryLabels, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'saveLabels',
          payload: response,
        });
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
    saveLabels(state, action) {
      return {
        ...state,
        labelList: action.payload || {},
      };
    },

  },
};

export default UserModel;

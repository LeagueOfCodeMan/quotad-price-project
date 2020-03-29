import {Effect} from 'dva';
import {Reducer} from 'redux';
import {router} from 'umi';
import {message} from 'antd';

import {queryAddress, queryCurrent, queryLabels} from '@/services/user';
import {UserListItem} from "@/models/data";
import {isNormalResponseBody} from "@/utils/utils";
import {LabelList} from "@/pages/dfdk/label/data";
import {AddressInfo} from "@/pages/usermanager/settings/data";

export type CurrentUser = NotRequired<UserListItem>;

export interface UserModelState {
  currentUser: CurrentUser;
  labelList: LabelList;
  addressList: AddressInfo;
  shopCount: number;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
    fetchLabels: Effect;
    fetchAddress: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<CurrentUser>;
    saveLabels: Reducer<NotRequired<LabelList>>;
    saveAddressList: Reducer<NotRequired<AddressInfo>>;
    saveShopCount: Reducer<{ shopCount: number }>;
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
    addressList: {
      results: [],
      count: 0
    },
    shopCount: 0,
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
      if(callback && typeof callback === 'function'){
        callback(response)
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

    * fetchAddress({payload}, {call, put}) {
      const response = yield call(queryAddress, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'saveAddressList',
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
    saveAddressList(state, action) {
      return {
        ...state,
        addressList: action.payload || {},
      };
    },
    saveShopCount(state, action) {
      console.log(action);
      return {
        ...state,
        shopCount: action.payload || 0,
      }
    }
  },
};

export default UserModel;

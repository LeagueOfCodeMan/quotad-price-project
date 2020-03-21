import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {queryUsers, queryAreas} from './service';
import {message} from "antd";
import {AreasInfo, UsersInfo} from "@/models/data";


export interface UserListModalState {
  userlist?: NotRequired<UsersInfo>;
  areaList?: NotRequired<AreasInfo>;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: UserListModalState) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: UserListModalState;
  effects: {
    fetch: Effect;
    fetchAreas: Effect;
  };
  reducers: {
    save: Reducer<UserListModalState>;
    saveAreas: Reducer<UserListModalState>;
  };
}

const Model: ModelType = {
  namespace: 'userlist',

  state: {
    userlist: {},
    areaList: {
      results:[]
    },
  },

  effects: {
    * fetch({payload, callback}, {call, put}) {
      const response = yield call(queryUsers, payload);
      if (typeof response === 'string') {
        message.error(response);
      } else if (response?.results) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },

    * fetchAreas(_, {call, put}) {
      const response = yield call(queryAreas);
      if (typeof response === 'string') {
        message.error(response);
      } else if (response?.results) {
        yield put({
          type: 'saveAreas',
          payload: response,
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        userlist: action.payload,
      };
    },
    saveAreas(state, action) {
      return {
        ...state,
        areaList: action.payload,
      }
    }
  },
};

export default Model;

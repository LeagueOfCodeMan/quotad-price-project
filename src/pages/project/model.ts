import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {message} from "antd";
import {UserListModalState} from "../usermanager/userlist/model";
import {ProjectListInfo} from "@/pages/project/data";
import {UsersInfo} from "@/models/data";
import {queryProject} from "@/pages/project/service";
import {isNormalResponseBody} from "@/utils/utils";
import {queryUsers} from "@/services/user";

export interface ProjectStateType {
  userlist?: NotRequired<UsersInfo>;
  projectList: NotRequired<ProjectListInfo>;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ProjectStateType) => T) => T },
) => void;

export interface ProductBaseModelType {
  namespace: string;
  state: ProjectStateType;
  effects: {
    fetch: Effect;
    fetchUsers: Effect;
  };
  reducers: {
    save: Reducer<NotRequired<ProjectListInfo>>;
    saveUsers: Reducer<UserListModalState>;
  };
}

const Model: ProductBaseModelType = {
  namespace: 'project',

  state: {
    userlist: {
      results: [],
      count: 0
    },
    projectList: {
      results: [],
      count: 0
    },
  },

  effects: {
    * fetch({payload}, {call, put}) {
      const response = yield call(queryProject, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    * fetchUsers({payload, callback}, {call, put}) {
      const response = yield call(queryUsers, payload);
      if (typeof response === 'string') {
        message.error(response);
      } else if (response?.results) {
        yield put({
          type: 'saveUsers',
          payload: response,
        });
      }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        projectList: action.payload,
      };
    },
    saveUsers(state, action) {
      return {
        ...state,
        userlist: action.payload,
      };
    },
  },
};

export default Model;

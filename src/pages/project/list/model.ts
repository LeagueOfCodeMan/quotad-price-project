import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {isNormalResponseBody} from "@/utils/utils";
import {queryProject} from "@/pages/project/list/service";
import {ProjectListInfo} from "@/pages/project/list/data";

export interface ProjectStateType {
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
  };
  reducers: {
    save: Reducer<NotRequired<ProjectStateType>>;
  };
}

const Model: ProductBaseModelType = {
  namespace: 'project',

  state: {
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
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        projectList: action.payload,
      };
    },
  },
};

export default Model;

import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {ProductConfigList} from "@/pages/dfdk/product/product-config/data";
import {queryConfInfo, countStatistics} from "./service";
import {isNormalResponseBody} from "@/utils/utils";
import {CountStatistics} from "@/pages/dfdk/product/product-base/model";

export interface ProductConfigStateType {
  configList: NotRequired<ProductConfigList>;
  countStatistics: NotRequired<CountStatistics>;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ProductConfigStateType) => T) => T },
) => void;

export interface ProductConfigModelType {
  namespace: string;
  state: ProductConfigStateType;
  effects: {
    fetch: Effect;
    countStatistics: Effect;
  };
  reducers: {
    save: Reducer<NotRequired<ProductConfigList>>;
    saveCountStatistics: Reducer<NotRequired<CountStatistics>>;
  };
}

const Model: ProductConfigModelType = {
  namespace: 'productConfig',

  state: {
    configList: {
      results: [],
      count: undefined
    },
    countStatistics: {
      total_count: 0,
      published_count: 0,
      unpublished: 0,
    },
  },

  effects: {
    * fetch({payload}, {call, put}) {
      const response = yield call(queryConfInfo, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    * countStatistics(_, {call, put}) {
      const response = yield call(countStatistics);
      if (response?.total_count) {
        yield put({
          type: 'saveCountStatistics',
          payload: response,
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        configList: action.payload,
      };
    },
    saveCountStatistics(state, action) {
      return {
        ...state,
        countStatistics: action.payload,
      };
    },
  },
};

export default Model;

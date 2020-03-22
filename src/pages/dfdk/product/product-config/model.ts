import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {ProductConfigList} from "@/pages/dfdk/product/product-config/data";
import {queryConfInfo} from "@/pages/dfdk/product/product-config/service";
import {isNormalResponseBody} from "@/utils/utils";

export interface ProductConfigStateType {
  configList: NotRequired<ProductConfigList>;
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
  };
  reducers: {
    save: Reducer<ProductConfigStateType>;
  };
}

const Model: ProductConfigModelType = {
  namespace: 'productConfig',

  state: {
    configList: {
      results: [],
      count: undefined
    }
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
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        configList: action.payload,
      };
    },
  },
};

export default Model;

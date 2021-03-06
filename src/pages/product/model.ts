import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {ProductBaseList} from "@/pages/product/data";
import {countStatistics, queryProduct} from "@/pages/product/service";
import {isNormalResponseBody} from "@/utils/utils";

export interface ProductBaseStateType {
  productList: NotRequired<ProductBaseList>;
  countStatistics: any;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ProductBaseStateType) => T) => T },
) => void;

export interface ProductBaseModelType {
  namespace: string;
  state: ProductBaseStateType;
  effects: {
    fetch: Effect;
    countStatistics: Effect;
  };
  reducers: {
    save: Reducer<NotRequired<ProductBaseList>>;
    saveCountStatistics: Reducer<any>;
  };
}

const Model: ProductBaseModelType = {
  namespace: 'productBase',

  state: {
    productList: {
      results: [],
      count: undefined
    },
    countStatistics: {},
  },

  effects: {
    * fetch({payload}, {call, put}) {
      const response = yield call(queryProduct, payload);
      if (isNormalResponseBody(response)) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    * countStatistics(_, {call, put}) {
      const response = yield call(countStatistics);
      if (response?.['1']) {
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
        productList: action.payload,
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

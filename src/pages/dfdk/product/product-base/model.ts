import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {isNormalResponseBody} from "@/utils/utils";
import {countStatistics, queryProduct} from "@/pages/dfdk/product/product-base/service";
import {ProductBaseList} from "@/pages/dfdk/product/product-base/data";

export interface ProductBaseStateType {
  productList: NotRequired<ProductBaseList>;
  countStatistics: NotRequired<CountStatistics>;
}

export interface CountStatistics {
  total_count: number;
  published_count: number;
  unpublished: number;
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
    saveCountStatistics: Reducer<NotRequired<CountStatistics>>;
  };
}

const Model: ProductBaseModelType = {
  namespace: 'productBase',

  state: {
    productList: {
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

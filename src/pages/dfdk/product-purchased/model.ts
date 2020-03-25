import {AnyAction, Reducer} from 'redux';
import {EffectsCommandMap} from 'dva';
import {isNormalResponseBody} from "@/utils/utils";
import {ProductBaseList} from "@/pages/dfdk/product/product-base/data";
import {countStatistics, queryProductAndConfig} from "@/pages/dfdk/product-purchased/service";
import {ProductDetailInfo} from "@/pages/dfdk/product-purchased/data";

export interface ProductStateType {
  countStatistics: NotRequired<CountStatistics>;
  productData: ProductDetailInfo;
}

export interface CountStatistics {
  total_count: number;
  published_count: number;
  unpublished: number;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ProductStateType) => T) => T },
) => void;

export interface ProductModelType {
  namespace: string;
  state: ProductStateType;
  effects: {
    fetch: Effect;
    countStatistics: Effect;
  };
  reducers: {
    save: Reducer<NotRequired<ProductBaseList>>;
    saveCountStatistics: Reducer<NotRequired<CountStatistics>>;
  };
}

const Model: ProductModelType = {
  namespace: 'product',

  state: {
    productData: {
      results: [],
      count: 0,
    },
    countStatistics: {
      total_count: 0,
      published_count: 0,
      unpublished: 0,
    },
  },

  effects: {
    * fetch({payload}, {call, put}) {
      const response = yield call(queryProductAndConfig, payload);
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
        productData: action.payload,
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

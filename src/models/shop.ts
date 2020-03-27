import {Reducer} from 'redux';
import {ShoppingCartItem} from "@/models/data";
import {Effect} from "dva";
import ld from 'lodash';

export interface ShopModelState {
  cartList: ShoppingCartItem[];
}

export interface ShopModelType {
  namespace: 'shop';
  state: ShopModelState;
  effects: {
    fetchShoppingCart: Effect;
  };
  reducers: {
    saveCartItem: Reducer<ShopModelState>;
    saveCart: Reducer<ShopModelState>;
    clearCart: Reducer<ShopModelState>;
  };
}

const ShopModel: ShopModelType = {
  namespace: 'shop',

  state: {
    cartList: []
  },

  effects: {
    * fetchShoppingCart(_, {put}) {
      const result = getShoppingCart();
      console.log(result,'dispatch')
      if (ld.head(result)) {
        yield put({
          type: 'saveCart',
          payload: result
        })
      }
    },
  },

  reducers: {
    saveCartItem(state, {payload}): ShopModelState {
      const list = state?.cartList || [];
      setShoppingCart([...list, payload]);
      return {
        ...state,
        cartList: [...list, payload]
      };
    },
    saveCart(state, action): ShopModelState {
      return {
        ...state,
        cartList: action.payload || [],
      };
    },
    clearCart(): ShopModelState {
      clearShoppingCart();
      return {
        cartList: []
      }
    }

  },

};

export default ShopModel;

export function getShoppingCart(): ShoppingCartItem[] {
  let result = localStorage.getItem('antd-pro-shopping-cart');
  try {
    if (result) {
      result = JSON.parse(result);
      if (Array.isArray(result)) {
        return result;
      } else {
        clearShoppingCart();
      }
    }
  } catch (e) {
    return [];
  }
  return [];
}

export function setShoppingCart(cartList: ShoppingCartItem[]): void {
  if (Array.isArray(cartList)) {
    localStorage.setItem('antd-pro-shopping-cart', JSON.stringify(cartList));
  }
}

export function clearShoppingCart(): void {
  localStorage.removeItem('antd-pro-shopping-cart');
}

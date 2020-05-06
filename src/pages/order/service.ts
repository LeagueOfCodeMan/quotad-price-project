import request from '../../utils/request';
import {OrderListItem} from "./data";


interface ParamsType extends Partial<OrderListItem> {
  pageSize?: number;
  current?: number;
}

export interface CreateProjectParams {
  project_name: string;
  project_desc: string;
  product_list?: ProductList;
  user_name?: string;
  user_iphone?: string;
  user_contact?: string;
  user_desc?: string;
}

export type ProductList = {
  production: number; count: number;
  conf_par: { id: number; count: number; }[]
}[];

export async function queryOrder(params: ParamsType) {
  return request('/api/order', {
    params,
  });
}

// oper_code 1 同意  2 拒绝 3 完成
export async function changeOrderStatus(params: { id: number; data: { oper_code: number } }) {
  return request('/api/order/' + params?.id + '/oper_order', {
    method: 'POST',
    data: params.data,
  });
}

// 编辑每个产品的SN码
export async function modifyProductSN(params: { id: number; data: { id: number; sn: string; } }) {
  return request('/api/order/' + params?.id + '/modify_sn', {
    method: 'POST',
    data: params.data,
  });
}
// 编辑订单成交总价
export async function modifyTotalPrice(params: { id: number; data: { order_leader_price: number; } }) {
  return request('/api/order/' + params?.id + '/modify_price', {
    method: 'POST',
    data: params.data,
  });
}

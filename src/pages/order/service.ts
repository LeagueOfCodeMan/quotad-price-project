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


export async function createProject(params: CreateProjectParams) {
  return request('/api/project', {
    method: 'POST',
    data: params,
  });
}

// oper_code 1 同意  2 拒绝 3 完成
export async function changeOrderStatus(params: { id: number; data: { oper_code: number } }) {
  return request('/api/order/' + params?.id + '/oper_order', {
    method: 'POST',
    data: params.data,
  });
}

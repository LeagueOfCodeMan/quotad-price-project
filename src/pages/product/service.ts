import request from '../../utils/request';
import {ProductBaseListItem} from './data';


interface ParamsType extends Partial<ProductBaseListItem> {
  pageSize?: number;
  current?: number;

}

export async function queryProduct(params: ParamsType) {
  return request('/api/product', {
    params,
  });
}


export async function deleteProduct(params?: { id: number }) {
  return request('/api/product/' + params?.id, {
    method: 'DELETE',
  });
}

export async function addProduct(params: ProductBaseListItem) {
  return request('/api/product', {
    method: 'POST',
    body: params,
  });
}

export async function updateProduct(params: { id: number, data: ParamsType }) {
  return request('/api/product/' + params.id+'/conf_list', {
    method: 'POST',
    data: params.data,
  });
}

export async function modifyProductSecondPrice(params: {
  id: number,
  data: { second_price: string | number, user_list?: number[]; }
}) {
  return request('/api/product/' + params.id + '/mod_second_price', {
    method: 'POST',
    data: params.data,
  });
}

export async function modifyProductMemberPrice(params: {
  id: number,
  data: { member_price: string | number }
}) {
  return request('/api/product/' + params.id + '/mod_mem_price', {
    method: 'POST',
    data: params.data,
  });
}

export async function countStatistics() {
  return request('/api/product/count_statistics');
}

// 获取当前产品的二级组员价格
export async function queryUsersByProduct(params: { id: number }) {
  return request('/api/product/' + params.id + '/second_user_list'
  );
}

// 获取配件、服务所属
export async function queryProductList(params: ParamsType) {
  return request('/api/product/' + params.id + '/get_product_list');
}

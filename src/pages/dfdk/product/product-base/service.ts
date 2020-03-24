import request from '@/utils/request';
import {ProductBaseListItem} from './data.d';


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
  return request('/api/product/' + params.id, {
    method: 'PUT',
    data: params.data,
  });
}

export async function ModifyProductMemberPrice(params: { id: number, data: ParamsType }) {
  return request('/api/product/' + params.id + '/mod_mem_price', {
    method: 'POST',
    data: params.data,
  });
}

export async function countStatistics() {
  return request('/api/product/count_statistics');
}

export async function queryConfigListByProductId(params: { id: number }) {
  return request('/api/product/' + params.id + '/conf_list'
  );
}

export async function updateConfigListByProductId(params: { id: number, data: ParamsType }) {
  return request('/api/product/' + params.id + '/conf_list', {
    method: 'PUT',
    data: params.data,
  });
}

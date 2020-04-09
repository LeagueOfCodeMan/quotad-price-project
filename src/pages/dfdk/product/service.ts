import request from '../../../utils/request';
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
  return request('/api/product/' + params.id, {
    method: 'PUT',
    data: params.data,
  });
}

export async function modifyProductMemberPrice(params: { id: number, data: ParamsType }) {
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

export async function updateConfigListByProductId(params: { id: number, data: { conf_list: { conf: number; is_required: boolean; }[] } }) {
  return request('/api/product/' + params.id + '/conf_list', {
    method: 'POST',
    data: params.data,
  });
}

// 获取标准库
export async function queryStandardProduct(params: ParamsType) {
  return request('/api/product/product_config', {
    params,
  });
}

export async function deleteStandardProduct(params?: { id: number }) {
  return request('/api/product/product_config/' + params?.id, {
    method: 'DELETE',
  });
}

// 获取当前产品的二级组员价格
export async function queryUsersByProduct(params: { id: number }) {
  return request('/api/product/' + params.id + '/second_user_list'
  );
}

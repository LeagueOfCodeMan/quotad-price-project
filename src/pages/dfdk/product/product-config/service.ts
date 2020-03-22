import request from '@/utils/request';
import {ProductConfigListItem} from './data.d';

export interface TableListParams {
  sorter?: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
}

interface ParamsType extends Partial<ProductConfigListItem>, TableListParams {

}

export async function queryConfInfo(params: ParamsType) {
  return request('/api/conf_info', {
    params,
  });
}


export async function deleteConfInfo(params?: { id: number }) {
  return request('/api/conf_info/' + params?.id, {
    method: 'DELETE',
  });
}

export async function addConfInfo(params: ProductConfigListItem) {
  return request('/api/conf_info', {
    method: 'POST',
    body: params,
  });
}

export async function updateConfInfo(params: { id: number, data: ParamsType }) {
  return request('/api/conf_info/' + params.id, {
    method: 'PUT',
    data: params.data,
  });
}

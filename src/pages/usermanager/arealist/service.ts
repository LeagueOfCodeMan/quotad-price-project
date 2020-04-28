import request from '../../../utils/request';

import {AreaListItem, TableListParams} from "@/models/data";


export async function queryAreas(params?: TableListParams): Promise<any> {
  return request('/api/area', {params});
}

export async function createArea(params: AreaListItem): Promise<any> {
  return request('/api/area', {
    method: 'POST',
    data: params,
  });
}

export async function updateArea(params?: { id: number, data: AreaListItem }) {
  return request('/api/area/' + params?.id, {
    method: 'PUT',
    data: params?.data,
  });
}

export async function deleteArea(params?: { id: number }) {
  return request('/api/area/' + params?.id, {
    method: 'DELETE',
  });
}






import request from '../../../utils/request';

import {LabelListItem} from "@/pages/dfdk/label/data";

interface ParamsType extends Partial<LabelListItem> {
  pageSize?: number;
  current?: number;
}

export async function createLabel(params: LabelListItem): Promise<any> {
  return request('/api/label', {
    method: 'POST',
    data: params,
  });
}

export async function queryLabels(params?: ParamsType) {
  return request('/api/label', {
    params,
  });
}


export async function updateLabel(params?: { id: number, data: LabelListItem }) {
  return request('/api/label/' + params?.id, {
    method: 'PUT',
    data: params?.data,
  });
}

export async function deleteLabel(params?: { id: number }) {
  return request('/api/label/' + params?.id, {
    method: 'DELETE',
  });
}




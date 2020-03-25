import request from '../../../utils/request';

import {UpdateUser} from './data';
import {TableListParams, UserListItem} from "@/models/data";

export async function createUser(params: UserListItem): Promise<any> {
  return request('/api/user', {
    method: 'POST',
    data: params,
  }, {noticeUndefined: false,});
}

export async function queryCurrent(): Promise<any> {
  return request('/api/user/current_user');
}

export async function queryUsers(params?: TableListParams) {
  return request('/api/user', {
    params,
  });
}

export async function queryAreas(params?: TableListParams): Promise<any> {
  return request('/api/area', {
    params
  });
}

export async function updateUser(params?: { id: number, data: UpdateUser }) {
  return request('/api/user/' + params?.id, {
    method: 'PUT',
    data: params?.data,
  });
}

export async function deleteUser(params?: { id: number }) {
  return request('/api/user/' + params?.id, {
    method: 'DELETE',
  });
}




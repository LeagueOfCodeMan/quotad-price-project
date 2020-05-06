import request from '../../../utils/request';

import {TableListParams, UserListItem} from "@/models/data";
import {CreateUser} from "@/pages/usermanager/userlist/data";

export async function createUser(params: UserListItem): Promise<any> {
  return request('/api/user', {
    method: 'POST',
    data: params,
  }, {noticeUndefined: false,});
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

export async function updateUser(params?: { id: number, data: CreateUser }) {
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




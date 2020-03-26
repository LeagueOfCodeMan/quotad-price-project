import request from '@/utils/request';
import {UpdateUser} from "@/pages/usermanager/userlist/data";
import {UpdatePasswordValues} from "@/components/UpdatePassword";
import {AddressListItem} from "@/pages/usermanager/settings/data";

export async function updateUser(params?: { id: number, data: UpdateUser }) {
  return request('/api/user/' + params?.id, {
    method: 'PUT',
    data: params?.data,
  });
}

export async function modifyPassword(params?: { id: number, data: UpdatePasswordValues }) {
  return request('/api/user/' + params?.id + '/modify_pwd', {
    method: 'POST',
    data: params?.data,
  });
}

export async function createAddress(params: AddressListItem): Promise<any> {
  return request('/api/addr', {
    method: 'POST',
    data: params,
  });
}

export async function updateAddress(params?: { id: number, data: AddressListItem }) {
  return request('/api/addr/' + params?.id, {
    method: 'PUT',
    data: params?.data,
  });
}

export async function deleteAddress(params?: { id: number }) {
  return request('/api/addr/' + params?.id, {
    method: 'DELETE',
  });
}

import request from '@/utils/request';
import {UpdateUser} from "@/pages/usermanager/userlist/data";
import {UpdatePasswordValues} from "@/components/UpdatePassword";

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

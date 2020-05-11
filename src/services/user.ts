import request from '@/utils/request';
import {TableListParams} from "@/models/data";

export async function queryUsers(params?: TableListParams) {
  return request('/api/user', {
    params,
  });
}

export async function queryCurrent(): Promise<any> {
  return request('/api/user/current_user');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

export async function testPassword(params: { password: string; }): Promise<any> {
  return request('/api/user/test_password', {
    method: 'POST',
    data: params
  });
}

/**
 * 获取当前用户的组员信息
 */
export async function queryCurrentUsers() {
  return request('/api/user/user_detail_list');
}

/**
 * 获取邮箱验证码
 * @param params
 */
export async function fetchEmailCode(params: { username: string;email:string; }): Promise<any> {
  return request('/api/user/send_email', {
    method: 'POST',
    data: params
  });
}

export async function resetPasssword(params: { username: string;password:string;code:number; }): Promise<any> {
  return request('/api/user/reset_password', {
    method: 'POST',
    data: params
  });
}

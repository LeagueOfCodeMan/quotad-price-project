import request from '@/utils/request';
import {TableListParams} from "@/models/data";
import {CreateProjectParams} from "@/components/ShoppingCart";

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

export async function queryLabels(params: { label_type: 1 | 2 | undefined, pageSize: number }) {
  return request('/api/label', {params});
}

/**
 * 地址管理
 */
export async function queryAddress(params?: TableListParams): Promise<any> {
  return request('/api/addr', {params});
}


/**
 * 创建项目
 */
export async function createProject(params: CreateProjectParams): Promise<any> {
  return request('/api/project', {
    method: 'POST',
    data: params
  });
}

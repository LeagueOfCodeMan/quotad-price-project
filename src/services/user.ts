import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/user');
}

export async function queryCurrent(): Promise<any> {
  return request('/api/user/current_user');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

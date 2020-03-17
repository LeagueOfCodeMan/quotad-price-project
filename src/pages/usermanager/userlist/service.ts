import request from '@/utils/request';
import {TableListParams} from "@/pages/list/table-list/data";
// import { TableListParams } from './data.d';

export async function query(): Promise<any> {
  return request('/api/user');
}

export async function queryCurrent(): Promise<any> {
  return request('/api/user/current_user');
}

export async function queryRule(params?: TableListParams) {
  return request('/api/user', {
    params,
  });
}

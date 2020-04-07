import request from '@/utils/request';
import {TableListParams} from "@/models/data";
import {CreateProjectParams, ProductListType} from "@/components/ShoppingCart";

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
 * 地址管理
 */
export async function queryAddress(params?: TableListParams): Promise<any> {
  return request('/api/addr', {params});
}

/**
 * 查询个人项目
 * @param params
 */
export async function queryMyProject() {
  return request('/api/project/my_project');
}
/**
 * 创建项目
 */
export async function createProject(params: NotRequired<CreateProjectParams>): Promise<any> {
  return request('/api/project', {
    method: 'POST',
    data: params
  });
}

/**
 * 修改项目  type 1增加 type 2编辑删除
 */
export async function updateProject(params: { id: number; product_list: ProductListType; type: 1 | 2 }): Promise<any> {
  return request('/api/project/' + params.id + '/mod_porduct_list', {
    method: 'POST',
    data: {
      product_list: params.product_list,
      product_type: params.type
    }
  });
}

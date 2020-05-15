import request from '../../utils/request';
import {ProjectListItem} from './data';
import {CreateOrderParams} from '@/pages/project/components/CreateOrder';


interface ParamsType extends Partial<ProjectListItem> {
  pageSize?: number;
  current?: number;
}

export interface CreateProjectParams {
  project_name: string;
  project_desc: string;
  product_list?: ProductList;
  user_name?: string;
  user_iphone?: string;
  user_contact?: string;
  user_desc?: string;
}

export type ProductList = {
  production: number; count: number;
  conf_par: { id: number; count: number; }[]
}[];

export async function queryProject(params: ParamsType) {
  return request('/api/project', {
    params,
  });
}

export async function createProject(params: CreateProjectParams) {
  return request('/api/project', {
    method: 'POST',
    data: params,
  });
}

export async function modifyProductList(params:
                                          {
                                            id: number;
                                            data: {
                                              product_list?: ProductList;
                                              other_list?: { name: string; price: string; count: number; }[]
                                            }
                                          }) {
  return request('/api/project/' + params.id + '/mod_porduct_list', {
    method: 'POST',
    data: params.data,
  });
}

export async function modifyProject(params: { id: number; data: CreateProjectParams }) {
  return request('/api/project/' + params.id, {
    method: 'PUT',
    data: params.data,
  });
}

export async function terminateProject(params: { id: number; }) {
  return request('/api/project/' + params.id + '/stop_project', {
    method: 'GET',
  });
}

export async function createOrder(params: { id: number; data: CreateOrderParams }) {
  return request('/api/project/' + params.id + '/place_order', {
    method: 'POST',
    data: params.data,
  });
}

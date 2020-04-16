import request from '../../utils/request';
import {ProjectListItem, ProjectProductionInfoItem} from "@/pages/project/data";
import {ProductBaseListItem} from "@/pages/dfdk/product/data";


interface ParamsType extends Partial<ProjectListItem> {
  pageSize?: number;
  current?: number;
}

interface ProjectDetailParams extends Partial<ProductBaseListItem> {
  pageSize?: number;
  current?: number;
}

export interface CreateProjectParams {
  project_name: string;
  project_company: string;
  project_addr: number;
  delivery_time: string;
  product_list: ProductList;
}

export type ProductList = {
  production: number; count: number;
  conf_par: { id: number; count: number; }
}[];

export async function queryProject(params: ParamsType) {
  return request('/api/project', {
    params,
  });
}

export async function queryProjectOneDetail(params: {
  id: number; params: ProjectDetailParams
}) {
  return request('/api/project/' + params.id, {
      params: params?.params,
    }
  );
}

export async function createProject(params: CreateProjectParams) {
  return request('/api/project', {
    method: 'POST',
    data: params,
  });
}

export async function modifyProductList(params: { id: number; data: { product_list: ProductList; product_type: number; } }) {
  return request('/api/project/' + params.id + '/mod_porduct_list', {
    method: 'POST',
    data: params.data,
  });
}

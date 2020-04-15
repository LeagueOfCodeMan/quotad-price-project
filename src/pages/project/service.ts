import request from '../../utils/request';
import {ProjectListItem} from "@/pages/project/data";
import {ProductBaseListItem} from "@/pages/dfdk/product/data";


interface ParamsType extends Partial<ProjectListItem> {
  pageSize?: number;
  current?: number;
}

export interface CreateProjectParams {
  project_name: string;
  project_company: string;
  project_addr: number;
  delivery_time: string;
  product_list: {
    production: number; count: number;
    conf_par: { id: number; count: number; }
  }[];
}

export async function queryProject(params: ParamsType) {
  return request('/api/project', {
    params,
  });
}

export async function queryProjectOneDetail(params: { id: number }) {
  return request('/api/project/' + params.id
  );
}

export async function createProject(params: CreateProjectParams) {
  console.log(params);
  return request('/api/project', {
    method: 'POST',
    data: params,
  });
}

import request from '@/utils/request';
import {ProjectListItem} from "@/pages/project/list/data";


interface ParamsType extends Partial<ProjectListItem> {
  pageSize?: number;
  current?: number;
}

export async function queryProject(params: ParamsType) {
  return request('/api/project', {
    params,
  });
}

export async function queryProjectOneDetail(params: { id: number }) {
  return request('/api/product/' + params.id
  );
}

import request from '@/utils/request';
import {ProductDetailListItem} from './data.d';


interface ParamsType extends Partial<ProductDetailListItem> {
  pageSize?: number;
  current?: number;
}

// 获取所有产品带配置信息
export async function queryProductAndConfig(params:ParamsType) {
  return request('/api/product/product_config',{params}
  );
}


export async function countStatistics() {
  return request('/api/product/count_statistics');
}


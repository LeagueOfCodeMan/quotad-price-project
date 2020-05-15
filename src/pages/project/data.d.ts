import {ProductBaseListItem} from '@/pages/product/data';
import {IdentityType} from '@/utils/utils';

export interface ProjectListItem {
  id: number;
  username: string;
  project_id: string;
  real_name: string; // 填报人
  identity: IdentityType;
  user_name: string; // 用户单位
  user_addr: string;
  user_iphone: string;
  user_contact: string;
  other_list: { name: string; price: string; count: number }[];

  create_time: string;
  project_name: string;
  project_desc: string;
  // 采购价格
  leader_total_quota: string | null;
  sell_total_quota: string | null;
  // 报价
  leader_total_price: string | null;
  sell_total_price: string | null;
  // 1进行中，2终止，3审核中，4交付中，5 已完成
  pro_status: 1 | 2 | 3 | 4 | 5;
  product_list: ProjectProductionInfoItem[];

  [propName: string]: any;
}

export interface ProjectListInfo {
  count: number;
  results: ProjectListItem[] | [];
}

export type ProjectProductionInfoItem = {
  id: number;
  create_time: string;
  production: ProductBaseListItem;
  count: number;
  leader_quota?: string;
  sell_quota?: string;
  leader_price?: string;
  sell_price?: string;
  user: number;
  uuid?: string;
  identity:IdentityType;
  conf_par: ProductBaseListItem[];
  children?: ProductBaseListItem[];
  conf_list?: ProductBaseListItem[];
  sn?: string;
  price?: number;
};

export type ProjectProductionInfo = ProjectProductionInfoItem[];

export interface ProjectDetailListItem extends ProjectListItem {
  product: ProjectProductionInfo;

  [propName: string]: any;
}

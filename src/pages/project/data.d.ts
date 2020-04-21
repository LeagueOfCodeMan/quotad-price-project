import {ProductBaseListItem} from "@/pages/product/data";

export interface ProjectListItem {
  id: number;
  username: string;

  user_name:string; // 用户单位
  user_addr:string;
  user_iphone:string;
  user_contact:string;

  create_time: string;
  project_name: string;
  project_desc: string;
  // 采购价格
  leader_total_quota: string | null;
  sell_total_quota: string | null;
  // 报价
  leader_total_price: string | null;
  sell_total_price: string | null;
  pro_status: 1 | 2 | 3; // 1未下单，2已下单，3已完成

  [propName: string]: any;
}

export interface ProjectListInfo {
  count: number;
  results: ProjectListItem[] | [];
}

export type ProjectProductionInfoItem = {
  id:number;
  create_time: string;
  production: ProductBaseListItem;
  count: number;
  leader_quota?: string;
  member_quota?: string;
  second_quota?: string;
  leader_price?: string;
  member_price?: string;
  second_price?: string;
  user: number;
  conf_par: ProductBaseListItem[];
};

export type ProjectProductionInfo = ProjectProductionInfoItem[];

export interface ProjectDetailListItem extends ProjectListItem {
  product: ProjectProductionInfo;

  [propName: string]: any;
}

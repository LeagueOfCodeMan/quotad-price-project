import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {ProductBaseListItem} from "@/pages/dfdk/product/product-config/data";

export interface ProjectListItem {
  id: number;
  username: string;
  create_time: string;
  project_name: string;
  project_company: string;
  project_addr: {
    id: number;
    recipients: string;
    addr: string;
    tel: string;
    [propName: string]: any;
  }
  delivery_time: string;
  // 采购价格
  leader_total_quota: string | null;
  second_total_quota: string | null;
  member_total_quota: string | null;
  // 报价
  leader_total_price: string | null;
  second_total_price: string | null;
  member_total_price: string | null;
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

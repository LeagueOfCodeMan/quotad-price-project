import {ProjectListItem} from "@/pages/project/data";

export interface OrderListItem {
  id: number;
  username: string;
  area: string;
  create_user: string;
  order_user: string;
  leader_company: string;
  project_name: string;
  project_desc:string;

  company?: string;
  addr?: string;
  contact?: string;
  phone?: string;
  bill_id?: string;
  bill_addr?: string;
  bill_phone?: string;
  bill_bank?: string;
  bill_account?: string;
  contract_addr?: string;
  contract_contact?: string;
  contract_phone?: string;
  // 1 进行中 2 已终止 3 已完成
  order_status?: 1 | 2 | 3;

  order_leader_price: string;
  order_leader_quota: string;

  project: ProjectListItem[];

  [propName: string]: any;
}

export interface OrderListInfo {
  count: number;
  results: OrderListItem[];
}


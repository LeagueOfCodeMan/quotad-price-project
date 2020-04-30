import {ProjectListItem} from "@/pages/project/data";

export interface OrderListItem {
  id: number;
  area: string;
  create_user: string;
  order_user: string;
  order_number: string; // 项目编号
  project_name: string;
  project_desc: string;
  create_time: string;
  label: 1 | 2; // 1 订单 2 合同
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
  // 1 待确认 2  已确认 3 已终止 4 已完成
  order_status?: 1 | 2 | 3 | 4;

  order_leader_price: string;
  order_leader_quota: string;

  project: ProjectListItem[];
  other_list: OtherListItem[];

  [propName: string]: any;
}

export type OtherListItem = { id: number; pro_type: string; price: string; count: number; };

export interface OrderListInfo {
  count: number;
  results: OrderListItem[];
}


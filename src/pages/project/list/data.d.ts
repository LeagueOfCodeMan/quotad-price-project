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
  leader_tatal_quota: string | null;
  second_tatal_quota: string | null;
  member_tatal_quota: string | null;
  // 报价
  leader_tatal_price: string | null;
  second_tatal_price: string | null;
  member_tatal_price: string | null;
  pro_status: 1 | 2 | 3; // 1未下单，2已下单，3已完成

  [propName: string]: any;
}

export interface ProjectListInfo {
  count: number;
  results: ProjectListItem[] | [];
}

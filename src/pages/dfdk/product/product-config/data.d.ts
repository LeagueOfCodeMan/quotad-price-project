export interface ProductConfigListItem {
  id: number;
  avatar: any; // 配置图
  conf_code: number; // 配置表示
  conf_name: string; // 配置名称
  con_desc: string; // 描述参数
  leader_price: string; // 组长价格
  second_price: string; // 二级组员价格
  member_price: string | null; // 一级组员价格 由组长定义，定义后再发布
  mem_state: 1 | 2; // 1：未发布，2：已发布
  conf_status: true; // 是否上架
  conf_mark: string; // 备注

  [propName: string]: any;
}

export interface ProductConfigList {
  count: number;
  results: ProductConfigListItem[];
}


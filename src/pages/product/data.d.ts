export interface ProductBaseListItem {
  id: number;
  avatar: any; // 图
  name:string; // 产品名
  pro_type: string; // 产品型号
  mark: string; // 备注
  desc: string; // 描述参数
  leader_price: string; // 组长价格
  second_price: string; // 二级组员价格
  member_price: string | null; // 一级组员价格 由组长定义，定义后再发布
  sell_price?: string | null; // 一级组员价格 由组长定义，定义后再发布
  genre: number; // 类型
  count?: number;
  conf_list?: ProductBaseListItem[];
  conf_par: ProductBaseListItem[];
  is_required?: boolean | 0;
  uuid?: string;
  price?:number;

  [propName: string]: any;
}

export interface ProductBaseList {
  count: number;
  results: ProductBaseListItem[];
}


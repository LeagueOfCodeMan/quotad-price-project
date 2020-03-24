import {LabelType} from "@/utils/utils";

export interface ProductBaseListItem {
  id: number;
  avatar: any; // 图
  pro_type: string; // 产品名称
  mark: string; // 备注
  desc: string; // 描述参数
  leader_price: string; // 组长价格
  second_price: string; // 二级组员价格
  member_price: string | null; // 一级组员价格 由组长定义，定义后再发布
  mem_state: 1 | 2; // 1：未发布，2：已发布
  label_id: number;
  label_name: string;

  [propName: string]: any;
}

export interface ProductBaseList {
  count: number;
  results: ProductBaseListItem[];
}


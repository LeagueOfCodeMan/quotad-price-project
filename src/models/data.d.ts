import {NotRequired} from "@/models/user";
import {AreaListItem, UserListItem} from "@/pages/usermanager/userlist/data";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import {IdentityType} from "@/utils/utils";

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListParams {
  sorter?: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
}


export type UsersInfo = {
  results: NotRequired<UserListItem[]>;
  count?: number;
  [propNmae: string]: any;
};

export interface UserListItem {
  key: number;
  id: number;
  identity: IdentityType;
  username: string;
  is_superuser: boolean;
  data_joined: Date;
  last_login: Date;
  real_name: string;
  company: string;
  addr: string;
  duty: string;
  email: string;
  tel: string;
  area: null | string;
  avatar: string;
  parent?: {
    id: number;
    tel: string;
    email: string;
    real_name: string;
    company: string;
    addr: string;
    duty: string;
  }

  [propNmae: string]: any;
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListParams {
  sorter?: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
}

export interface AreaListItem {
  id?: number;
  area_name: string;
};

export type AreasInfo = {
  results: NotRequired<AreaListItem[]>;
  count?: number;
  [propNmae: string]: any;
}

export interface ShoppingCartItem {
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
  loading?: boolean;
  count?: number;
  uuid?: string;

  conf_list: ProductConfigListItem[] | [];
  total_price: string;

  [propName: string]: any;

}

export type LocalStorageShopType = { user: string; shop: ShoppingCartItem[] }[];


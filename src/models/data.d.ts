import {NotRequired} from "@/models/user";
import {AreaListItem, UserListItem} from "@/pages/usermanager/userlist/data";
import {ProductDetailListItem} from "@/pages/dfdk/product-purchased/data";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";

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
  product: ProductDetailListItem[];
  count: number;
  conf_list: ProductConfigListItem[] | [];
  total_price: string;
}

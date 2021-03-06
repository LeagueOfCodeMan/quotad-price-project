import {NotRequired} from '@/models/user';
import {AreaListItem, UserListItem} from '@/pages/usermanager/userlist/data';
import {ProductBaseListItem} from '@/pages/product/product-config/data';
import {IdentityType} from '@/utils/utils';

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
  uid: string;
  pid:number;
  key: number;
  id: number;
  identity: IdentityType;
  username: string;
  code: string;
  is_superuser: boolean;
  data_joined: Date;
  last_login: Date;
  real_name: string;
  company: string;
  addr: string;
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
  state: 1 | 2; // 1正常 2 冻结

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
  id: number;
  company?: string;
  addr: string;
  code: string;
  area_name: string;
  bill_id?: string;
  bill_addr?: string;
  bill_phone?: string;
  bill_bank?: string;
  bill_account?: string;

  [propNmae: string]: any;
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

  conf_list: ProductBaseListItem[] | [];
  total_price: string;

  [propName: string]: any;

}

export type LocalStorageShopType = { user: string; shop: ShoppingCartItem[] }[];


export interface CurrentChild {
  id: number;
  username: string;
  real_name: string;
  key?: number;
  project_list: { key?: number; id: number; project_name: string; }[];
}

export interface CurrentChildren {
  count: number;
  results: {
    area: string;
    key?: number;
    users: {
      id: number;
      key?: number;
      username: string;
      real_name: string;
      project_list: { key?: number; id: number; project_name: string; }[];
      one_level: CurrentChild[];
      two_level: CurrentChild[];
    }[]
  }[];
}

export type CurrentChildrenResults = {
  area: string;
  key?: number;
  users: {
    id: number;
    key?: number;
    username: string;
    real_name: string;
    project_list: { key?: number; id: number; project_name: string; }[];
    one_level: CurrentChild[];
    two_level: CurrentChild[];
  }[]
}[];

export interface LoginResultType {
  id: number;
  identity: number;
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

  [propNmae: string]: any;
}

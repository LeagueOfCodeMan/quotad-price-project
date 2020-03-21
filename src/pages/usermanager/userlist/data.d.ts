import {IdentityType} from "@/utils/utils";

export interface CreateUser {
  identity: IdentityType;
  username: string;
  password: string;
  re_password: string;
  real_name: string;
  company: string;
  addr: string;
  duty: string;
  email: string;
  tel: string;
  area: null | string;

  [propNmae: string]: any;
}

export interface UpdateUser {
  email: string;
  tel: number;

  [propNmae: string]: any;
}


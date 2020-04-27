import {IdentityType} from "@/utils/utils";

export interface CreateUser {
  identity: IdentityType;
  username: string;
  password: string;
  re_password: string;
  real_name: string;
  company: string;
  addr: string;
  email: string;
  tel: string;
  area: number;

  [propNmae: string]: any;
}

